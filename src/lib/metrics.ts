type Bucket = { ts: string; total: number; errors: number };

type ExperimentVariant = "controle" | "regionalizacao_ativa";
type OutcomeEvent = "comprehension_success" | "rework_repeat_question" | "satisfaction_positive" | "semantic_error";

type ExperimentEvent = {
  ts: string;
  region: string;
  slangLevel: string;
  variant: ExperimentVariant;
  event: OutcomeEvent;
};

const buckets = new Map<string, Bucket>();
const experimentEvents: ExperimentEvent[] = [];

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

export function assignRegionalizationVariant(requestId: string): ExperimentVariant {
  let hash = 0;
  for (let i = 0; i < requestId.length; i += 1) hash = (hash * 31 + requestId.charCodeAt(i)) >>> 0;
  return hash % 2 === 0 ? "controle" : "regionalizacao_ativa";
}

export function recordExperimentEvent(event: Omit<ExperimentEvent, "ts">) {
  experimentEvents.push({ ...event, ts: new Date().toISOString() });
  if (experimentEvents.length > 120_000) experimentEvents.splice(0, experimentEvents.length - 120_000);
}

function getWindowCutoff(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export function getRegionalizationExperimentMetrics(windowDays = 14) {
  const cutoff = getWindowCutoff(windowDays);
  const filtered = experimentEvents.filter((e) => Date.parse(e.ts) >= cutoff);
  const grouped = new Map<string, {
    region: string;
    slangLevel: string;
    variant: ExperimentVariant;
    total: number;
    comprehension: number;
    rework: number;
    satisfaction: number;
    semanticErrors: number;
  }>();

  for (const e of filtered) {
    const key = `${e.region}::${e.slangLevel}::${e.variant}`;
    const current = grouped.get(key) ?? {
      region: e.region,
      slangLevel: e.slangLevel,
      variant: e.variant,
      total: 0,
      comprehension: 0,
      rework: 0,
      satisfaction: 0,
      semanticErrors: 0,
    };

    current.total += 1;
    if (e.event === "comprehension_success") current.comprehension += 1;
    if (e.event === "rework_repeat_question") current.rework += 1;
    if (e.event === "satisfaction_positive") current.satisfaction += 1;
    if (e.event === "semantic_error") current.semanticErrors += 1;

    grouped.set(key, current);
  }

  const rows = Array.from(grouped.values()).map((g) => ({
    ...g,
    comprehensionRate: g.total > 0 ? Number((g.comprehension / g.total).toFixed(4)) : 0,
    reworkRate: g.total > 0 ? Number((g.rework / g.total).toFixed(4)) : 0,
    satisfactionRate: g.total > 0 ? Number((g.satisfaction / g.total).toFixed(4)) : 0,
    semanticErrorRate: g.total > 0 ? Number((g.semanticErrors / g.total).toFixed(4)) : 0,
  }));

  const promotionCandidates = rows
    .filter((row) => row.variant === "regionalizacao_ativa")
    .map((variantRow) => {
      const control = rows.find((row) => row.variant === "controle" && row.region === variantRow.region && row.slangLevel === variantRow.slangLevel);
      if (!control) return { ...variantRow, canPromote: false, reason: "sem_grupo_controle" };

      const lift = variantRow.comprehensionRate - control.comprehensionRate;
      const reworkDelta = variantRow.reworkRate - control.reworkRate;
      const errorDelta = variantRow.semanticErrorRate - control.semanticErrorRate;

      const minimumWindowReached = variantRow.total >= 200 && control.total >= 200;
      const canPromote = minimumWindowReached && lift > 0.02 && reworkDelta < 0 && errorDelta <= 0;

      return {
        ...variantRow,
        controlTotal: control.total,
        lift,
        reworkDelta,
        errorDelta,
        minimumWindowReached,
        canPromote,
      };
    });

  return {
    windowDays,
    minimumWindow: "1-2 semanas",
    trackedMetrics: ["comprehension_success", "rework_repeat_question", "satisfaction_positive", "semantic_error"],
    byRegionAndSlangLevel: rows,
    promotionCandidates,
  };
}
