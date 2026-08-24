type RuntimeSample = { durationMs: number; fallbackUsed: boolean; cacheHit?: boolean; timestamp: number };

const samples: RuntimeSample[] = [];
const MAX_SAMPLES = 1000;

export function recordRuntimeSample(sample: Omit<RuntimeSample, "timestamp">) {
  samples.push({ ...sample, timestamp: Date.now() });
  if (samples.length > MAX_SAMPLES) samples.splice(0, samples.length - MAX_SAMPLES);
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))];
}

export function getRuntimeTelemetry(windowMinutes = 60) {
  const cutoff = Date.now() - Math.max(1, windowMinutes) * 60_000;
  const recent = samples.filter((sample) => sample.timestamp >= cutoff);
  const durations = recent.map((sample) => sample.durationMs);
  const fallbacks = recent.filter((sample) => sample.fallbackUsed).length;
  const cacheKnown = recent.filter((sample) => typeof sample.cacheHit === "boolean");
  const cacheHits = cacheKnown.filter((sample) => sample.cacheHit).length;
  return {
    sampleCount: recent.length,
    latencyMs: { p50: percentile(durations, 50), p95: percentile(durations, 95), max: durations.length ? Math.max(...durations) : 0 },
    fallbackRate: recent.length ? Number(((fallbacks / recent.length) * 100).toFixed(2)) : 0,
    cacheHitRate: cacheKnown.length ? Number(((cacheHits / cacheKnown.length) * 100).toFixed(2)) : null,
  };
}
