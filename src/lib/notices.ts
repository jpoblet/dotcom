/**
 * Every notice the chat shows that isn't written by the AI: rate limits,
 * errors and refusals. They appear in grey in the chat and are never sent
 * back to the model. Edit the wording here.
 */

export const NOTICES = {
  /** One visitor sent too many messages within an hour. */
  visitorHourLimit: (minutes: number) =>
    `You've asked me a lot in a short time. Give me about ${minutes} ${minutes === 1 ? "minute" : "minutes"} and ask again.`,

  /** One visitor reached the daily message limit. */
  visitorDayLimit: () =>
    "That's all the questions I can answer for you today. Come back tomorrow and we'll pick it up from here.",

  /** The whole site reached its daily message budget. */
  siteDayLimit: () =>
    "The chat has had a busy day and is taking a break until tomorrow.",

  /** The Anthropic workspace's monthly spend limit was reached. */
  monthlyBudgetReached: () =>
    "The chat is taking a break until next month.",

  /** Too many requests at Anthropic's side (their rate limit). */
  providerBusy: () =>
    "Lots of people are asking me things right now. Give it a few seconds and try again.",

  /** Anthropic is temporarily overloaded. */
  providerOverloaded: () =>
    "The AI is a bit overloaded right now. Please try again in a moment.",

  /** Any other server-side failure. */
  genericError: (email: string) =>
    `Sorry, something went wrong on my side. Try again, or email me at ${email}.`,

  /** The browser couldn't reach the server (offline, network error). */
  connectionError: (email: string) =>
    `Sorry, I couldn't connect. Please try again, or email me at ${email}.`,

  /** Claude's safety filters declined the question. */
  refusal: () =>
    "That's not something I can help with here. Ask me about my work, my projects or my life instead.",
};
