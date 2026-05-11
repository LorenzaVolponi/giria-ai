import { redisGet, redisSetEx } from "@/lib/redis-store";

type AuditEvent = { at: string; action: string; ip?: string; meta?: Record<string, string | number | boolean> };

const memoryAudit: AuditEvent[] = [];
const KEY = "admin:audit:last";

export async function appendAdminAudit(event: AuditEvent) {
  memoryAudit.unshift(event);
  if (memoryAudit.length > 200) memoryAudit.length = 200;
  const serialized = JSON.stringify(memoryAudit.slice(0, 100));
  await redisSetEx(KEY, 60 * 60 * 24 * 7, serialized).catch(() => null);
}

export async function listAdminAudit(limit = 100) {
  const redisRaw = await redisGet(KEY);
  if (redisRaw) {
    try {
      const parsed = JSON.parse(redisRaw) as AuditEvent[];
      return parsed.slice(0, limit);
    } catch {}
  }
  return memoryAudit.slice(0, limit);
}
