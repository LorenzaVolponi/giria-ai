const memoryStore = new Map<string, number[]>();

export async function isRateLimited(
  key: string,
  maxRequests = 25,
  windowSec = 60,
): Promise<{ limited: boolean; remaining: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const redisKey = `rl:${key}`;
    const now = Date.now();
    const windowMs = windowSec * 1000;

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
    return { limited: recent.length > maxRequests, remaining };
  }

  const now = Date.now();
  const windowMs = windowSec * 1000;
  const timestamps = memoryStore.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);
  recent.push(now);
  memoryStore.set(key, recent);
  const remaining = Math.max(0, maxRequests - recent.length);

  return { limited: recent.length > maxRequests, remaining };
}


export function resetRateLimitStoreForTests() {
  memoryStore.clear();
}
