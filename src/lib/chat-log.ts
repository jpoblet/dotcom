/**
 * A record of every chat question and its answer, kept in Upstash Redis
 * with no expiry, plus running totals per month. Nothing that identifies a
 * visitor is stored: no IP address, only the country and city Vercel
 * derives from it, and a random id per conversation. Server-only.
 *
 * Keys (env = production / preview / local):
 *   chatlog:<env>:entries        list of JSON entries, newest first
 *   chatlog:<env>:stats:all      hash of all-time counters
 *   chatlog:<env>:stats:YYYY-MM  hash of counters for that month
 */
import { REDIS_ENV, redis } from "./redis";

export const QUESTION_SOURCES = [
  "typed",
  "starter",
  "follow_up",
  "project_page",
] as const;
export type QuestionSource = (typeof QUESTION_SOURCES)[number];

export type ChatOutcome = "answered" | "refusal" | "error" | "aborted" | "rate_limited";

export interface ChatLogEntry {
  at: string;
  conversationId: string;
  source: QuestionSource;
  country?: string;
  city?: string;
  question: string;
  reply: string;
  /** Cards shown under the reply, e.g. "project:glovo-delivery-flow", "timeline". */
  cards: string[];
  followUps: string[];
  outcome: ChatOutcome;
}

const prefix = `chatlog:${REDIS_ENV}`;
const ENTRIES = `${prefix}:entries`;
const statsKey = (period: string) => `${prefix}:stats:${period}`;

/** Country and city from Vercel's geolocation headers (absent locally). */
export function requestLocation(request: Request): { country?: string; city?: string } {
  const country = request.headers.get("x-vercel-ip-country") ?? undefined;
  const rawCity = request.headers.get("x-vercel-ip-city");
  let city: string | undefined;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  return { country, city };
}

function counters(entry: Pick<ChatLogEntry, "source" | "country" | "cards" | "outcome">) {
  const fields = [
    "questions",
    `outcome:${entry.outcome}`,
    `source:${entry.source}`,
    `country:${entry.country ?? "unknown"}`,
    ...entry.cards.map((card) => `card:${card}`),
  ];
  return fields;
}

async function bumpStats(fields: string[], at: Date) {
  if (!redis) return;
  const month = at.toISOString().slice(0, 7);
  const pipeline = redis.pipeline();
  for (const field of fields) {
    pipeline.hincrby(statsKey("all"), field, 1);
    pipeline.hincrby(statsKey(month), field, 1);
  }
  await pipeline.exec();
}

/** Stores a finished turn. Never throws: logging must not break the chat. */
export async function logChatTurn(entry: ChatLogEntry): Promise<void> {
  if (!redis) return;
  try {
    await redis.lpush(ENTRIES, JSON.stringify(entry));
    await bumpStats(counters(entry), new Date(entry.at));
  } catch (error) {
    console.error("[chat-log] Couldn't store the turn:", error);
  }
}

/**
 * Rate-limited questions only count in the totals; their text isn't kept,
 * so a bot hammering the chat can't fill the log.
 */
export async function countRateLimited(
  source: QuestionSource,
  location: { country?: string },
): Promise<void> {
  if (!redis) return;
  try {
    await bumpStats(
      counters({ source, country: location.country, cards: [], outcome: "rate_limited" }),
      new Date(),
    );
  } catch (error) {
    console.error("[chat-log] Couldn't count the limited question:", error);
  }
}

export type Stats = Record<string, number>;

export async function getStats(period: "all" | string): Promise<Stats> {
  if (!redis) return {};
  const raw = (await redis.hgetall<Record<string, number | string>>(statsKey(period))) ?? {};
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number(v)]));
}

export async function getEntries(
  offset: number,
  count: number,
): Promise<{ entries: ChatLogEntry[]; total: number }> {
  if (!redis) return { entries: [], total: 0 };
  const [raw, total] = await Promise.all([
    redis.lrange<ChatLogEntry | string>(ENTRIES, offset, offset + count - 1),
    redis.llen(ENTRIES),
  ]);
  // The client parses JSON automatically; tolerate both shapes.
  const entries = raw.map((item) =>
    typeof item === "string" ? (JSON.parse(item) as ChatLogEntry) : item,
  );
  return { entries, total };
}

export function isRedisConfigured(): boolean {
  return redis !== null;
}

const PAGE = 200;

/**
 * Every entry since a date, newest first, paging through the log until it
 * passes that date. Stops at `max` (truncated: true) so a busy log can't
 * make a page slow.
 */
export async function getEntriesSince(
  since: Date | null,
  max = 2000,
): Promise<{ entries: ChatLogEntry[]; truncated: boolean }> {
  const entries: ChatLogEntry[] = [];
  if (!redis) return { entries, truncated: false };
  for (let offset = 0; ; offset += PAGE) {
    const { entries: page } = await getEntries(offset, PAGE);
    const recent = since ? page.filter((entry) => new Date(entry.at) >= since) : page;
    entries.push(...recent);
    if (recent.length < page.length || page.length < PAGE) break;
    if (entries.length >= max) return { entries: entries.slice(0, max), truncated: true };
  }
  return { entries, truncated: false };
}

/** A stable id for an entry: they have none of their own. */
export const entryKey = (entry: Pick<ChatLogEntry, "conversationId" | "at">) =>
  `${entry.conversationId}|${entry.at}`;

/**
 * Replies where the chat said it didn't know: the system prompt tells it to
 * answer like a person who doesn't recall, so these phrases mark gaps in
 * the content. English only and approximate on purpose (the chat replies
 * in the visitor's language).
 */
const UNSURE =
  /\b(don'?t|do not) (really )?(remember|recall|know)\b|\bnot (really |entirely |totally )?sure\b|\bhaven'?t (really |ever )*(thought|given|decided|looked)\b|\b(not|isn'?t|wasn'?t) (really )?something I'?ve\b|\bnever (really )?(thought|given)\b|\bno idea\b|\bcan'?t (really )?(say|tell|share)\b|\brather (not|talk|chat|discuss)\b/i;

/** An answer the chat couldn't really give: a gap in the content. */
export const isUnsure = (entry: Pick<ChatLogEntry, "outcome" | "reply">) =>
  entry.outcome === "answered" && UNSURE.test(entry.reply);
