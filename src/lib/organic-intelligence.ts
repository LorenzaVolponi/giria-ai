import { SLANG_DATA, searchTerms, type SlangTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export type FreshnessSignal = {
  reviewedAt: string | null;
  latestEvidenceAt: string | null;
  ageDays: number | null;
  score: number;
  status: "fresh" | "aging" | "stale" | "catalog_only";
};

export type IndexabilitySignal = {
  score: number;
  indexable: boolean;
  citationReady: boolean;
  reasons: string[];
};

const DAY = 86_400_000;
const unknownQueries = new Map<string, { count: number; firstSeenAt: string; lastSeenAt: string; confidence: string; candidate: string | null }>();

export function normalizeOrganicQuery(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

function daysSince(value: string | null, now = Date.now()) {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? Math.max(0, Math.floor((now - ts) / DAY)) : null;
}

export function getFreshnessSignal(term: string): FreshnessSignal {
  const evidence = getEditorialEvidence(term);
  if (!evidence) return { reviewedAt: null, latestEvidenceAt: null, ageDays: null, score: 25, status: "catalog_only" };

  const latestEvidenceAt = evidence.sources.map((source) => source.publishedAt).filter(Boolean).sort().at(-1) ?? null;
  const reference = [evidence.reviewedAt, latestEvidenceAt].filter(Boolean).sort().at(-1) ?? null;
  const ageDays = daysSince(reference);
  const score = ageDays === null ? 35 : ageDays <= 45 ? 100 : ageDays <= 120 ? 85 : ageDays <= 240 ? 68 : ageDays <= 365 ? 50 : 30;
  const status = score >= 85 ? "fresh" : score >= 60 ? "aging" : "stale";
  return { reviewedAt: evidence.reviewedAt || null, latestEvidenceAt, ageDays, score, status };
}

export function getIndexabilitySignal(term: SlangTerm): IndexabilitySignal {
  const evidence = getEditorialEvidence(term.term);
  const freshness = getFreshnessSignal(term.term);
  const related = searchTerms(term.term).filter((item) => item.term !== term.term).slice(0, 5);
  let score = 0;
  const reasons: string[] = [];

  if ((term.meaning || "").trim().length >= 45) { score += 18; reasons.push("definition"); }
  if ((term.context || "").trim().length >= 45) { score += 14; reasons.push("context"); }
  if ((term.safeExample || "").trim().length >= 20) { score += 10; reasons.push("example"); }
  if ((term.variations || []).length > 0) { score += 8; reasons.push("variations"); }
  if (related.length >= 2) { score += 10; reasons.push("semantic_links"); }
  if (evidence?.sources?.length) { score += Math.min(20, evidence.sources.length * 7); reasons.push("editorial_evidence"); }
  if (freshness.score >= 60) { score += 12; reasons.push("freshness"); }
  if (evidence?.reviewedAt) { score += 8; reasons.push("reviewed"); }

  score = Math.min(100, score);
  return {
    score,
    indexable: score >= 62 && Boolean(term.meaning && term.context && term.safeExample),
    citationReady: score >= 78 && Boolean(evidence && evidence.sources.length >= 2),
    reasons,
  };
}

export function buildOrganicTermRecord(term: SlangTerm) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const evidence = getEditorialEvidence(term.term);
  const freshness = getFreshnessSignal(term.term);
  const indexability = getIndexabilitySignal(term);
  const relatedTerms = searchTerms(term.term)
    .filter((item) => item.term !== term.term)
    .slice(0, 5)
    .map((item) => item.term);

  return {
    term: term.term,
    definition: evidence?.definition || term.adultTranslation || term.meaning,
    meaning: term.meaning,
    context: evidence?.context || term.context,
    example: term.safeExample,
    category: term.category,
    region: term.region,
    variations: term.variations,
    relatedTerms,
    canonicalUrl: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
    publisher: "Gíria AI",
    attribution: "AIX8C / volponi.tech",
    freshness,
    indexability,
    evidence: evidence ? {
      reviewedAt: evidence.reviewedAt,
      sources: evidence.sources.map(({ publisher, title, url, publishedAt }) => ({ publisher, title, url, publishedAt })),
    } : null,
  };
}

export function getOrganicDataset() {
  return SLANG_DATA.map(buildOrganicTermRecord).filter((item) => item.indexability.indexable);
}

export function getVerifiedTrendReport() {
  return SLANG_DATA.map((term) => {
    const record = buildOrganicTermRecord(term);
    const sources = record.evidence?.sources ?? [];
    const recentSources = sources.filter((source) => {
      const age = daysSince(source.publishedAt);
      return age !== null && age <= 240;
    });
    const catalogSignal = String(term.popularityStatus || "").toLowerCase();
    const verified = recentSources.length >= 2 && record.freshness.score >= 60 && /alta|subindo|viral|tend|popular/.test(catalogSignal);
    return {
      term: term.term,
      status: verified ? "verified_trending" : "not_verified",
      evidenceCount: sources.length,
      recentEvidenceCount: recentSources.length,
      freshnessScore: record.freshness.score,
      canonicalUrl: record.canonicalUrl,
    };
  }).filter((item) => item.status === "verified_trending");
}

export function recordUnknownQuery(query: string, confidence: string, candidate?: string | null) {
  const normalized = normalizeOrganicQuery(query);
  if (!normalized || normalized.length < 2) return;
  const now = new Date().toISOString();
  const current = unknownQueries.get(normalized);
  const next = current
    ? { ...current, count: current.count + 1, lastSeenAt: now, confidence, candidate: candidate || current.candidate }
    : { count: 1, firstSeenAt: now, lastSeenAt: now, confidence, candidate: candidate || null };
  unknownQueries.set(normalized, next);
  if (unknownQueries.size > 500) {
    const oldest = [...unknownQueries.entries()].sort((a, b) => a[1].lastSeenAt.localeCompare(b[1].lastSeenAt)).slice(0, 100);
    oldest.forEach(([key]) => unknownQueries.delete(key));
  }
  console.log(JSON.stringify({ event: "organic_unknown_query", query: normalized, ...next }));
}

export function getUnknownQuerySnapshot(limit = 50) {
  return [...unknownQueries.entries()]
    .map(([query, data]) => ({ query, ...data, opportunityScore: Math.min(100, data.count * 15 + (data.confidence === "baixa" ? 25 : 10)) }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.count - a.count)
    .slice(0, Math.max(1, Math.min(limit, 100)));
}
