import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  OUTCOME_LABELS,
  PageHead,
  RangePicker,
  SOURCE_LABELS,
  cardLabel,
  countryName,
  formatNumber,
  formatTime,
} from "@/components/admin/ui";
import { type ChatLogEntry, entryKey, isUnsure } from "@/lib/chat-log";
import { loadRange, parseRange } from "@/lib/admin-insights";
import { getProjects } from "@/lib/content";
import { topicLabel } from "@/lib/question-topics";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Conversations" };

type Props = { searchParams: Promise<{ range?: string; page?: string; c?: string }> };

const PAGE_SIZE = 20;

/** Conversations, newest first, each with its questions oldest first. */
function byConversation(entries: ChatLogEntry[]) {
  const map = new Map<string, ChatLogEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.conversationId) ?? [];
    list.push(entry);
    map.set(entry.conversationId, list);
  }
  return [...map].map(([id, list]) => ({ id, entries: list.reverse() }));
}

export default async function ConversationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = parseRange(params.range);
  const { entries, topics } = await loadRange(range);
  const all = byConversation(entries);
  const only = params.c ? all.filter((c) => c.id === params.c) : null;
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(params.page) || 1));
  const list = only ?? all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const projects = new Map(getProjects().map((p) => [p.slug, p.name]));
  const pageHref = (n: number) => `/admin/conversations?range=${range.id}&page=${n}`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHead
        title={only ? "Conversation" : "Conversations"}
        subtitle={
          only
            ? undefined
            : `${formatNumber(all.length)} conversations, newest first · ${range.days ? `last ${range.label}` : "all time"}`
        }
      >
        {!only && <RangePicker path="/admin/conversations" current={range} />}
      </PageHead>

      {only && (
        <Link
          href={`/admin/conversations?range=${range.id}`}
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          All conversations
        </Link>
      )}

      <div className="mt-10 flex flex-col gap-4">
        {list.map((conversation) => {
          const first = conversation.entries[0];
          const place = [first.city, first.country && countryName(first.country)].filter(Boolean).join(", ");
          return (
            <section key={conversation.id} className="rounded-2xl border border-background-inverse/10 p-5 sm:p-6">
              <p className="flex flex-wrap gap-x-2 text-xs text-foreground-secondary">
                <span className="font-mono tabular-nums">{formatTime(first.at)}</span>
                {place && <span>· {place}</span>}
                <span>
                  · {conversation.entries.length} {conversation.entries.length === 1 ? "question" : "questions"}
                </span>
              </p>
              <ol className="mt-4 flex flex-col gap-5">
                {conversation.entries.map((entry) => {
                  const topic = topics.get(entryKey(entry));
                  const flag =
                    entry.outcome !== "answered" ? OUTCOME_LABELS[entry.outcome] : isUnsure(entry) ? "Didn't know" : null;
                  return (
                    <li key={entry.at} className="flex flex-col gap-1.5">
                      <p className="text-base text-pretty">{entry.question || "(question not kept)"}</p>
                      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-foreground-secondary">
                        {topic && (
                          <Link
                            href={`/admin/questions?range=${range.id}&topic=${topic}`}
                            className="rounded-full bg-background-inverse/6 px-2 py-0.5 text-foreground transition-colors hover:bg-background-inverse/10"
                          >
                            {topicLabel(topic)}
                          </Link>
                        )}
                        <span>{SOURCE_LABELS[entry.source] ?? entry.source}</span>
                        {flag && <span className="rounded-full border border-background-inverse/20 px-2 text-foreground">{flag}</span>}
                      </p>
                      {entry.reply && (
                        <details className="group/reply text-xs" open={Boolean(only)}>
                          <summary className="w-fit cursor-pointer list-none text-foreground-secondary underline underline-offset-2 hover:text-foreground [&::-webkit-details-marker]:hidden">
                            <span className="group-open/reply:hidden">Show the answer</span>
                            <span className="hidden group-open/reply:inline">Hide the answer</span>
                          </summary>
                          <p className="mt-3 border-l border-background-inverse/15 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground-secondary">
                            {entry.reply}
                          </p>
                        </details>
                      )}
                      {(entry.cards.length > 0 || entry.followUps.length > 0) && (
                        <p className="text-xs text-foreground-secondary">
                          {entry.cards.length > 0 && `Cards: ${entry.cards.map((c) => cardLabel(c, projects)).join(", ")}`}
                          {entry.cards.length > 0 && entry.followUps.length > 0 && " · "}
                          {entry.followUps.length > 0 && `Suggested next: ${entry.followUps.join(" / ")}`}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
        {list.length === 0 && (
          <p className="text-sm text-foreground-secondary">
            {only ? "That conversation isn't in this range." : "No conversations in this range yet."}
          </p>
        )}
      </div>

      {!only && pages > 1 && (
        <nav aria-label="Pages" className="mt-10 flex items-center justify-between text-xs">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="rounded-full border border-background-inverse/20 px-3.5 py-1.5 hover:border-background-inverse/60">
              Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono tabular-nums text-foreground-secondary">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className="rounded-full border border-background-inverse/20 px-3.5 py-1.5 hover:border-background-inverse/60">
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
