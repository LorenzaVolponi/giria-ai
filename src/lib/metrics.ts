type Bucket = { ts: string; total: number; errors: number };
type RegionalKey = `${string}::${string}`;
type RejectionStat = { attempts: number; rejections: number; rejectionRate: number };

const buckets = new Map<string, Bucket>();
const usageByVariantRegion = new Map<RegionalKey, number>();
const manualQuality = {
  regionalizedResponses: 0,
  manualCorrections: 0,
  reworkEvents: 0,
};
const rejectionTerms = new Map<string, { attempts: number; rejections: number }>();

function minuteKey(date = new Date()) {
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

function normalizeTag(value?: string) {
  return value?.trim().toLowerCase() || "unspecified";
}

function upsertRejectedTerm(term: string, rejected: boolean) {
  const normalized = normalizeTag(term);
  const current = rejectionTerms.get(normalized) ?? { attempts: 0, rejections: 0 };
  current.attempts += 1;
  if (rejected) current.rejections += 1;
  rejectionTerms.set(normalized, current);
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

export function recordRegionalizedResponse(input: {
  variant?: string;
  region?: string;
  hadManualCorrection?: boolean;
  hadRework?: boolean;
  term?: string;
  rejected?: boolean;
}) {
  const variant = normalizeTag(input.variant);
  const region = normalizeTag(input.region);
  const key = `${variant}::${region}` as RegionalKey;
  usageByVariantRegion.set(key, (usageByVariantRegion.get(key) ?? 0) + 1);

  manualQuality.regionalizedResponses += 1;
  if (input.hadManualCorrection) manualQuality.manualCorrections += 1;
  if (input.hadRework) manualQuality.reworkEvents += 1;

  if (input.term) upsertRejectedTerm(input.term, Boolean(input.rejected));
}

function collectRejectionRates(): Array<{ term: string } & RejectionStat> {
  return Array.from(rejectionTerms.entries())
    .map(([term, stat]) => ({
      term,
      attempts: stat.attempts,
      rejections: stat.rejections,
      rejectionRate: stat.attempts > 0 ? Number(((stat.rejections / stat.attempts) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.rejectionRate - a.rejectionRate || b.rejections - a.rejections)
    .slice(0, 20);
}

function buildComprehensionAlerts(rejections: Array<{ term: string } & RejectionStat>) {
  const alerts: Array<{ severity: "warning" | "critical"; type: string; message: string }> = [];
  const correctionRate =
    manualQuality.regionalizedResponses > 0
      ? (manualQuality.manualCorrections / manualQuality.regionalizedResponses) * 100
      : 0;

  if (manualQuality.regionalizedResponses >= 25 && correctionRate >= 20) {
    alerts.push({
      severity: correctionRate >= 35 ? "critical" : "warning",
      type: "comprehension_regression",
      message: `Taxa de correções manuais em respostas regionalizadas está em ${correctionRate.toFixed(2)}%.`,
    });
  }

  for (const item of rejections.slice(0, 5)) {
    if (item.attempts >= 10 && item.rejectionRate >= 45) {
      alerts.push({
        severity: item.rejectionRate >= 60 ? "critical" : "warning",
        type: "term_rejection_spike",
        message: `Termo "${item.term}" com rejeição de ${item.rejectionRate.toFixed(2)}% (${item.rejections}/${item.attempts}).`,
      });
    }
  }

  return alerts;
}

export function getApiMetrics() {
  const series = Array.from(buckets.values()).sort((a, b) => a.ts.localeCompare(b.ts));
  const total = series.reduce((acc, b) => acc + b.total, 0);
  const errors = series.reduce((acc, b) => acc + b.errors, 0);
  const rejectionRates = collectRejectionRates();

  return {
    totalRequests: total,
    totalErrors: errors,
    errorRate: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
    series: series.slice(-120),
    usageByVariantRegion: Array.from(usageByVariantRegion.entries())
      .map(([key, totalUsage]) => {
        const [variant, region] = key.split("::");
        return { variant, region, totalUsage };
      })
      .sort((a, b) => b.totalUsage - a.totalUsage),
    regionalQuality: {
      totalRegionalizedResponses: manualQuality.regionalizedResponses,
      manualCorrections: manualQuality.manualCorrections,
      reworkEvents: manualQuality.reworkEvents,
      manualCorrectionRate:
        manualQuality.regionalizedResponses > 0
          ? Number(((manualQuality.manualCorrections / manualQuality.regionalizedResponses) * 100).toFixed(2))
          : 0,
      reworkRate:
        manualQuality.regionalizedResponses > 0
          ? Number(((manualQuality.reworkEvents / manualQuality.regionalizedResponses) * 100).toFixed(2))
          : 0,
    },
    rejectionByTerm: rejectionRates,
    alerts: buildComprehensionAlerts(rejectionRates),
  };
}
