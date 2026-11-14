import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  OUTCOME_LABELS,
  PageHead,
  RangePicker,
  SOURCE_LABELS,
  SectionHead,
  countryName,
  formatNumber,
  formatTime,
} from "@/components/admin/ui";
import { type ChatLogEntry, entryKey, isUnsure } from "@/lib/chat-log";
import { loadRange, parseRange } from "@/lib/admin-insights";
import { TOPICS, topicLabel } from "@/lib/question-topics";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = { title: "Questions" };

type Params = { range?: string; topic?: string; q?: string; typed?: string };
type Props = { searchParams: Promise<Params> };

/** Questions on the overview, per topic, before "See all". */
const PREVIEW = 5;

/** The same question asked more than once, shown once with a count. */
interface Asked {
  question: string;
  latest: ChatLogEntry;
  times: number;
  sources: Set<string>;
}

const normalise = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function fold(entries: ChatLogEntry[]): Asked[] {
  const map = new Map<string, Asked>();
  for (const entry of entries) {
    const key = normalise(entry.question);
    const found = map.get(key);
    if (found) {
      found.times++;
      found.sources.add(entry.source);
    } else {
      map.set(key, { question: entry.question, latest: entry, times: 1, sources: new Set([entry.source]) });
    }
  }
  // Most asked first; ties by most recent (entries arrive newest first).
  return [...map.values()].sort((a, b) => b.times - a.times);
}

function href(params: Params, change: Partial<Params>) {
  const next = { ...params, ...change };
  const query = new URLSearchParams(
    Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();
  return `/admin/questions${query ? `?${query}` : ""}`;
}

function Question({ item, range }: { item: Asked; range: string }) {
  const { latest } = item;
  const place = [latest.city, latest.country && countryName(latest.country)].filter(Boolean).join(", ");
  const flag = latest.outcome !== "answered" ? OUTCOME_LABELS[latest.outcome] : isUnsure(latest) ? "Didn't know" : null;
  return (
    <li className="py-4">
      <div className="flex items-baseline gap-3">
        <p className="min-w-0 flex-1 text-base text-pretty">{item.question}</p>
        {item.times > 1 && (
          <span title={`Asked ${item.times} times`} className="shrink-0 rounded-full bg-background-inverse/6 px-2 py-0.5 font-mono text-xs tabular-nums">
            ×{item.times}
          </span>
        )}
      </div>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-xs text-foreground-secondary">
        <span className="font-mono tabular-nums">{formatTime(latest.at)}</span>
        {place && <span>· {place}</span>}
        <span>· {[...item.sources].map((s) => SOURCE_LABELS[s] ?? s).join(", ")}</span>
        {flag && <span className="rounded-full border border-background-inverse/20 px-2 text-foreground">{flag}</span>}
        <span>·</span>
        <Link
          href={`/admin/conversations?range=${range}&c=${encodeURIComponent(latest.conversationId)}`}
          className="underline underline-offset-2 hover:text-foreground"
        >
          Conversation
        </Link>
      </p>
      {latest.reply && (
        <details className="group/reply mt-2 text-xs">
          <summary className="w-fit cursor-pointer list-none text-foreground-secondary underline underline-offset-2 hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span className="group-open/reply:hidden">Show the answer</span>
            <span className="hidden group-open/reply:inline">Hide the answer</span>
          </summary>
          <p className="mt-3 border-l border-background-inverse/15 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground-secondary">
            {latest.reply}
          </p>
        </details>
      )}
    </li>
  );
}

export default async function QuestionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = parseRange(params.range);
  const { entries, topics } = await loadRange(range);
  const query = params.q?.trim() ?? "";
  const typedOnly = params.typed === "1";

  // Rate-limited questions have no text: nothing to show.
  const visible = entries.filter(
    (e) =>
      e.question &&
      (!typedOnly || e.source === "typed") &&
      (!query || normalise(`${e.question} ${e.reply}`).includes(normalise(query))),
  );
  const topicOf = (e: ChatLogEntry) => topics.get(entryKey(e)) ?? "unsorted";
  const isGap = (e: ChatLogEntry) => isUnsure(e) || (e.outcome !== "answered" && e.outcome !== "aborted");

  const groups = [...TOPICS.map((t) => t.id as string), "unsorted"]
    .map((id) => ({ id, entries: visible.filter((e) => topicOf(e) === id) }))
    .filter((g) => g.entries.length > 0)
    .sort((a, b) => b.entries.length - a.entries.length);
  const gaps = visible.filter(isGap);

  const selected = params.topic;
  const shown =
    selected === "gaps"
      ? [{ id: "gaps", entries: gaps }]
      : selected
        ? groups.filter((g) => g.id === selected)
        : groups;

  const navItem = (id: string | undefined, label: string, count: number) => {
    const active = selected === id;
    return (
      <Link
        key={id ?? "all"}
        href={href(params, { topic: id })}
        aria-current={active ? "page" : undefined}
        className={`flex shrink-0 items-baseline justify-between gap-4 rounded-md px-2.5 py-1.5 text-sm transition-colors max-lg:rounded-full max-lg:border max-lg:border-background-inverse/10 max-lg:px-3 max-lg:py-1 max-lg:text-xs ${
          active
            ? "bg-background-inverse/8 text-foreground max-lg:bg-background-inverse max-lg:text-foreground-inverse"
            : "text-foreground-secondary hover:bg-background-inverse/6 hover:text-foreground"
        }`}
      >
        <span className="truncate">{label}</span>
        <span className="font-mono text-xs tabular-nums">{count}</span>
      </Link>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHead
        title="Questions"
        subtitle={`${formatNumber(visible.length)} questions, sorted by topic · ${range.days ? `last ${range.label}` : "all time"}`}
      >
        <RangePicker path="/admin/questions" current={range} params={{ topic: params.topic, q: params.q, typed: params.typed }} />
      </PageHead>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <form action="/admin/questions" className="group/field flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-background-inverse/20 py-1 pr-1 pl-4 transition-[border-color,box-shadow] duration-200 focus-within:border-background-inverse/60 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-background-inverse)_7%,transparent)] sm:max-w-md">
          <Search size={15} aria-hidden="true" className="shrink-0 text-foreground-secondary" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search questions and answers…"
            aria-label="Search questions and answers"
            className="min-h-9 min-w-0 flex-1 bg-transparent text-sm placeholder:text-foreground-secondary focus:outline-none"
          />
          {[["range", range.id], ["topic", params.topic], ["typed", params.typed]].map(
            ([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />,
          )}
        </form>
        <Link
          href={href(params, { typed: typedOnly ? undefined : "1" })}
          aria-pressed={typedOnly}
          className={`rounded-full border px-3.5 py-2 text-xs transition-colors ${
            typedOnly
              ? "border-background-inverse bg-background-inverse text-foreground-inverse"
              : "border-background-inverse/20 text-foreground-secondary hover:border-background-inverse/60 hover:text-foreground"
          }`}
        >
          Only what they typed
        </Link>
        {query && (
          <Link href={href(params, { q: undefined })} className="text-xs text-foreground-secondary underline underline-offset-2 hover:text-foreground">
            Clear search
          </Link>
        )}
      </div>

      <div className="mt-10 gap-12 lg:grid lg:grid-cols-[14rem_1fr]">
        {/* Topics: a sticky list on desktop, a row of pills on phones. */}
        <aside className="max-lg:-mx-4 max-lg:overflow-x-auto max-lg:px-4 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Topics" className="flex gap-1.5 lg:flex-col lg:gap-0.5">
            {navItem(undefined, "All topics", visible.length)}
            {groups.map((g) => navItem(g.id, topicLabel(g.id), g.entries.length))}
            <span aria-hidden="true" className="my-2 hidden h-px bg-background-inverse/10 lg:block" />
            {navItem("gaps", "Couldn't answer", gaps.length)}
          </nav>
        </aside>

        <div className="min-w-0 max-lg:mt-8">
          {shown.length === 0 || shown.every((g) => g.entries.length === 0) ? (
            <p className="text-sm text-foreground-secondary">
              {query ? `No questions match “${query}”.` : "No questions in this range yet."}
            </p>
          ) : (
            <div className="flex flex-col gap-14">
              {shown.map((group) => {
                const items = fold(group.entries);
                const preview = !selected && items.length > PREVIEW;
                return (
                  <section key={group.id}>
                    <SectionHead
                      title={group.id === "gaps" ? "Couldn't really answer" : topicLabel(group.id)}
                      aside={`${formatNumber(group.entries.length)}${items.length !== group.entries.length ? ` · ${items.length} different` : ""}`}
                    />
                    <ul className="divide-y divide-background-inverse/8">
                      {(preview ? items.slice(0, PREVIEW) : items).map((item) => (
                        <Question key={entryKey(item.latest)} item={item} range={range.id} />
                      ))}
                    </ul>
                    {preview && (
                      <Link
                        href={href(params, { topic: group.id })}
                        className="mt-2 inline-block rounded-full border border-background-inverse/20 px-3.5 py-1.5 text-xs transition-colors hover:border-background-inverse/60"
                      >
                        See all {items.length} in {topicLabel(group.id)}
                      </Link>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
