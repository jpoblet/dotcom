/**
 * Browser-side helpers for the chat: message shape, history persistence and
 * reading the streamed /api/chat response.
 */
import type { ChatStreamEvent } from "@/app/api/chat/route";
import type { QuestionSource } from "@/lib/chat-log";
import type { Widget } from "@/lib/widgets";

export interface Message {
  id: string;
  /** Plain text for visitor messages, Markdown for AI replies. */
  text: string;
  isUser: boolean;
  timestamp: Date;
  /** Error/refusal notices are shown but never sent back to the model. */
  isError?: boolean;
  /** Follow-up questions the AI suggested after this reply. */
  suggestions?: string[];
  /** Cards the AI showed under this reply (project, timeline, contact). */
  widgets?: Widget[];
}

export const STORAGE_KEY = "chat-history";
const CONVERSATION_KEY = "chat-conversation-id";

/**
 * Random id for the current chat, so the log can group its questions.
 * Says nothing about the visitor; a new one starts when the chat is reset.
 */
export function getConversationId(): string {
  let id = localStorage.getItem(CONVERSATION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CONVERSATION_KEY, id);
  }
  return id;
}

export function startNewConversation() {
  localStorage.setItem(CONVERSATION_KEY, crypto.randomUUID());
}

/**
 * Replies saved by the previous (OpenAI) version were HTML with inline
 * styles. Convert them to Markdown so they render with the current styling.
 */
function legacyHtmlToMarkdown(text: string): string {
  if (!/<\/?[a-z][^>]*>/i.test(text)) return text;
  return text
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(strong|b)>/gi, "**")
    .replace(/<[^>]+>/g, "");
}

export function loadMessages(): Message[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return (JSON.parse(saved) as (Message & { timestamp: string })[]).map(
      (msg) => ({
        ...msg,
        text: msg.isUser ? msg.text : legacyHtmlToMarkdown(msg.text),
        timestamp: new Date(msg.timestamp),
      }),
    );
  } catch {
    console.error("Failed to parse saved messages");
    return [];
  }
}

export function saveMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

/**
 * Conversation history for the API. Skips error/refusal notices together
 * with the question that caused them, so a failed turn isn't re-sent.
 */
function describeWidget(widget: Widget): string {
  switch (widget.kind) {
    case "project":
      return `project card "${widget.project.name}"`;
    case "timeline":
      return "career timeline";
    case "contact":
      return "contact card";
  }
}

export function toApiHistory(messages: Message[]) {
  const history: { role: "user" | "assistant"; content: string }[] = [];
  messages.forEach((message, index) => {
    if (message.isError) return;
    const next = messages[index + 1];
    if (message.isUser && next?.isError) return;

    // Keep a note of the cards shown, so follow-ups ("tell me more about
    // that one") have context.
    const shown = message.widgets?.length
      ? `[Shown to the visitor: ${message.widgets.map(describeWidget).join(", ")}]`
      : "";
    const content = [shown, message.text.trim()].filter(Boolean).join("\n\n");
    if (!content) return;

    history.push({ role: message.isUser ? "user" : "assistant", content });
  });
  return history;
}

/** POSTs the conversation and yields events as the reply streams in. */
export async function* streamChat(
  history: ReturnType<typeof toApiHistory>,
  signal: AbortSignal,
  source: QuestionSource = "typed",
): AsyncGenerator<ChatStreamEvent> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: history,
      conversationId: getConversationId(),
      source,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    yield { type: "error", message: data.error || "Failed to get a response" };
    return;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as ChatStreamEvent;
    }
  }
}
