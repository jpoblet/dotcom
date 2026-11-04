import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { buildKnowledgeBase, getProfile } from "@/lib/content";

export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
/** Most recent messages sent to the model (older turns are dropped). */
const MAX_HISTORY = 20;
/** Longest visitor message accepted, in characters. */
const MAX_MESSAGE_CHARS = 2000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Newline-delimited JSON events streamed to the browser. */
export type ChatStreamEvent =
  | { type: "text"; text: string }
  | { type: "done" }
  | { type: "refusal" }
  | { type: "error"; message: string };

function buildSystemPrompt(): string {
  const profile = getProfile();
  const first = profile.name.split(" ")[0];
  return `You are the AI on ${profile.name}'s portfolio website. Instead of browsing case studies, visitors (often recruiters, hiring managers and fellow designers) ask about ${first}'s work, background and life, and you answer in the first person as ${first}.

How to answer:
- Speak as ${first}: warm, direct and a little playful, like a relaxed conversation over coffee. No corporate speak.
- Keep replies short, usually one to three sentences, leading with the most relevant specifics (companies, roles, dates, places). Go longer only when the visitor asks for detail.
- Only state what the knowledge base below supports. If something isn't covered, say you haven't written about it here yet and suggest emailing ${profile.email}. Never invent projects, employers, metrics or opinions.
- Write in Markdown. Link to a project only when the knowledge base lists a page for it, as [Project name](/projects/slug). Links to ${first}'s public profiles listed below are fine.
- If asked, be upfront that you are an AI answering from ${first}'s own notes, not ${first} typing live.
- Stay on topic: ${first}, his work, design, and the things he would happily chat about. Politely steer unrelated requests (coding help, homework, general assistant tasks) back to ${first}.
- Reply in the visitor's language.

<knowledge_base>
${buildKnowledgeBase()}
</knowledge_base>`;
}

// The knowledge base only changes on deploy, so build the prompt once per
// server instance in production. In development, rebuild it on every request
// so edits in /content show up without a restart.
let cachedSystemPrompt: string | undefined;
function getSystemPrompt(): string {
  if (process.env.NODE_ENV !== "production") return buildSystemPrompt();
  cachedSystemPrompt ??= buildSystemPrompt();
  return cachedSystemPrompt;
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

function friendlyError(error: unknown): string {
  const email = getProfile().email;
  if (error instanceof Anthropic.RateLimitError) {
    return "Lots of people are asking me things right now. Give it a few seconds and try again.";
  }
  if (error instanceof Anthropic.APIError && error.status === 529) {
    return "The AI is a bit overloaded right now. Please try again in a moment.";
  }
  return `Sorry, something went wrong on my side. Try again, or email me at ${email}.`;
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

  const encoder = new TextEncoder();
  let abortStream: (() => void) | undefined;

  const responseBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatStreamEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        // Reads ANTHROPIC_API_KEY (or another configured credential).
        const client = new Anthropic();

        const stream = client.beta.messages.stream(
          {
            model: MODEL,
            max_tokens: 16000,
            // Chat replies are short: low effort keeps them fast and cheap.
            output_config: { effort: "low" },
            // If the safety classifiers decline a (benign) question, retry it
            // on Anthropic's recommended fallback model instead of failing.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            // Cache the knowledge base (shared by every visitor) and,
            // automatically, the growing conversation.
            system: [
              {
                type: "text",
                text: getSystemPrompt(),
                cache_control: { type: "ephemeral" },
              },
            ],
            cache_control: { type: "ephemeral" },
            messages,
          },
          { signal: request.signal },
        );

        abortStream = () => stream.abort();
        stream.on("text", (text) => send({ type: "text", text }));

        const final = await stream.finalMessage();

        if (process.env.NODE_ENV !== "production") {
          const { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } =
            final.usage;
          console.log(
            `[chat] ${final.model} stop=${final.stop_reason} in=${input_tokens} out=${output_tokens} cache_read=${cache_read_input_tokens} cache_write=${cache_creation_input_tokens}`,
          );
        }

        send(final.stop_reason === "refusal" ? { type: "refusal" } : { type: "done" });
      } catch (error) {
        if (request.signal.aborted) return;
        console.error("[chat] Claude request failed:", error);
        send({ type: "error", message: friendlyError(error) });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed because the visitor navigated away.
        }
      }
    },
    cancel() {
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
