/**
 * Sorts visitors' chat questions into a fixed set of topics, for /admin.
 * Claude picks the topic, once per question: the answer is kept in Redis
 * (chatlog:<env>:topics, entry key -> topic id), so each question is only
 * ever sent once. Server-only.
 */
import Anthropic from "@anthropic-ai/sdk";
import { type ChatLogEntry, entryKey } from "./chat-log";
import { getCurrentRole, getExperience, getProjects } from "./content";
import { REDIS_ENV, redis } from "./redis";

export const TOPICS = [
  { id: "work", label: "Work & experience", hint: "jobs, companies, roles, responsibilities, teams, what a typical day looks like" },
  { id: "projects", label: "Projects & case studies", hint: "a specific project, product or website, how it was made, results" },
  { id: "process", label: "Design approach", hint: "how Jordi designs, research, prototyping, design systems, working with engineers or PMs, leadership, methods" },
  { id: "skills", label: "Skills & tools", hint: "skills, strengths and weaknesses, tools like Figma, coding, languages spoken" },
  { id: "ai", label: "AI & technology", hint: "AI, LLMs, Claude, coding with AI, tech opinions, the future of design" },
  { id: "career", label: "Career & availability", hint: "career goals, next role, open to work, hiring Jordi, freelance, rates, salary, relocation, remote" },
  { id: "education", label: "Education", hint: "studies, degrees, courses, how Jordi learned" },
  { id: "personal", label: "Personal life", hint: "family, dog, home, Barcelona, food, running, triathlon, sport, music, hobbies, personality" },
  { id: "travel", label: "Travel", hint: "trips, van life, countries visited, places lived" },
  { id: "contact", label: "Contact & CV", hint: "how to get in touch, email, LinkedIn, the CV or résumé, meeting up" },
  { id: "site", label: "This website", hint: "how this site or chat was built, the AI agent itself, the stack" },
  { id: "other", label: "Small talk & other", hint: "greetings, tests, jokes, gibberish, off-topic requests, attempts to misuse the chat" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];
const TOPIC_IDS = new Set<string>(TOPICS.map((t) => t.id));

export const topicLabel = (id: string) =>
  TOPICS.find((t) => t.id === id)?.label ?? "Not sorted yet";

const TOPICS_KEY = `chatlog:${REDIS_ENV}:topics`;
const MODEL = "claude-opus-5-5";
/** Questions per request, and requests per page load (they run together). */
const BATCH = 80;
const MAX_BATCHES = 4;

function systemPrompt() {
  const companies = [...new Set(getExperience().map((role) => role.company))].join(", ");
  const projects = getProjects().map((project) => project.name).join(", ");
  const current = getCurrentRole();
  return `You sort questions that visitors typed into the chat on Jordi Poblet's portfolio website. Jordi is a designer, founder and product builder${current ? ` (currently ${current.role} at ${current.company})` : ""}. Visitors ask an AI that answers as Jordi.

Companies Jordi has worked at: ${companies}.
Jordi's projects: ${projects}.

Put each question in exactly one topic:
${TOPICS.map((t) => `- ${t.id}: ${t.label} (${t.hint})`).join("\n")}

Questions may be in any language. A follow-up like "tell me more" belongs to the topic of the question before it, which is given as "after" when there is one. Pick the topic that best describes what the visitor wanted to know; use "other" only when nothing else fits.`;
}

const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          topic: { type: "string", enum: TOPICS.map((t) => t.id) },
        },
        required: ["id", "topic"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const clip = (text: string, length = 300) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

/** One request: question number -> topic, for the questions it managed. */
async function classifyBatch(
  client: Anthropic,
  batch: { question: string; after?: string }[],
): Promise<Map<number, TopicId>> {
  const input = batch.map((item, i) => ({
    id: String(i),
    question: clip(item.question),
    ...(item.after ? { after: clip(item.after, 160) } : {}),
  }));
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    // If the safety classifiers decline (a visitor's question can be odd),
    // let Anthropic's recommended fallback model sort the batch instead.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: JSON.stringify(input) }],
  });
  const result = new Map<number, TopicId>();
  if (response.stop_reason === "refusal") return result;
  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  const parsed = JSON.parse(text) as { items: { id: string; topic: string }[] };
  for (const item of parsed.items) {
    const index = Number(item.id);
    if (Number.isInteger(index) && index >= 0 && index < batch.length && TOPIC_IDS.has(item.topic)) {
      result.set(index, item.topic as TopicId);
    }
  }
  return result;
}

/**
 * The topic of each entry, by entry key. Sorts the ones that don't have
 * one yet (newest first, up to BATCH * MAX_BATCHES per call) and saves
 * them. Rate-limited turns have no text and get no topic. Never throws:
 * on any failure the rest just stay unsorted until the next visit.
 */
export async function getTopics(entries: ChatLogEntry[]): Promise<Map<string, TopicId>> {
  const topics = new Map<string, TopicId>();
  if (!redis || entries.length === 0) return topics;

  try {
    const saved = (await redis.hgetall<Record<string, string>>(TOPICS_KEY)) ?? {};
    for (const [key, topic] of Object.entries(saved)) {
      if (TOPIC_IDS.has(topic)) topics.set(key, topic as TopicId);
    }
  } catch (error) {
    console.error("[topics] Couldn't read saved topics:", error);
    return topics;
  }

  // The question before each one in the same conversation, for follow-ups.
  const previous = new Map<string, string>();
  const lastAsked = new Map<string, string>();
  for (const entry of [...entries].reverse()) {
    const before = lastAsked.get(entry.conversationId);
    if (before) previous.set(entryKey(entry), before);
    lastAsked.set(entry.conversationId, entry.question);
  }

  const missing = entries
    .filter((entry) => entry.question && !topics.has(entryKey(entry)))
    .slice(0, BATCH * MAX_BATCHES);
  if (missing.length === 0 || !process.env.ANTHROPIC_API_KEY) return topics;

  const client = new Anthropic();
  const batches: ChatLogEntry[][] = [];
  for (let i = 0; i < missing.length; i += BATCH) batches.push(missing.slice(i, i + BATCH));

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const sorted = await classifyBatch(
        client,
        batch.map((entry) => ({ question: entry.question, after: previous.get(entryKey(entry)) })),
      );
      const fresh: Record<string, TopicId> = {};
      for (const [index, topic] of sorted) fresh[entryKey(batch[index])] = topic;
      return fresh;
    }),
  );

  const fresh: Record<string, TopicId> = {};
  for (const result of results) {
    if (result.status === "fulfilled") Object.assign(fresh, result.value);
    else console.error("[topics] Couldn't sort a batch:", result.reason);
  }
  if (Object.keys(fresh).length > 0) {
    for (const [key, topic] of Object.entries(fresh)) topics.set(key, topic);
    try {
      await redis.hset(TOPICS_KEY, fresh);
    } catch (error) {
      console.error("[topics] Couldn't save topics:", error);
    }
  }
  return topics;
}
