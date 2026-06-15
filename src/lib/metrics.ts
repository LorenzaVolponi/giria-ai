type Bucket = { ts: string; total: number; errors: number };
type GroundingBucket = { ts: string; total: number; grounded: number; unresolved: number };
type FeedbackBucket = { ts: string; up: number; down: number };
type FeedbackReasonBucket = { ts: string; reasons: Record<string, number> };

const buckets = new Map<string, Bucket>();
const groundingBuckets = new Map<string, GroundingBucket>();
const feedbackBuckets = new Map<string, FeedbackBucket>();
const feedbackReasonBuckets = new Map<string, FeedbackReasonBucket>();

export const MAX_METRICS_WINDOW_MINUTES = 60 * 24 * 7;

export function parseMetricsWindow(value: string | null): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;

  return Math.min(Math.floor(parsed), MAX_METRICS_WINDOW_MINUTES);
}

function minuteKey(date = new Date()) {
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

export function recordApiMetric(status: number) {
  const key = minuteKey();
  const bucket = buckets.get(key) ?? { ts: `${key}:00.000Z`, total: 0, errors: 0 };
  bucket.total += 1;
  if (status >= 500) bucket.errors += 1;
  buckets.set(key, bucket);

  if (buckets.size > 1440) {
    const keys = Array.from(buckets.keys()).sort();
    for (const k of keys.slice(0, keys.length - 1440)) buckets.delete(k);
  }
}

function filterByWindow<T extends { ts: string }>(series: T[], windowMinutes?: number): T[] {
  if (!windowMinutes || windowMinutes <= 0) return series;
  const cutoff = Date.now() - windowMinutes * 60_000;
  return series.filter((item) => new Date(item.ts).getTime() >= cutoff);
}

export function getApiMetrics(windowMinutes?: number) {
  const ordered = Array.from(buckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  const series = filterByWindow(ordered, windowMinutes);
  const total = series.reduce((acc, b) => acc + b.total, 0);
  const errors = series.reduce((acc, b) => acc + b.errors, 0);
  return {
    totalRequests: total,
    totalErrors: errors,
    errorRate: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
    series: series.slice(-120),
  };
}

export function recordGroundingMetric(grounded: boolean) {
  const key = minuteKey();
  const bucket = groundingBuckets.get(key) ?? { ts: `${key}:00.000Z`, total: 0, grounded: 0, unresolved: 0 };
  bucket.total += 1;
  if (grounded) bucket.grounded += 1;
  else bucket.unresolved += 1;
  groundingBuckets.set(key, bucket);

  if (groundingBuckets.size > 1440) {
    const keys = Array.from(groundingBuckets.keys()).sort();
    for (const k of keys.slice(0, keys.length - 1440)) groundingBuckets.delete(k);
  }
}

export function getGroundingMetrics(windowMinutes?: number) {
  const ordered = Array.from(groundingBuckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  const series = filterByWindow(ordered, windowMinutes);
  const total = series.reduce((acc, b) => acc + b.total, 0);
  const grounded = series.reduce((acc, b) => acc + b.grounded, 0);
  const unresolved = series.reduce((acc, b) => acc + b.unresolved, 0);

  return {
    total,
    grounded,
    unresolved,
    groundedRate: total > 0 ? Number(((grounded / total) * 100).toFixed(2)) : 0,
    unresolvedRate: total > 0 ? Number(((unresolved / total) * 100).toFixed(2)) : 0,
    series: series.slice(-120),
  };
}

export function recordChatFeedback(helpful: boolean, reason?: string) {
  const key = minuteKey();
  const bucket = feedbackBuckets.get(key) ?? { ts: `${key}:00.000Z`, up: 0, down: 0 };
  if (helpful) bucket.up += 1;
  else bucket.down += 1;
  feedbackBuckets.set(key, bucket);

  if (reason) {
    const reasonBucket = feedbackReasonBuckets.get(key) ?? { ts: `${key}:00.000Z`, reasons: {} };
    reasonBucket.reasons[reason] = (reasonBucket.reasons[reason] ?? 0) + 1;
    feedbackReasonBuckets.set(key, reasonBucket);
  }
}

export function getFeedbackMetrics(windowMinutes?: number) {
  const ordered = Array.from(feedbackBuckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  const series = filterByWindow(ordered, windowMinutes);
  const up = series.reduce((acc, b) => acc + b.up, 0);
  const down = series.reduce((acc, b) => acc + b.down, 0);
  const total = up + down;
  const filteredReasons = filterByWindow(Array.from(feedbackReasonBuckets.values()), windowMinutes);
  const reasons = filteredReasons.reduce<Record<string, number>>((acc, item) => {
    for (const [reason, count] of Object.entries(item.reasons)) acc[reason] = (acc[reason] ?? 0) + count;
    return acc;
  }, {});

  return {
    up,
    down,
    total,
    approvalRate: total > 0 ? Number(((up / total) * 100).toFixed(2)) : 0,
    reasons,
    series: series.slice(-120),
  };
}
