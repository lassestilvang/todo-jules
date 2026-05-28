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
}, 5 * 60 * 1000);

export function getIp(request: Request): string {
  // 🛡️ Sentinel: Prefer x-real-ip or standard forwarded headers over the highly spoofable left-most x-forwarded-for IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get('forwarded');
  if (forwarded) {
    const match = forwarded.match(/for="?([^;,"]+)"?/);
    if (match) return match[1].trim();
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return 'unknown';
}

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  // 🛡️ Sentinel: Prevent Memory Exhaustion DoS via unbounded Map growth from IP spoofing
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

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
