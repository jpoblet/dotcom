"use client";

import { useState } from "react";
import { ArrowRight, Check, Copy, Download, Mail } from "lucide-react";
import ChatMarkdown from "@/components/ChatMarkdown";
import { track } from "@/lib/analytics";
import { type Message, toApiHistory } from "@/lib/chat-client";
import type { NoteTopic } from "@/lib/use-chat-session";

/** Markdown to plain text for an email body: links become "text (url)". */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "- ")
    .trim();
}

/** Mail apps cut very long links, so the body stays well under 2,000 characters. */
function mailtoHref(subject: string, body: string, siteUrl: string): string {
  const limit = 1700;
  const text =
    body.length > limit ? `${body.slice(0, limit).trimEnd()}…\n\nMore at ${siteUrl}` : body;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}

interface Props {
  topics: NoteTopic[];
  messages: Message[];
  name: string;
  onOpenProject: (slug: string) => void;
}

/**
 * The visitor's notes: the topics covered so far, and one action fixed at
 * the bottom to write up the conversation and send it to themselves.
 */
export default function NotesPanel({ topics, messages, name, onOpenProject }: Props) {
  const [summary, setSummary] = useState<string>();
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const hasConversation = messages.some((m) => m.isUser);

  const writeSummary = async () => {
    setWriting(true);
    setError(undefined);
    track("Notes written");
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiHistory(messages),
          topics: topics.map((t) => ({ label: t.label, note: t.notes.join(" ") })),
        }),
      });
      const data = (await response.json()) as { summary?: string; error?: string };
      if (!response.ok || !data.summary) throw new Error(data.error ?? "Couldn't write the summary.");
      setSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't write the summary.");
    } finally {
      setWriting(false);
    }
  };

  const subject = `Notes from my chat with ${name}`;
  const siteUrl = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 px-6 py-8">
        <h2 className="text-xs font-medium text-foreground-secondary">Topics so far</h2>
        {topics.length === 0 ? (
          <p className="mt-4 text-sm leading-[1.7] text-foreground-secondary">
            Nothing yet. The topics we talk about will be listed here as we go.
          </p>
        ) : (
          <ol className="mt-3 border-t border-background-inverse/10">
            {topics.map((topic, index) => (
              <li
                key={topic.label}
                className="animate-suggestion-in flex items-center gap-4 border-b border-background-inverse/10 py-3.5"
              >
                <span className="w-6 text-xs tabular-nums text-foreground-secondary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm">{topic.label}</span>
                {topic.project && (
                  <button
                    type="button"
                    onClick={() => onOpenProject(topic.project!)}
                    className="group inline-flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground cursor-pointer"
                  >
                    Open
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}

        {summary && (
          <div className="animate-suggestion-in mt-10">
            <h2 className="text-xs font-medium text-foreground-secondary">Summary</h2>
            <div className="chat-message mt-3 rounded-sm border border-background-inverse/10 p-5 text-sm leading-[1.7]">
              <ChatMarkdown text={summary} />
            </div>
          </div>
        )}
      </div>

      {/* Fixed at the bottom of the panel. */}
      <div className="sticky bottom-0 border-t border-background-inverse/10 bg-background px-6 py-4">
        {!summary ? (
          <>
            <button
              type="button"
              onClick={writeSummary}
              disabled={!hasConversation || writing}
              className="w-full rounded-lg bg-background-inverse px-4 py-3 text-sm text-background transition-opacity hover:opacity-85 cursor-pointer disabled:cursor-default disabled:bg-background-inverse/10 disabled:text-foreground-secondary"
            >
              {writing ? (
                <span className="shimmer-text">Writing your summary…</span>
              ) : (
                "Write up and send me a summary of this conversation"
              )}
            </button>
            {error && <p className="mt-2 text-xs text-foreground-secondary">{error}</p>}
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={mailtoHref(subject, toPlainText(summary), siteUrl)}
              onClick={() => track("Notes emailed")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-background-inverse px-4 py-3 text-sm text-background hover:opacity-85"
            >
              <Mail size={15} />
              Send it to me
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(summary);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              aria-label="Copy the summary"
              title="Copy"
              className="flex size-11 items-center justify-center rounded-lg border border-background-inverse/15 hover:bg-background-secondary cursor-pointer"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
            <a
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(summary)}`}
              download={`${name.toLowerCase().replace(/\s+/g, "-")}-notes.md`}
              aria-label="Download the summary"
              title="Download"
              className="flex size-11 items-center justify-center rounded-lg border border-background-inverse/15 hover:bg-background-secondary"
            >
              <Download size={15} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
