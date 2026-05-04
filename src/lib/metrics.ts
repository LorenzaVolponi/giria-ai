type Bucket = { ts: string; total: number; errors: number };

const buckets = new Map<string, Bucket>();
let ambiguityFallbacks = 0;
let totalTranslations = 0;

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

export function recordAmbiguityFallback(used: boolean) {
  totalTranslations += 1;
  if (used) ambiguityFallbacks += 1;
}

export function getApiMetrics() {
  const series = Array.from(buckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  const total = series.reduce((acc, b) => acc + b.total, 0);
  const errors = series.reduce((acc, b) => acc + b.errors, 0);
  return {
    totalRequests: total,
    totalErrors: errors,
    errorRate: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
    ambiguityFallbackRate: totalTranslations > 0 ? Number(((ambiguityFallbacks / totalTranslations) * 100).toFixed(2)) : 0,
    ambiguityFallbackCount: ambiguityFallbacks,
    series: series.slice(-120),
  };
}
