import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, after } from "next/server";
import {
  type Topic,
  WRAP_UP,
  buildTools,
  parseFollowUps,
  parseTopics,
  runTool,
} from "@/lib/chat-tools";
import {
  buildKnowledgeBase,
  getProfile,
  pickConversationStarter,
  pickLiveProjects,
} from "@/lib/content";
import {
  type ChatLogEntry,
  type ChatOutcome,
  QUESTION_SOURCES,
  type QuestionSource,
  countRateLimited,
  logChatTurn,
  requestLocation,
} from "@/lib/chat-log";
import { NOTICES } from "@/lib/notices";
import { type RateLimitResult, checkRateLimit } from "@/lib/rate-limit";
import type { Widget } from "@/lib/widgets";

export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
/** Most recent messages sent to the model (older turns are dropped). */
const MAX_HISTORY = 20;
/** Longest visitor message accepted, in characters. */
const MAX_MESSAGE_CHARS = 2000;
/** Model calls per reply: display tools first, then the written answer. */
const MAX_STEPS = 3;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Emoji (including flags, skin tones, keycaps and ZWJ sequences) plus one
// preceding space. Built with new RegExp so the TS target doesn't limit the
// flags. Keeps the text symbols (c), (r) and TM.
const EMOJI = new RegExp(
  "[ \\t]?(?:(?![\\u00A9\\u00AE\\u2122])\\p{Extended_Pictographic}|\\p{Regional_Indicator})(?:\\p{Extended_Pictographic}|\\p{Emoji_Modifier}|[\\uFE0F\\u200D\\u20E3])*|[\\uFE0F\\u20E3]",
  "gu",
);

/** Safety net for the "no emojis" rule in the system prompt. */
function stripEmoji(text: string): string {
  return text.replace(EMOJI, "");
}

/** Newline-delimited JSON events streamed to the browser. */
export type ChatStreamEvent =
  | { type: "text"; text: string }
  | { type: "widget"; widget: Widget }
  | { type: "suggestions"; questions: string[] }
  | { type: "topics"; topics: Topic[] }
  | { type: "done" }
  | { type: "refusal"; message: string }
  | { type: "error"; message: string };

function buildSystemPrompt(): string {
  const profile = getProfile();
  const first = profile.name.split(" ")[0];
  return `You are the AI on ${profile.name}'s portfolio website. Instead of browsing case studies, visitors (often recruiters, hiring managers and fellow designers) ask about ${first}'s work, background and life, and you answer in the first person as ${first}.

How to answer:
- Speak as ${first}: warm, direct and a little playful, like a relaxed conversation over coffee. No corporate speak.
- Keep replies short, usually one to three sentences, leading with the most relevant specifics (companies, roles, dates, places). Go longer only when the visitor asks for detail.
- Sound like ${first} remembering and talking, not like a document being read out. Never copy or closely paraphrase sentences from the knowledge base: retell things in fresh words each time, the way you'd tell the same story differently to a different person. Pick the details that fit this particular question, vary how you open and structure replies, and don't reuse phrasing from your earlier replies in the conversation.
- Never mention where your answers come from: no "notes", "knowledge base", "documents", "what I've written" or "here on this site".
- Only state facts the knowledge base supports; never invent projects, employers, metrics, dates or opinions. When something isn't covered, answer the way a person would when they don't recall or haven't thought about it ("I don't remember exactly", "honestly, I'm not sure", "that's not something I've given much thought"), varying the wording, and move on to something related you can talk about when it fits naturally.
- Never use emojis or emoticons, in any reply.
- Health: share only what the knowledge base says about the cancer diagnosis and treatment, calmly and without drama. Never guess at medical details, prognosis or anything left out.
- Stop when the answer is complete. Don't close with offers or sign-offs such as "feel free to ask" or "email me if you have more questions". Mention the email address only when the visitor asks how to get in touch.
- Write in Markdown. Link to a project only when the knowledge base lists a page for it, as [Project name](/projects/slug). Links to ${first}'s public profiles listed below are fine.
- You have display tools that show the visitor a project card, the career timeline or a contact card under your reply. Use one when it genuinely helps the answer, not on every turn. Call the tools first, then write your reply: a short note that complements what's shown instead of repeating it or describing the card.
- After your written reply, call wrap_up with two or three questions the visitor might want to ask next and the topics your reply covered. It's always the last call of a reply.
- Earlier replies may start with a note like "[Shown to the visitor: ...]". It records cards you displayed; never write such notes yourself.
- If a visitor asks whether they're talking to the real ${first}, be upfront: you're an AI that answers as ${first}, not ${first} typing live.
- Stay on topic: ${first}, his work, design, and the things he would happily chat about. Politely steer unrelated requests (coding help, homework, general assistant tasks) back to ${first}.
- Reply in the visitor's language.

<knowledge_base>
${buildKnowledgeBase()}
</knowledge_base>`;
}

// The knowledge base and tools only change on deploy, so build them once per
// server instance in production. In development, rebuild them on every
// request so edits in /content show up without a restart.
let cached: { system: string; tools: Anthropic.Beta.BetaTool[] } | undefined;
function getPromptAndTools() {
  if (process.env.NODE_ENV !== "production") {
    return { system: buildSystemPrompt(), tools: buildTools() };
  }
  cached ??= { system: buildSystemPrompt(), tools: buildTools() };
  return cached;
}

/**
 * Assistant content to send back for the next step. After a mid-output
 * fallback, model-internal blocks from before the switch must be dropped.
 */
function contentToEcho(
  content: Anthropic.Beta.BetaContentBlock[],
): Anthropic.Beta.BetaContentBlockParam[] {
  const lastFallback = content.findLastIndex((b) => b.type === "fallback");
  if (lastFallback === -1) return content;
  return content.filter(
    (block, index) =>
      index > lastFallback ||
      (block.type !== "thinking" &&
        block.type !== "redacted_thinking" &&
        block.type !== "tool_use"),
  );
}

/** Validates the request body and returns a history the API will accept. */
function parseMessages(body: unknown): ChatMessage[] | string {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return "messages is required";

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    const { role, content } = (item ?? {}) as Record<string, unknown>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return "Invalid message format";
    }
    if (!content.trim()) continue;
    messages.push({ role, content });
  }

  const last = messages.at(-1);
  if (!last || last.role !== "user") return "The last message must be from the user";
  if (last.content.length > MAX_MESSAGE_CHARS) {
    return `Messages are limited to ${MAX_MESSAGE_CHARS} characters`;
  }

  // Keep the most recent turns, starting on a user message.
  const recent = messages.slice(-MAX_HISTORY);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent;
}

/**
 * Spend limits reached: the workspace limit set in the Console (HTTP 400,
 * "You have reached your specified workspace API usage limits") or the
 * usage tier's cap (HTTP 429, "You have reached your API usage limits").
 * The API has no dedicated error type for the first, so match the message.
 */
function isSpendLimitError(error: unknown): boolean {
  return (
    (error instanceof Anthropic.BadRequestError ||
      error instanceof Anthropic.RateLimitError) &&
    /usage limits/i.test(error.message)
  );
}

function friendlyError(error: unknown): string {
  if (isSpendLimitError(error)) return NOTICES.monthlyBudgetReached();
  // The visitor has to wait a moment: point them to live projects meanwhile.
  if (error instanceof Anthropic.RateLimitError) {
    return NOTICES.providerBusy(pickLiveProjects());
  }
  if (error instanceof Anthropic.APIError && error.status === 529) {
    return NOTICES.providerOverloaded(pickLiveProjects());
  }
  return NOTICES.genericError(getProfile().email);
}

/** Where the question came from and which chat it belongs to (for the log). */
function parseLogContext(body: unknown): {
  conversationId: string;
  source: QuestionSource;
} {
  const { conversationId, source } = (body ?? {}) as Record<string, unknown>;
  return {
    conversationId:
      typeof conversationId === "string" && /^[\w-]{1,64}$/.test(conversationId)
        ? conversationId
        : "unknown",
    source: QUESTION_SOURCES.includes(source as QuestionSource)
      ? (source as QuestionSource)
      : "typed",
  };
}

function cardId(widget: Widget): string {
  return widget.kind === "project" ? `project:${widget.project.slug}` : widget.kind;
}

function rateLimitNotice(limit: Exclude<RateLimitResult, { allowed: true }>): string {
  switch (limit.scope) {
    case "visitor-hour":
      return NOTICES.visitorHourLimit(limit.retryAfter);
    case "visitor-day":
      return NOTICES.visitorDayLimit();
    case "site-day":
      return NOTICES.siteDayLimit();
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = parseMessages(body);
  if (typeof messages === "string") {
    return Response.json({ error: messages }, { status: 400 });
  }

  const logContext = parseLogContext(body);
  const location = requestLocation(request);

  // Checked before calling Claude, so limited messages cost nothing.
  const limit = await checkRateLimit(request);
  if (!limit.allowed) {
    after(() => countRateLimited(logContext.source, location));
    return Response.json(
      { error: rateLimitNotice(limit), code: "rate_limited", scope: limit.scope },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const encoder = new TextEncoder();
  let abortStream: (() => void) | undefined;

  // What happened in this turn, stored once the response has finished.
  const turn: ChatLogEntry = {
    at: new Date().toISOString(),
    ...logContext,
    ...location,
    question: messages.at(-1)!.content,
    reply: "",
    cards: [],
    followUps: [],
    outcome: "answered",
  };
  let finishTurn: (outcome: ChatOutcome) => void = () => {};
  const turnFinished = new Promise<void>((resolve) => {
    let finished = false;
    finishTurn = (outcome) => {
      if (finished) return;
      finished = true;
      turn.outcome = outcome;
      resolve();
    };
  });
  after(async () => {
    await turnFinished;
    await logChatTurn(turn);
  });

  const responseBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) => {
        if (event.type === "text") turn.reply += event.text;
        if (event.type === "widget") turn.cards.push(cardId(event.widget));
        if (event.type === "suggestions") turn.followUps = event.questions;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };
      let outcome: ChatOutcome = "answered";

      try {
        // Reads ANTHROPIC_API_KEY (or another configured credential).
        const client = new Anthropic();
        const { system, tools } = getPromptAndTools();
        const conversation: Anthropic.Beta.BetaMessageParam[] = [...messages];
        let sentText = false;
        let lastStop: string | null = null;

        for (let step = 0; step < MAX_STEPS; step++) {
          const stream = client.beta.messages.stream(
            {
              model: MODEL,
              max_tokens: 16000,
              // Chat replies are short: low effort keeps them fast and cheap.
              output_config: { effort: "low" },
              // If the safety classifiers decline a (benign) question, retry
              // it on Anthropic's recommended fallback model instead.
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              tools,
              // Cache tools + knowledge base (shared by every visitor) and,
              // automatically, the growing conversation.
              system: [
                { type: "text", text: system, cache_control: { type: "ephemeral" } },
              ],
              cache_control: { type: "ephemeral" },
              messages: conversation,
            },
            { signal: request.signal },
          );
          abortStream = () => stream.abort();

          let stepHasText = false;
          stream.on("text", (delta) => {
            const text = stripEmoji(delta);
            if (!text) return;
            // Separate text written in different steps into paragraphs.
            if (!stepHasText && sentText) send({ type: "text", text: "\n\n" });
            stepHasText = sentText = true;
            send({ type: "text", text });
          });

          const final = await stream.finalMessage();
          lastStop = final.stop_reason;

          if (process.env.NODE_ENV !== "production") {
            const u = final.usage;
            console.log(
              `[chat] step=${step} ${final.model} stop=${final.stop_reason} in=${u.input_tokens} out=${u.output_tokens} cache_read=${u.cache_read_input_tokens} cache_write=${u.cache_creation_input_tokens}`,
            );
          }

          if (final.stop_reason !== "tool_use") break;

          const toolCalls = final.content.filter((b) => b.type === "tool_use");
          const followUpCall = toolCalls.find((b) => b.name === WRAP_UP);
          if (followUpCall) {
            const questions = parseFollowUps(followUpCall.input);
            if (questions.length) send({ type: "suggestions", questions });
            const topics = parseTopics(followUpCall.input);
            if (topics.length) send({ type: "topics", topics });
          }
          // Follow-ups come last: once they're in and the reply is written,
          // the turn is over, with no extra model call.
          if (sentText && toolCalls.every((b) => b.name === WRAP_UP)) {
            break;
          }

          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const block of toolCalls) {
            if (block.name === WRAP_UP) {
              results.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: "Noted. Now write your reply to the visitor; don't call wrap_up again.",
              });
              continue;
            }
            const outcome = runTool(block.name, block.input);
            if (outcome.widget) send({ type: "widget", widget: outcome.widget });
            results.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: outcome.result,
              is_error: outcome.isError,
            });
          }
          conversation.push(
            { role: "assistant", content: contentToEcho(final.content) },
            { role: "user", content: results },
          );
        }

        if (lastStop === "refusal") outcome = "refusal";
        send(
          lastStop === "refusal"
            ? { type: "refusal", message: NOTICES.refusal(pickConversationStarter()) }
            : { type: "done" },
        );
      } catch (error) {
        if (request.signal.aborted) {
          outcome = "aborted";
          return;
        }
        outcome = "error";
        console.error("[chat] Claude request failed:", error);
        send({ type: "error", message: friendlyError(error) });
      } finally {
        finishTurn(outcome);
        try {
          controller.close();
        } catch {
          // Already closed because the visitor navigated away.
        }
      }
    },
    cancel() {
      finishTurn("aborted");
      abortStream?.();
    },
  });

  return new Response(responseBody, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
