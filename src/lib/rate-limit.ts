/**
 * Per-visitor and site-wide limits for the chat, stored in Upstash Redis.
 * Server-only.
 *
 * - A visitor is identified by a salted hash of their IP address; raw IPs
 *   are never stored.
 * - Limits are checked in order (hour, day, site) and a message only counts
 *   against a limit once the earlier ones have passed.
 * - Fails open: if Redis isn't configured (local development) or can't be
 *   reached, the message is allowed and the problem is logged, so the
 *   limiter can never take the chat down. The monthly spend limit in the
 *   Anthropic Console stays the final backstop.
 */
import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LIMITS } from "./limits";

export { LIMITS };

export type RateLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      scope: "visitor-hour" | "visitor-day" | "site-day";
      /** Seconds until the visitor can send again. */
      retryAfter: number;
    };

// The Vercel Marketplace integration may use either naming scheme.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

// Separate counters for production, preview deployments and local runs.
const env = process.env.VERCEL_ENV ?? "local";

function createLimiters() {
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  const common = { redis, analytics: false, timeout: 1000 } as const;
  return {
    hour: new Ratelimit({
      ...common,
      prefix: `chat:${env}:visitor:hour`,
      limiter: Ratelimit.slidingWindow(LIMITS.visitorPerHour, "1 h"),
    }),
    day: new Ratelimit({
      ...common,
      prefix: `chat:${env}:visitor:day`,
      limiter: Ratelimit.slidingWindow(LIMITS.visitorPerDay, "1 d"),
    }),
    site: new Ratelimit({
      ...common,
      prefix: `chat:${env}:site:day`,
      limiter: Ratelimit.fixedWindow(LIMITS.sitePerDay, "1 d"),
    }),
  };
}

const limiters = createLimiters();
let warnedMissingConfig = false;

/** Stable, non-reversible id for the visitor behind a request. */
function visitorId(request: Request): string {
  // On Vercel, x-forwarded-for is set by the platform (first entry is the
  // client); visitors can't spoof it.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const salt = process.env.RATE_LIMIT_SALT ?? "jordipoblet.com";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

const secondsUntil = (resetMs: number) =>
  Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));

export async function checkRateLimit(request: Request): Promise<RateLimitResult> {
  if (!limiters) {
    if (!warnedMissingConfig) {
      console.warn("[rate-limit] Upstash Redis isn't configured; chat is not rate limited.");
      warnedMissingConfig = true;
    }
    return { allowed: true };
  }

  try {
    const id = visitorId(request);

    const checks = [
      ["visitor-hour", () => limiters.hour.limit(id)],
      ["visitor-day", () => limiters.day.limit(id)],
      ["site-day", () => limiters.site.limit("all")],
    ] as const;

    for (const [scope, check] of checks) {
      const result = await check();
      // On a Redis timeout the library allows the request; stop there rather
      // than waiting out the remaining checks too.
      if (result.reason === "timeout") {
        console.warn("[rate-limit] Redis timed out; message allowed.");
        return { allowed: true };
      }
      if (!result.success) {
        return { allowed: false, scope, retryAfter: secondsUntil(result.reset) };
      }
    }
    return { allowed: true };
  } catch (error) {
    console.error("[rate-limit] Redis error; message allowed:", error);
    return { allowed: true };
  }
}
