/**
 * What /admin shows, worked out from the chat log: the time range picked
 * in the address, then counts, trends and rankings over the entries in it.
 * Server-only.
 */
import { type ChatLogEntry, entryKey, getEntriesSince, isUnsure } from "./chat-log";
import { type TopicId, TOPICS, getTopics } from "./question-topics";

export const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "all", label: "All time", days: null },
] as const;
export type RangeId = (typeof RANGES)[number]["id"];
export type Range = (typeof RANGES)[number];

export function parseRange(value: unknown): Range {
  return RANGES.find((r) => r.id === value) ?? RANGES[1];
}

/** Everything is shown in Jordi's time zone. */
export const TIME_ZONE = "Europe/Madrid";
const DAY = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 3000;

/** "YYYY-MM-DD" in Madrid time. */
const dayOf = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
const hourOf = (date: Date) =>
  Number(date.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: TIME_ZONE })) % 24;

export interface Loaded {
  range: Range;
  since: Date | null;
  /** In the range, newest first. */
  entries: ChatLogEntry[];
  /** The range before it, the same length (empty for "all"). */
  previous: ChatLogEntry[];
  topics: Map<string, TopicId>;
  truncated: boolean;
}

/** The entries in the range (and the one before, for trends), with topics. */
export async function loadRange(range: Range): Promise<Loaded> {
  const now = Date.now();
  const since = range.days ? new Date(now - range.days * DAY) : null;
  const before = range.days ? new Date(now - 2 * range.days * DAY) : null;
  const { entries: all, truncated } = await getEntriesSince(before, MAX_ENTRIES);
  const entries = since ? all.filter((e) => new Date(e.at) >= since) : all;
  const previous = since ? all.filter((e) => new Date(e.at) < since) : [];
  const topics = await getTopics(entries);
  return { range, since, entries, previous, topics, truncated };
}

export type Ranked = { key: string; count: number }[];

function rank<T>(items: T[], keyOf: (item: T) => string | undefined | (string | undefined)[]): Ranked {
  const counts = new Map<string, number>();
  for (const item of items) {
    const keys = keyOf(item);
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      if (key === undefined) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

/** The first question of each conversation: where and how it started. */
function conversationStarts(entries: ChatLogEntry[]) {
  const first = new Map<string, ChatLogEntry>();
  for (const entry of entries) first.set(entry.conversationId, entry); // newest first: the last one wins
  return [...first.values()];
}

/** Change against the previous period, as a whole percentage (null when there's nothing to compare). */
const change = (now: number, before: number) =>
  before > 0 ? Math.round(((now - before) / before) * 100) : null;

export function summarise({ range, entries, previous, topics }: Loaded) {
  const conversations = conversationStarts(entries);
  const previousConversations = new Set(previous.map((e) => e.conversationId)).size;
  const typed = entries.filter((e) => e.source === "typed").length;
  const gaps = entries.filter((e) => isUnsure(e) || (e.outcome !== "answered" && e.outcome !== "aborted"));

  // Questions per day; for all time, per month once it spans more than 120 days.
  const oldest = entries.at(-1) ? new Date(entries.at(-1)!.at) : new Date();
  const span = range.days ?? Math.ceil((Date.now() - oldest.getTime()) / DAY) + 1;
  const monthly = span > 120;
  const buckets = new Map<string, number>();
  if (monthly) {
    const cursor = new Date(oldest.getFullYear(), oldest.getMonth(), 1);
    while (cursor <= new Date()) {
      buckets.set(cursor.toLocaleDateString("en-CA", { timeZone: TIME_ZONE }).slice(0, 7), 0);
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    for (let i = span - 1; i >= 0; i--) buckets.set(dayOf(new Date(Date.now() - i * DAY)), 0);
  }
  for (const entry of entries) {
    const key = monthly ? dayOf(new Date(entry.at)).slice(0, 7) : dayOf(new Date(entry.at));
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1);
  }

  const hours = Array.from({ length: 24 }, () => 0);
  for (const entry of entries) hours[hourOf(new Date(entry.at))]++;

  const topicCounts = rank(entries, (e) => (e.question ? topics.get(entryKey(e)) ?? "unsorted" : undefined));
  // Every topic, even at zero, so the list doesn't jump around between ranges.
  const byTopic = [
    ...TOPICS.map((t) => ({ key: t.id as string, count: topicCounts.find((c) => c.key === t.id)?.count ?? 0 })),
    ...topicCounts.filter((c) => c.key === "unsorted"),
  ].sort((a, b) => b.count - a.count);

  return {
    questions: entries.length,
    questionsChange: range.days ? change(entries.length, previous.length) : null,
    conversations: conversations.length,
    conversationsChange: range.days ? change(conversations.length, previousConversations) : null,
    perConversation: conversations.length ? entries.length / conversations.length : 0,
    typedShare: entries.length ? typed / entries.length : 0,
    answeredShare: entries.length
      ? entries.filter((e) => e.outcome === "answered" && !isUnsure(e)).length / entries.length
      : 0,
    gaps,
    timeline: { monthly, points: [...buckets].map(([key, count]) => ({ key, count })) },
    hours,
    byTopic,
    // By conversation, so one chatty visitor doesn't outweigh ten others.
    countries: rank(conversations, (e) => e.country ?? "unknown"),
    cities: rank(conversations, (e) => (e.city ? `${e.city}|${e.country ?? ""}` : undefined)),
    sources: rank(entries, (e) => e.source),
    outcomes: rank(entries, (e) => e.outcome),
    cards: rank(entries, (e) => e.cards),
  };
}

export type Summary = ReturnType<typeof summarise>;

/** The window to ask Umami about: the range, or since the first question for all time. */
export function analyticsWindow({ since, entries }: Loaded): [Date, Date] {
  const now = new Date();
  const first = entries.at(-1);
  return [since ?? (first ? new Date(first.at) : new Date(now.getTime() - 365 * DAY)), now];
}
