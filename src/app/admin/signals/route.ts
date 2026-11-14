import { getEntriesSince, isRedisConfigured, isUnsure } from "@/lib/chat-log";
import { getAnalytics } from "@/lib/umami";

/**
 * GET /admin/signals?since=YYYY-MM-DD
 *
 * A digest of what happened on the site since the last content update, for
 * the content-update interview (.claude/skills/content-update): what
 * visitors asked, which answers the chat couldn't give, and site analytics.
 * Read-only. Password-protected like the rest of /admin (src/proxy.ts).
 * Defaults to the last 92 days.
 */
export const dynamic = "force-dynamic";

/** Enough for a quarter of a busy portfolio; older questions are dropped. */
const MAX_ENTRIES = 2000;

function excerpt(text: string, length = 320) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > length ? `${flat.slice(0, length - 1)}…` : flat;
}

function count<T>(items: T[], key: (item: T) => string | undefined) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const k = key(item) ?? "unknown";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("since");
  const since =
    param && !Number.isNaN(Date.parse(param))
      ? new Date(param)
      : new Date(Date.now() - 92 * 24 * 60 * 60 * 1000);
  const now = new Date();

  const { entries, truncated } = await getEntriesSince(since, MAX_ENTRIES);

  // Questions people actually typed say the most; starters and follow-up
  // chips are the site's own suggestions.
  const asked = entries.map((entry) => ({
    at: entry.at,
    source: entry.source,
    country: entry.country,
    question: excerpt(entry.question, 400),
    outcome: entry.outcome,
    cards: entry.cards,
    reply: excerpt(entry.reply),
    unsure: isUnsure(entry),
  }));

  return Response.json({
    window: { since: since.toISOString(), until: now.toISOString() },
    chat: {
      configured: isRedisConfigured(),
      total: entries.length,
      truncated,
      conversations: new Set(entries.map((entry) => entry.conversationId)).size,
      bySource: count(entries, (entry) => entry.source),
      byOutcome: count(entries, (entry) => entry.outcome),
      byCountry: count(entries, (entry) => entry.country),
      cardsShown: count(
        entries.flatMap((entry) => entry.cards),
        (card) => card,
      ),
      /** Answers where the chat didn't know, or that failed: content gaps. */
      gaps: asked.filter(
        (entry) => entry.unsure || entry.outcome !== "answered",
      ),
      typed: asked.filter((entry) => entry.source === "typed"),
    },
    analytics: await getAnalytics(since, now),
  });
}
