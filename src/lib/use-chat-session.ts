"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  type Message,
  loadMessages,
  saveMessages,
  startNewConversation,
  streamChat,
  toApiHistory,
} from "@/lib/chat-client";
import type { QuestionSource } from "@/lib/chat-log";
import { NOTICES } from "@/lib/notices";
import type { Widget } from "@/lib/widgets";

/** A topic in the visitor's notes, with every note recorded for it. */
export interface NoteTopic {
  label: string;
  notes: string[];
  project?: string;
  /** The reply where it first came up, to jump back to. */
  messageId: string;
}

/** Topics across the conversation, merged by label, in order of first mention. */
function collectTopics(messages: Message[]): NoteTopic[] {
  const byLabel = new Map<string, NoteTopic>();
  for (const message of messages) {
    for (const topic of message.topics ?? []) {
      const key = topic.label.toLowerCase();
      const existing = byLabel.get(key);
      if (existing) {
        if (!existing.notes.includes(topic.note)) existing.notes.push(topic.note);
        existing.project ??= topic.project;
      } else {
        byLabel.set(key, {
          label: topic.label,
          notes: [topic.note],
          project: topic.project,
          messageId: message.id,
        });
      }
    }
  }
  return [...byLabel.values()];
}

/**
 * The chat's state and actions: history (kept in localStorage), streaming
 * replies with their cards, follow-ups and topics, and resetting.
 */
export function useChatSession(email: string, onWidget?: (widget: Widget) => void) {
  // Called for cards arriving live (not ones restored from history).
  const onWidgetRef = useRef(onWidget);
  useEffect(() => {
    onWidgetRef.current = onWidget;
  }, [onWidget]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Latest messages, for building the history sent with a new question.
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Restore history after hydration (reading it during render would
  // mismatch the server-rendered HTML).
  useEffect(() => {
    const timeout = setTimeout(() => setMessages(loadMessages()));
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !isLoading) saveMessages(messages);
  }, [messages, isLoading]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (text: string, source: QuestionSource = "typed") => {
      const question = text.trim();
      if (!question || abortRef.current) return;
      track("Chat question", { source });

      const userMessage: Message = {
        id: crypto.randomUUID(),
        text: question,
        isUser: true,
        timestamp: new Date(),
      };
      const replyId = crypto.randomUUID();
      const history = toApiHistory([...messagesRef.current, userMessage]);
      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: replyId, text: "", isUser: false, timestamp: new Date() },
      ]);
      setIsLoading(true);

      const update = (change: (reply: Message) => Message) =>
        setMessages((prev) => prev.map((m) => (m.id === replyId ? change(m) : m)));
      const fail = (message: string) => update((m) => ({ ...m, text: message, isError: true }));

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        for await (const event of streamChat(history, controller.signal, source)) {
          if (event.type === "text") update((m) => ({ ...m, text: m.text + event.text }));
          else if (event.type === "widget") {
            if (event.widget.kind === "project") {
              track("Project card shown", { project: event.widget.project.slug });
            }
            update((m) => ({ ...m, widgets: [...(m.widgets ?? []), event.widget] }));
            onWidgetRef.current?.(event.widget);
          } else if (event.type === "suggestions") {
            update((m) => ({ ...m, suggestions: event.questions }));
          } else if (event.type === "topics") {
            update((m) => ({ ...m, topics: event.topics }));
          } else if (event.type === "refusal" || event.type === "error") {
            fail(event.message);
          }
        }
      } catch {
        if (!controller.signal.aborted) fail(NOTICES.connectionError(email));
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [email],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setMessages([]);
    saveMessages([]);
    startNewConversation();
  }, []);

  const topics = useMemo(() => collectTopics(messages), [messages]);

  return { messages, isLoading, send, reset, topics };
}
