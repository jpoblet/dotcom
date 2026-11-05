/**
 * Shared Upstash Redis connection (rate limits and the chat log).
 * Server-only. Returns null when Redis isn't configured, e.g. locally.
 */
import { Redis } from "@upstash/redis";

// The Vercel Marketplace integration may use either naming scheme.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

/** Keeps production, preview deployments and local runs apart. */
export const REDIS_ENV = process.env.VERCEL_ENV ?? "local";

export const redis: Redis | null = url && token ? new Redis({ url, token }) : null;
