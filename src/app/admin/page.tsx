import type { Metadata } from "next";
import Link from "next/link";
import {
  type ChatLogEntry,
  type Stats,
  getEntries,
  getStats,
  isRedisConfigured,
} from "@/lib/chat-log";

// Private page (see src/proxy.ts): always fresh, never indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Chat log",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 50;

type Props = { searchParams: Promise<{ page?: string }> };

/** Counters under one prefix ("country:ES" -> "ES"), largest first. */
function group(stats: Stats, prefix: string): [string, number][] {
  return Object.entries(stats)
    .filter(([key]) => key.startsWith(`${prefix}:`))
    .map(([key, value]): [string, number] => [key.slice(prefix.length + 1), value])
    .sort((a, b) => b[1] - a[1]);
}

const LABELS: Record<string, string> = {
  answered: "Answered",
  refusal: "Declined by safety filters",
  error: "Errors",
  aborted: "Left before the reply finished",
  rate_limited: "Rate limited",
  typed: "Typed",
  starter: "Starter question",
  follow_up: "Follow-up chip",
  project_page: "From a project page",
};

function StatList({ title, rows }: { title: string; rows: [string, number][] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs text-foreground-secondary">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {rows.slice(0, 12).map(([label, value]) => (
          <li key={label} className="flex justify-between gap-4">
            <span>{LABELS[label] ?? label}</span>
            <span className="tabular-nums text-foreground-secondary">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatsBlock({ title, stats }: { title: string; stats: Stats }) {
  return (
    <section className="rounded-sm border border-background-inverse/10 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="text-2xl tabular-nums">{stats.questions ?? 0}</p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <StatList title="Outcome" rows={group(stats, "outcome")} />
        <StatList title="How the question was asked" rows={group(stats, "source")} />
        <StatList title="Countries" rows={group(stats, "country")} />
        <StatList title="Cards shown" rows={group(stats, "card")} />
      </div>
    </section>
  );
}

/** Consecutive entries of the same conversation, oldest question first. */
function byConversation(entries: ChatLogEntry[]) {
  const groups: { id: string; entries: ChatLogEntry[] }[] = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last && last.id === entry.conversationId) last.entries.push(entry);
    else groups.push({ id: entry.conversationId, entries: [entry] });
  }
  return groups.map((g) => ({ ...g, entries: g.entries.reverse() }));
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });

export default async function AdminPage({ searchParams }: Props) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const month = new Date().toISOString().slice(0, 7);
  const [allTime, thisMonth, { entries, total }] = await Promise.all([
    getStats("all"),
    getStats(month),
    getEntries((page - 1) * PAGE_SIZE, PAGE_SIZE),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="w-full max-w-3xl mx-auto px-6 pt-12 sm:pt-16 pb-40 sm:pb-48">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-medium">Chat log</h1>
        <Link href="/" className="text-xs underline underline-offset-2">
          Back to the site
        </Link>
      </div>

      {!isRedisConfigured() && (
        <p className="mt-6 text-sm text-foreground-secondary">
          Redis isn&apos;t configured here, so nothing is being logged.
        </p>
      )}

      <div className="mt-10 grid gap-4">
        <StatsBlock title={`This month (${month})`} stats={thisMonth} />
        <StatsBlock title="All time" stats={allTime} />
      </div>

      <h2 className="mt-16 text-base font-medium">
        Questions <span className="text-foreground-secondary">({total})</span>
      </h2>

      <div className="mt-6 space-y-6">
        {byConversation(entries).map((conversation) => {
          const first = conversation.entries[0];
          return (
            <section
              key={`${conversation.id}-${first.at}`}
              className="rounded-sm border border-background-inverse/10 p-6"
            >
              <p className="text-xs text-foreground-secondary">
                {formatTime(first.at)}
                {first.city || first.country
                  ? ` · ${[first.city, first.country].filter(Boolean).join(", ")}`
                  : ""}
                {conversation.entries.length > 1
                  ? ` · ${conversation.entries.length} questions`
                  : ""}
              </p>
              <ol className="mt-4 space-y-5">
                {conversation.entries.map((entry) => (
                  <li key={entry.at} className="space-y-2">
                    <p className="text-sm font-medium">
                      {entry.question}
                      <span className="ml-2 text-xs font-normal text-foreground-secondary">
                        {LABELS[entry.source] ?? entry.source}
                        {entry.outcome !== "answered"
                          ? ` · ${LABELS[entry.outcome] ?? entry.outcome}`
                          : ""}
                      </span>
                    </p>
                    {entry.reply && (
                      <details className="text-sm text-foreground-secondary">
                        <summary className="cursor-pointer text-xs">Reply</summary>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                          {entry.reply}
                        </p>
                      </details>
                    )}
                    {(entry.cards.length > 0 || entry.followUps.length > 0) && (
                      <p className="text-xs text-foreground-secondary">
                        {entry.cards.length > 0 && `Cards: ${entry.cards.join(", ")}`}
                        {entry.cards.length > 0 && entry.followUps.length > 0 && " · "}
                        {entry.followUps.length > 0 &&
                          `Suggested: ${entry.followUps.join(" / ")}`}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
        {total === 0 && (
          <p className="text-sm text-foreground-secondary">No questions yet.</p>
        )}
      </div>

      {pages > 1 && (
        <nav className="mt-10 flex justify-between text-xs">
          {page > 1 ? (
            <Link href={`/admin?page=${page - 1}`} className="underline underline-offset-2">
              Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-foreground-secondary">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={`/admin?page=${page + 1}`} className="underline underline-offset-2">
              Older
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
