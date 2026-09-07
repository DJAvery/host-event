const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const HOST_CODE_PATTERN = /^\d{4}$/;

// Uses the Web Crypto API (not Node's `crypto` module) so this file works
// identically in both the Node.js API routes and the Edge proxy runtime.

/**
 * Each event gets its own httpOnly session cookie (name includes the event
 * slug), so a host session for one event can never be mistaken for another
 * event's session, even in the same browser.
 */
export function getHostSessionCookieName(slug: string): string {
  return `host_session_${slug}`;
}

/** Env var name holding an event's 4-digit code, e.g. HOST_ACCESS_CODE_WE_CAN_BEARLY_WAIT. */
function getHostAccessCodeEnvVar(slug: string): string {
  return `HOST_ACCESS_CODE_${slug.toUpperCase().replace(/-/g, "_")}`;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to your .env.local file."
    );
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function sign(payload: string): Promise<string> {
  const key = await importHmacKey(getSecret());
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signatureBuffer);
}

/**
 * Creates a signed session token scoped to one event. The slug is baked
 * into the signed payload, so even if a cookie name were guessed, the
 * token itself cannot be replayed against a different event.
 */
export async function createHostSessionToken(slug: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_LIFETIME_MS;
  const payload = `${slug}:${expiresAt}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Verifies a signed session token's signature, event slug, and expiry. */
export async function isValidHostSessionToken(
  token: string | undefined,
  slug: string
): Promise<boolean> {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload || !signature) return false;

  const expected = await sign(payload);
  if (expected.length !== signature.length) return false;

  // Constant-time comparison to avoid leaking timing information.
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) return false;

  const separatorIndex = payload.indexOf(":");
  if (separatorIndex === -1) return false;
  const payloadSlug = payload.slice(0, separatorIndex);
  const expiresAt = Number(payload.slice(separatorIndex + 1));

  if (payloadSlug !== slug) return false;
  if (!Number.isFinite(expiresAt)) return false;
  return Date.now() < expiresAt;
}

/**
 * Constant-time comparison of the submitted host access code against the
 * one configured for this specific event via
 * HOST_ACCESS_CODE_<SLUG_IN_SCREAMING_SNAKE_CASE>. Each event/client sets
 * its own 4-digit code — never hard-code any code here.
 */
export function isCorrectHostAccessCode(slug: string, candidate: string): boolean {
  const envVar = getHostAccessCodeEnvVar(slug);
  const actual = process.env[envVar];
  if (!actual || !HOST_CODE_PATTERN.test(actual)) {
    throw new Error(
      `${envVar} is not set to a 4-digit code. Add it to your .env.local file.`
    );
  }
  if (!HOST_CODE_PATTERN.test(candidate)) return false;
  if (candidate.length !== actual.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i += 1) {
    mismatch |= candidate.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return mismatch === 0;
}
