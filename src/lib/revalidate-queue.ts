import { revalidatePendingSuggestions } from "@/lib/suggestion-pipeline";
import { redisGet, redisSetEx } from "@/lib/redis-store";

type Job = { id: string; status: "queued" | "running" | "done" | "failed"; createdAt: string; finishedAt?: string; result?: { scanned: number; updated: number }; error?: string };

const jobs = new Map<string, Job>();
let running = false;
const JOB_TTL_SECONDS = 60 * 60 * 12;

async function runNext() {
  if (running) return;
  const next = Array.from(jobs.values()).find((j) => j.status === "queued");
  if (!next) return;
  running = true;
  next.status = "running";
  await redisSetEx(`revalidate:job:${next.id}`, JOB_TTL_SECONDS, JSON.stringify(next)).catch(() => null);
  try {
    const result = await revalidatePendingSuggestions(40);
    next.status = "done";
    next.finishedAt = new Date().toISOString();
    next.result = result;
    await redisSetEx(`revalidate:job:${next.id}`, JOB_TTL_SECONDS, JSON.stringify(next)).catch(() => null);
  } catch (err) {
    next.status = "failed";
    next.finishedAt = new Date().toISOString();
    next.error = err instanceof Error ? err.message : "unknown_error";
    await redisSetEx(`revalidate:job:${next.id}`, JOB_TTL_SECONDS, JSON.stringify(next)).catch(() => null);
  } finally {
    running = false;
    setTimeout(() => void runNext(), 0);
  }
}

export function enqueueRevalidateJob() {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = { id, status: "queued", createdAt: new Date().toISOString() } satisfies Job;
  jobs.set(id, job);
  void redisSetEx(`revalidate:job:${id}`, JOB_TTL_SECONDS, JSON.stringify(job)).catch(() => null);
  jobs.set(id, { id, status: "queued", createdAt: new Date().toISOString() });
  void runNext();
  return id;
}

export async function getRevalidateJob(id: string) {
  const local = jobs.get(id);
  if (local) return local;
  const remote = await redisGet(`revalidate:job:${id}`).catch(() => null);
  if (!remote) return null;
  try {
    return JSON.parse(remote) as Job;
  } catch {
    return null;
  }
export function getRevalidateJob(id: string) {
  return jobs.get(id) || null;
}
