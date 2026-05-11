import { revalidatePendingSuggestions } from "@/lib/suggestion-pipeline";

type Job = { id: string; status: "queued" | "running" | "done" | "failed"; createdAt: string; finishedAt?: string; result?: { scanned: number; updated: number }; error?: string };

const jobs = new Map<string, Job>();
let running = false;

async function runNext() {
  if (running) return;
  const next = Array.from(jobs.values()).find((j) => j.status === "queued");
  if (!next) return;
  running = true;
  next.status = "running";
  try {
    const result = await revalidatePendingSuggestions(40);
    next.status = "done";
    next.finishedAt = new Date().toISOString();
    next.result = result;
  } catch (err) {
    next.status = "failed";
    next.finishedAt = new Date().toISOString();
    next.error = err instanceof Error ? err.message : "unknown_error";
  } finally {
    running = false;
    setTimeout(() => void runNext(), 0);
  }
}

export function enqueueRevalidateJob() {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  jobs.set(id, { id, status: "queued", createdAt: new Date().toISOString() });
  void runNext();
  return id;
}

export function getRevalidateJob(id: string) {
  return jobs.get(id) || null;
}
