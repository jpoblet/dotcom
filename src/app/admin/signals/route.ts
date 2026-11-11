import {
  type ChatLogEntry,
  getEntries,
  isRedisConfigured,
} from "@/lib/chat-log";
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

/**
 * Replies where the chat said it didn't know: the system prompt tells it to
 * answer like a person who doesn't recall, so these phrases mark gaps in
 * the content. English only and approximate on purpose (the chat replies
 * in the visitor's language): the interview reads every reply anyway.
 */
const UNSURE =
  /\b(don'?t|do not) (really )?(remember|recall|know)\b|\bnot (really |entirely |totally )?sure\b|\bhaven'?t (really |ever )*(thought|given|decided|looked)\b|\b(not|isn'?t|wasn'?t) (really )?something I'?ve\b|\bnever (really )?(thought|given)\b|\bno idea\b|\bcan'?t (really )?(say|tell|share)\b|\brather (not|talk|chat|discuss)\b/i;

const PAGE = 200;
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

  // The log is newest first: page through until we pass `since`.
  const entries: ChatLogEntry[] = [];
  let truncated = false;
  if (isRedisConfigured()) {
    for (let offset = 0; ; offset += PAGE) {
      const { entries: page } = await getEntries(offset, PAGE);
      const recent = page.filter((entry) => new Date(entry.at) >= since);
      entries.push(...recent);
      if (recent.length < page.length || page.length < PAGE) break;
      if (entries.length >= MAX_ENTRIES) {
        truncated = true;
        break;
      }
    }
  }

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
    unsure: entry.outcome === "answered" && UNSURE.test(entry.reply),
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
