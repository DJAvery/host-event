/**
 * Basic in-memory sliding-window rate limiter.
 *
 * NOTE: this resets whenever the serverless function instance is recycled,
 * so it is a best-effort guard rather than a distributed rate limiter. For
 * high-traffic production use, replace with a shared store such as Upstash
 * Redis (see README "Production hardening" notes).
 */

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so the map doesn't grow unbounded.
const MAX_BUCKETS = 5000;

export function isRateLimited(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (buckets.size > MAX_BUCKETS) {
    buckets.clear();
  }

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  existing.count += 1;
  return existing.count > limit;
}

/** Checks whether a key is currently locked out WITHOUT recording an attempt. */
export function isLockedOut(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  const existing = buckets.get(key);
  if (!existing) return false;
  if (Date.now() - existing.windowStart > windowMs) return false;
  return existing.count >= limit;
}

/** Records a failed attempt for a key and reports whether it is now locked out. */
export function recordFailedAttempt(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  return isRateLimited(key, { limit, windowMs });
}

/** Clears any recorded attempts for a key, e.g. after a successful login. */
export function clearAttempts(key: string): void {
  buckets.delete(key);
}
