/**
 * Every notice the chat shows that isn't written by the AI: rate limits,
 * errors and refusals. They appear in grey in the chat (Markdown) and are
 * never sent back to the model. Edit the wording here.
 *
 * Waits are always phrased the way a person would say them ("a few
 * minutes", "an hour", "tomorrow"), never as exact countdowns.
 */
import { LIMITS } from "./limits";

/** Rounds a wait into everyday language. */
export function waitTime(seconds: number): string {
  const minutes = seconds / 60;
  if (minutes <= 1.5) return "a minute";
  if (minutes <= 10) return "a few minutes";
  if (minutes <= 20) return "a quarter of an hour";
  if (minutes <= 40) return "half an hour";
  return "an hour";
}

export const NOTICES = {
  /** One visitor sent too many messages within an hour. */
  visitorHourLimit: (retryAfterSeconds: number) =>
    `You've reached my hourly limit of ${LIMITS.visitorPerHour} questions. Every answer here is generated live by an AI model and has a real cost, so each visitor gets a fair share and no single person (or bot) can drain the chat for everyone else.\n\nThe hour is a rolling window, so questions free up as older ones age out. Give me ${waitTime(retryAfterSeconds)} and ask away.`,

  /** One visitor reached the daily message limit. */
  visitorDayLimit: () =>
    `That's ${LIMITS.visitorPerDay} questions today, my daily limit per visitor. The hourly cap stops bursts, and this one stops a very determined visitor (or a script) from spending the budget meant for everyone.\n\nVisitors are counted by an anonymised fingerprint of their connection, never by personal data. It rolls over within 24 hours, so come back tomorrow.`,

  /** The whole site reached its daily message budget. */
  siteDayLimit: () =>
    `The chat has answered its ${LIMITS.sitePerDay} questions for today, so it's taking a break. On top of the per-visitor limits there's a site-wide daily cap that works like a circuit breaker: if a wave of traffic arrives, the monthly budget stays predictable instead of running out halfway through the month.\n\nIt reopens at midnight UTC, so try again tomorrow.`,

  /** The Anthropic workspace's monthly spend limit was reached. */
  monthlyBudgetReached: () =>
    "The chat has used up its budget for this month. It runs on a fixed monthly spend limit, so its costs can never get out of hand.\n\nIt switches itself back on at the start of next month.",

  /** Too many requests at Anthropic's side (their rate limit). */
  providerBusy: () =>
    "The AI provider is asking me to slow down for a moment, which usually means a lot of people are chatting at once. Give it a few seconds and try again.",

  /** Anthropic is temporarily overloaded. */
  providerOverloaded: () =>
    "The AI model behind this chat is overloaded right now, which happens occasionally at peak times. Give it a minute and try again.",

  /** Any other server-side failure. */
  genericError: (email: string) =>
    `Sorry, something went wrong on my side. Try again in a minute, or email me at ${email}.`,

  /** The browser couldn't reach the server (offline, network error). */
  connectionError: (email: string) =>
    `Sorry, I couldn't connect. Check your connection and try again, or email me at ${email}.`,

  /** Claude's safety filters declined the question. */
  refusal: () =>
    "The AI's safety filters declined that one, so I can't answer it here. Ask me about my work, my projects or my life instead.",
};
