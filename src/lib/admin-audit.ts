import { redisGet, redisSetEx } from "@/lib/redis-store";
import crypto from "crypto";

type AuditEvent = { at: string; action: string; ip?: string; meta?: Record<string, string | number | boolean>; prevHash?: string; hash?: string };

const memoryAudit: AuditEvent[] = [];
const KEY = "admin:audit:last";

export async function appendAdminAudit(event: AuditEvent) {
  const prevHash = memoryAudit[0]?.hash || "root";
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ at: event.at, action: event.action, ip: event.ip || "", meta: event.meta || {}, prevHash }))
    .digest("hex");
  memoryAudit.unshift({ ...event, prevHash, hash });
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
