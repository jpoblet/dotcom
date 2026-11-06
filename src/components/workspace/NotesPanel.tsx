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
 * The visitor's notes: topics collected as the conversation goes, and a
 * written summary they can email to themselves, copy or download.
 */
export default function NotesPanel({ topics, messages, name, onOpenProject }: Props) {
  const [summary, setSummary] = useState<string>();
  const [status, setStatus] = useState<"idle" | "writing" | "error">("idle");
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const hasConversation = messages.some((m) => m.isUser);

  const writeSummary = async () => {
    setStatus("writing");
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
      if (!response.ok || !data.summary) throw new Error(data.error ?? "Couldn't write the notes.");
      setSummary(data.summary);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't write the notes.");
      setStatus("error");
    }
  };

  const subject = `Notes from my chat with ${name}`;
  const siteUrl = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <div className="mx-auto max-w-[44rem] px-6 sm:px-10 py-10">
      <p className="text-xs text-foreground-secondary">
        What we&apos;ve talked about, collected as we go.
      </p>

      {topics.length === 0 ? (
        <p className="mt-10 text-sm leading-[1.75] text-foreground-secondary">
          Nothing yet. Ask me something and the topics we cover will appear here, like
          notes taken during a conversation.
        </p>
      ) : (
        <ol className="mt-8 border-t border-background-inverse/10">
          {topics.map((topic, index) => (
            <li
              key={topic.label}
              className="animate-suggestion-in grid grid-cols-[2rem_1fr] gap-x-3 border-b border-background-inverse/10 py-4"
            >
              <span className="pt-0.5 text-xs tabular-nums text-foreground-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium">{topic.label}</h3>
                  {topic.project && (
                    <button
                      type="button"
                      onClick={() => onOpenProject(topic.project!)}
                      className="group inline-flex shrink-0 items-center gap-1 text-xs text-foreground-secondary hover:text-foreground cursor-pointer"
                    >
                      Open
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
                <ul className="mt-1.5 space-y-1">
                  {topic.notes.map((note) => (
                    <li key={note} className="text-xs leading-[1.7] text-foreground-secondary">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}

      <section className="mt-14">
        <h2 className="text-xs font-medium text-foreground-secondary">
          Conversation summary
        </h2>
        {!summary && (
          <>
            <p className="mt-3 text-sm leading-[1.75] text-foreground-secondary">
              A short write-up of our conversation, with links to everything we covered, to keep
              or send to yourself.
            </p>
            <button
              type="button"
              onClick={writeSummary}
              disabled={!hasConversation || status === "writing"}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-background-inverse/15 px-4 py-2 text-xs hover:bg-background-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {status === "writing" ? (
                <span className="shimmer-text">Writing your notes…</span>
              ) : (
                "Write up the conversation"
              )}
            </button>
            {error && <p className="mt-3 text-xs text-foreground-secondary">{error}</p>}
          </>
        )}

        {summary && (
          <div className="animate-suggestion-in mt-5">
            <div className="chat-message rounded-sm border border-background-inverse/10 bg-background p-6 text-sm leading-[1.75]">
              <ChatMarkdown text={summary} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={mailtoHref(subject, toPlainText(summary), siteUrl)}
                onClick={() => track("Notes emailed")}
                className="inline-flex items-center gap-2 rounded-full bg-background-inverse px-4 py-2 text-xs text-background hover:opacity-80"
              >
                <Mail size={14} />
                Email them to me
              </a>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-background-inverse/15 px-4 py-2 text-xs hover:bg-background-secondary cursor-pointer"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={`data:text/markdown;charset=utf-8,${encodeURIComponent(summary)}`}
                download={`${name.toLowerCase().replace(/\s+/g, "-")}-notes.md`}
                className="inline-flex items-center gap-2 rounded-full border border-background-inverse/15 px-4 py-2 text-xs hover:bg-background-secondary"
              >
                <Download size={14} />
                Download
              </a>
              <button
                type="button"
                onClick={writeSummary}
                disabled={status === "writing"}
                className="ml-auto text-xs text-foreground-secondary underline underline-offset-2 hover:text-foreground cursor-pointer disabled:opacity-40"
              >
                {status === "writing" ? "Updating…" : "Update"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
