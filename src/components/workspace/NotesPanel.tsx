"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Copy, Download, Mail } from "lucide-react";
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

/** A section title that folds its section away. */
function SectionToggle({
  label,
  count,
  open,
  onToggle,
}: {
  label: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between rounded-md px-2 py-2 text-xs font-medium text-foreground-secondary transition-colors hover:bg-background-inverse/6 hover:text-foreground cursor-pointer"
    >
      <span className="font-label">
        {label}
        {count !== undefined && <span className="ml-1.5 tabular-nums tracking-normal">{count}</span>}
      </span>
      <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

interface Props {
  topics: NoteTopic[];
  messages: Message[];
  name: string;
  /** Scrolls the chat to the reply where a topic came up. */
  onJumpTo: (messageId: string) => void;
}

/**
 * The visitor's notes. Before a summary: "Create summary" with a line on
 * what it does, then the talking points, each jumping back to where it
 * came up. Once written, the button goes: the talking points fold away,
 * and the summary opens below with its actions above the write-up.
 */
export default function NotesPanel({ topics, messages, name, onJumpTo }: Props) {
  const [summary, setSummary] = useState<string>();
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  // Talking points start open; once there's a summary they fold away below
  // it, unless the visitor opens them again.
  const [pointsToggle, setPointsToggle] = useState<boolean | null>(null);
  const pointsOpen = pointsToggle ?? !summary;
  const [summaryOpen, setSummaryOpen] = useState(true);
  const about =
    "Writes up our conversation in a few lines, with links to everything we covered, ready to email to yourself, copy or download.";
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
    <div className="px-6 py-8">
      {/* Before a summary: the button and what it does, first. */}
      {!summary && (
        <section>
          <button
            type="button"
            onClick={writeSummary}
            disabled={!hasConversation || writing}
            className="inline-flex items-center gap-2 rounded-full border border-background-inverse/15 px-4 py-2 text-xs transition-colors hover:bg-background-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            {writing ? <span className="shimmer-text">Writing your summary…</span> : "Create summary"}
          </button>
          <p className="mt-3 max-w-md text-xs leading-[1.6] text-foreground-secondary">{about}</p>
          {error && <p className="mt-3 text-xs text-foreground-secondary">{error}</p>}
        </section>
      )}

      {/* Talking points: each one jumps back to where it came up. Once
          there's a summary they fold away above it. */}
      <section className={summary ? "" : "mt-10"}>
        {summary ? (
          <SectionToggle
            label="Talking points"
            count={topics.length}
            open={pointsOpen}
            onToggle={() => setPointsToggle(!pointsOpen)}
          />
        ) : (
          <h2 className="text-xs font-medium text-foreground-secondary">Talking points</h2>
        )}
        {pointsOpen &&
          (topics.length === 0 ? (
            <p className="mt-4 text-sm leading-[1.7] text-foreground-secondary">
              Nothing yet. The topics we talk about will be listed here as we go.
            </p>
          ) : (
            <ol className="animate-suggestion-in mt-3 border-t border-background-inverse/10">
              {topics.map((topic, index) => (
                <li key={topic.label} className="border-b border-background-inverse/10">
                  {/* The whole row goes back to where it came up; an arrow
                      shows on hover. */}
                  <button
                    type="button"
                    onClick={() => onJumpTo(topic.messageId)}
                    title="Go to this part of the conversation"
                    className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-md px-2 py-3.5 text-left transition-colors hover:bg-background-inverse/[0.04] cursor-pointer"
                  >
                    <span className="w-6 text-xs tabular-nums text-foreground-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 truncate text-sm">{topic.label}</span>
                    <ArrowRight
                      size={14}
                      aria-hidden="true"
                      className="-translate-x-1 text-foreground-secondary opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    />
                  </button>
                </li>
              ))}
            </ol>
          ))}
      </section>

      {/* Once written: the summary, folding like the talking points, with
          its actions above the write-up. */}
      {summary && (
        <section className="mt-6">
        <div className="animate-suggestion-in">
          <SectionToggle label="Summary" open={summaryOpen} onToggle={() => setSummaryOpen(!summaryOpen)} />
          {summaryOpen && (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={mailtoHref(subject, toPlainText(summary), siteUrl)}
                  onClick={() => track("Notes emailed")}
                  className="inline-flex items-center gap-2 rounded-full bg-background-inverse px-4 py-2 text-xs text-background hover:opacity-80"
                >
                  <Mail size={14} />
                  Email it to me
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
                  disabled={writing}
                  className="ml-auto text-xs text-foreground-secondary underline underline-offset-2 hover:text-foreground cursor-pointer disabled:opacity-40"
                >
                  {writing ? "Updating…" : "Update"}
                </button>
              </div>
              {error && <p className="mt-3 text-xs text-foreground-secondary">{error}</p>}
              <div className="chat-message mt-5 rounded-sm border border-background-inverse/10 bg-background p-5 text-sm leading-[1.75]">
                <ChatMarkdown text={summary} />
              </div>
            </>
          )}
        </div>
        </section>
      )}
    </div>
  );
}
