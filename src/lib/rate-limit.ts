const memoryStore = new Map<string, number[]>();
const REDIS_FIXED_WINDOW_SCRIPT = [
  "local current = redis.call('INCR', KEYS[1])",
  "if current == 1 then",
  "  redis.call('EXPIRE', KEYS[1], ARGV[1])",
  "end",
  "return current",
].join("\n");

type UpstashNumberResponse = { result?: number | string | null; error?: string };

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
  const endpoint = [
    config.redisUrl,
    "eval",
    encodeURIComponent(REDIS_FIXED_WINDOW_SCRIPT),
    "1",
    encodeURIComponent(redisKey),
    String(windowSec),
  ].join("/");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.redisToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) return null;

  const data = (await res.json().catch(() => null)) as UpstashNumberResponse | null;
  if (data?.error) return null;
  const count = Number(data?.result);
  return Number.isFinite(count) ? count : null;
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
