const memoryStore = new Map<string, number[]>();

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt?: number;
};

export async function checkRateLimit(
  key: string,
  maxRequests = 25,
  windowSec = 60,
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  if (redisUrl && redisToken) {
    const redisKey = `rl:${key}`;
    const getRes = await fetch(`${redisUrl}/get/${encodeURIComponent(redisKey)}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: "no-store",
    }).catch(() => null);

    let timestamps: number[] = [];
    if (getRes?.ok) {
      const data = (await getRes.json()) as { result?: string | null };
      if (data?.result) timestamps = JSON.parse(data.result) as number[];
    }

    const recent = timestamps.filter((t) => now - t < windowMs);
    recent.push(now);

    await fetch(`${redisUrl}/set/${encodeURIComponent(redisKey)}/${encodeURIComponent(JSON.stringify(recent))}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: "no-store",
    }).catch(() => null);

    await fetch(`${redisUrl}/expire/${encodeURIComponent(redisKey)}/${windowSec}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: "no-store",
    }).catch(() => null);

    const remaining = Math.max(0, maxRequests - recent.length);
    const oldest = recent[0];
    const resetAt = oldest ? oldest + windowMs : now + windowMs;
    return { limited: recent.length > maxRequests, remaining, resetAt };
  }

  const timestamps = memoryStore.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  memoryStore.set(key, recent);

  const remaining = Math.max(0, maxRequests - recent.length);
  const oldest = recent[0];
  const resetAt = oldest ? oldest + windowMs : now + windowMs;
  return { limited: recent.length > maxRequests, remaining, resetAt };
}

export function applyRateLimitHeaders(
  headers: Headers,
  opts: { maxRequests: number; windowSec: number; rate: RateLimitResult },
) {
  const { maxRequests, windowSec, rate } = opts;
  headers.set("X-RateLimit-Limit", String(maxRequests));
  headers.set("X-RateLimit-Remaining", String(rate.remaining));
  headers.set("X-RateLimit-Window", String(windowSec));

  if (rate.resetAt) {
    headers.set("X-RateLimit-Reset", String(Math.ceil(rate.resetAt / 1000)));
    const retryAfter = Math.max(0, Math.ceil((rate.resetAt - Date.now()) / 1000));
    headers.set("Retry-After", String(retryAfter));
  } else {
    headers.set("Retry-After", String(windowSec));
  }
}

export function resetRateLimitStoreForTests() {
  memoryStore.clear();
}
