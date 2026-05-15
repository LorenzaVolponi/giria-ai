type Bucket = { ts: string; total: number; errors: number };
type GroundingBucket = { ts: string; total: number; grounded: number; unresolved: number };

const buckets = new Map<string, Bucket>();
const groundingBuckets = new Map<string, GroundingBucket>();

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

export function getApiMetrics() {
  const series = Array.from(buckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
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

export function getGroundingMetrics() {
  const series = Array.from(groundingBuckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
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
