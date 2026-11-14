/**
 * Signing in to /admin. The password is ADMIN_PASSWORD; signing in sets a
 * cookie holding an HMAC of a fixed message keyed by that password, so the
 * cookie stops working the moment the password changes and can't be forged
 * without knowing it. Used by src/proxy.ts and the login action.
 *
 * Web Crypto only, so it runs wherever the proxy runs.
 */
export const ADMIN_COOKIE = "admin_session";
/** Thirty days: long enough not to be a chore on a personal admin. */
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Compares without bailing out at the first difference. */
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The cookie value for the current password. */
export function sessionToken(password: string): Promise<string> {
  return hmac(password, "jordipoblet.com admin session v1");
}

export async function isValidSession(token: string | undefined, password: string) {
  if (!token) return false;
  return sameText(token, await sessionToken(password));
}

/** HMAC both sides first, so the comparison takes the same time whatever the length. */
export async function isValidPassword(given: string, password: string) {
  const [a, b] = await Promise.all([hmac("compare", given), hmac("compare", password)]);
  return sameText(a, b);
}

/** Only paths inside /admin are allowed as a place to return to after signing in. */
export function safeAdminPath(next: unknown): string {
  return typeof next === "string" && /^\/admin(\/[\w-]*)*(\?[^\s]*)?$/.test(next) && !next.startsWith("/admin/login")
    ? next
    : "/admin";
}
