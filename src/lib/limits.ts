/**
 * Chat limits. Shared by the rate limiter (server) and the notices that
 * explain them (shown in the browser), so the numbers can't drift apart.
 */
export const LIMITS = {
  visitorPerHour: 15,
  visitorPerDay: 50,
  sitePerDay: 300,
} as const;
