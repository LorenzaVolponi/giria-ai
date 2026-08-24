export type GeoSignalEvent = {
  type: "unknown_query" | "feedback_gap" | "editorial_state";
  key: string;
  term?: string | null;
  query?: string | null;
  payload: Record<string, unknown>;
  timestamp?: string;
};

type UpstashResponse<T> = { result?: T; error?: string };

const memoryEvents: GeoSignalEvent[] = [];
const MAX_MEMORY_EVENTS = 1000;
const REDIS_KEY = "geo:editorial:signals";

function getRedisConfig() {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return null;
  return { redisUrl: redisUrl.replace(/\/$/, ""), redisToken };
}

function pushMemory(event: GeoSignalEvent) {
  memoryEvents.unshift(event);
  if (memoryEvents.length > MAX_MEMORY_EVENTS) memoryEvents.length = MAX_MEMORY_EVENTS;
}

export async function persistGeoSignal(input: GeoSignalEvent) {
  const event: GeoSignalEvent = { ...input, timestamp: input.timestamp || new Date().toISOString() };
  pushMemory(event);

  const config = getRedisConfig();
  if (!config) return { durable: false, backend: "memory" as const };

  const endpoint = `${config.redisUrl}/pipeline`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.redisToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify([
      ["LPUSH", REDIS_KEY, JSON.stringify(event)],
      ["LTRIM", REDIS_KEY, "0", "4999"],
    ]),
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) return { durable: false, backend: "memory" as const };
  const data = (await response.json().catch(() => null)) as UpstashResponse<unknown>[] | null;
  if (!Array.isArray(data) || data.some((item) => item?.error)) return { durable: false, backend: "memory" as const };
  return { durable: true, backend: "upstash" as const };
}

export async function getDurableGeoSignals(limit = 250) {
  const safeLimit = Math.max(1, Math.min(limit, 1000));
  const config = getRedisConfig();
  if (!config) return { backend: "memory" as const, durable: false, events: memoryEvents.slice(0, safeLimit) };

  const endpoint = `${config.redisUrl}/lrange/${encodeURIComponent(REDIS_KEY)}/0/${safeLimit - 1}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.redisToken}` },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) return { backend: "memory" as const, durable: false, events: memoryEvents.slice(0, safeLimit) };
  const data = (await response.json().catch(() => null)) as UpstashResponse<string[]> | null;
  if (!Array.isArray(data?.result)) return { backend: "memory" as const, durable: false, events: memoryEvents.slice(0, safeLimit) };

  const events = data.result
    .map((raw) => {
      try { return JSON.parse(raw) as GeoSignalEvent; } catch { return null; }
    })
    .filter((event): event is GeoSignalEvent => Boolean(event));

  return { backend: "upstash" as const, durable: true, events };
}

export function resetGeoSignalStoreForTests() {
  memoryEvents.length = 0;
}
