import { createClient } from "redis";

let client: ReturnType<typeof createClient> | null = null;
let booting: Promise<void> | null = null;

async function getClient() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = createClient({ url });
    client.on("error", () => {});
  }
  if (!client.isOpen) {
    if (!booting) booting = client.connect().then(() => undefined).finally(() => {
      booting = null;
    });
    await booting;
  }
  return client;
}

export async function redisGet(key: string) {
  const c = await getClient().catch(() => null);
  if (!c) return null;
  return c.get(key).catch(() => null);
}

export async function redisSetEx(key: string, ttlSeconds: number, value: string) {
  const c = await getClient().catch(() => null);
  if (!c) return false;
  await c.setEx(key, ttlSeconds, value).catch(() => null);
  return true;
}

export async function redisIncrBy(key: string, by = 1, ttlSeconds = 0) {
  const c = await getClient().catch(() => null);
  if (!c) return null;
  const v = await c.incrBy(key, by).catch(() => null);
  if (v !== null && ttlSeconds > 0) await c.expire(key, ttlSeconds).catch(() => null);
  return v;
}
