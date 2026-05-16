/**
 * A simple in-memory rate limiter to protect API endpoints
 * from abuse or accidental spam.
 */

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of rateLimitMap.entries()) {
    if (now > info.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref(); // unref so it doesn't block Node exit

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  let info = rateLimitMap.get(identifier);

  if (!info || now > info.resetAt) {
    info = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitMap.set(identifier, info);
    return { success: true, remaining: limit - 1 };
  }

  if (info.count >= limit) {
    return { success: false, remaining: 0 };
  }

  info.count += 1;
  return { success: true, remaining: limit - info.count };
}
