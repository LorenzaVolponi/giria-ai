import { revalidatePendingSuggestions } from "@/lib/suggestion-pipeline";
import { redisGet, redisSetEx } from "@/lib/redis-store";

type Job = { id: string; status: "queued" | "running" | "done" | "failed"; createdAt: string; finishedAt?: string; result?: { scanned: number; updated: number }; error?: string };

const jobs = new Map<string, Job>();
let running = false;
const JOB_TTL_SECONDS = 60 * 60 * 12;

async function persistJob(job: Job) {
  await redisSetEx(`revalidate:job:${job.id}`, JOB_TTL_SECONDS, JSON.stringify(job)).catch(() => null);
}

async function runNext() {
  if (running) return;
  const next = Array.from(jobs.values()).find((j) => j.status === "queued");
  if (!next) return;
  running = true;
  next.status = "running";
  await persistJob(next);
  try {
    const result = await revalidatePendingSuggestions(40);
    next.status = "done";
    next.finishedAt = new Date().toISOString();
    next.result = result;
    await persistJob(next);
  } catch (err) {
    next.status = "failed";
    next.finishedAt = new Date().toISOString();
    next.error = err instanceof Error ? err.message : "unknown_error";
    await persistJob(next);
  } finally {
    running = false;
    setTimeout(() => void runNext(), 0);
  }
}

export function enqueueRevalidateJob() {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = { id, status: "queued", createdAt: new Date().toISOString() } satisfies Job;
  jobs.set(id, job);
  void persistJob(job);
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
}
