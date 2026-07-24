const memoryStore = new Map<string, number[]>();

function getRedisConfig() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return null;
  return { redisUrl: redisUrl.replace(/\/$/, ""), redisToken };
}

async function incrementRedisFixedWindow(key: string, windowSec: number) {
  const config = getRedisConfig();
  if (!config) return null;

  const redisKey = `rl:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;
  const encodedKey = encodeURIComponent(redisKey);
  const headers = { Authorization: `Bearer ${config.redisToken}` };

  const incrRes = await fetch(`${config.redisUrl}/incr/${encodedKey}`, {
    method: "POST",
    headers,
    cache: "no-store",
  }).catch(() => null);

  if (!incrRes?.ok) return null;

  const data = (await incrRes.json().catch(() => null)) as { result?: number | string | null } | null;
  const count = Number(data?.result);
  if (!Number.isFinite(count)) return null;

  if (count === 1) {
    await fetch(`${config.redisUrl}/expire/${encodedKey}/${windowSec}`, {
      method: "POST",
      headers,
      cache: "no-store",
    }).catch(() => null);
  }

  return count;
}

function incrementMemorySlidingWindow(key: string, windowSec: number) {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const timestamps = memoryStore.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  memoryStore.set(key, recent);
  return recent.length;
}

export async function isRateLimited(
  key: string,
  maxRequests = 25,
  windowSec = 60,
): Promise<{ limited: boolean; remaining: number }> {
  const count = await incrementRedisFixedWindow(key, windowSec) ?? incrementMemorySlidingWindow(key, windowSec);
  const remaining = Math.max(0, maxRequests - count);

  return { limited: count > maxRequests, remaining };
}

export function resetRateLimitStoreForTests() {
  memoryStore.clear();
}
