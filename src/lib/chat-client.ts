/**
 * Browser-side helpers for the chat: message shape, history persistence and
 * reading the streamed /api/chat response.
 */
import type { ChatStreamEvent } from "@/app/api/chat/route";

export interface Message {
  id: string;
  /** Plain text for visitor messages, Markdown for AI replies. */
  text: string;
  isUser: boolean;
  timestamp: Date;
  /** Error/refusal notices are shown but never sent back to the model. */
  isError?: boolean;
}

export const STORAGE_KEY = "chat-history";

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
export function toApiHistory(messages: Message[]) {
  const history: { role: "user" | "assistant"; content: string }[] = [];
  messages.forEach((message, index) => {
    if (message.isError || !message.text.trim()) return;
    const next = messages[index + 1];
    if (message.isUser && next?.isError) return;
    history.push({
      role: message.isUser ? "user" : "assistant",
      content: message.text,
    });
  });
  return history;
}

/** POSTs the conversation and yields events as the reply streams in. */
export async function* streamChat(
  history: ReturnType<typeof toApiHistory>,
  signal: AbortSignal,
): AsyncGenerator<ChatStreamEvent> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
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
