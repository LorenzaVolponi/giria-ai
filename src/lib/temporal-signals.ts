import { SLANG_DATA } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export type TemporalSignal = "verified_trending" | "active" | "declining" | "regional" | "international" | "catalog_only";

export interface TemporalTermSignal {
  term: string;
  signal: TemporalSignal;
  confidence: "alta" | "media" | "baixa";
  evidenceCount: number;
  latestEvidenceAt: string | null;
  reviewedAt: string | null;
  note: string;
}

function latestDate(values: string[]) {
  return values.filter(Boolean).sort((a, b) => b.localeCompare(a))[0] ?? null;
}

export function getTemporalSignal(termName: string): TemporalTermSignal | null {
  const term = SLANG_DATA.find((item) => item.term.toLowerCase() === termName.trim().toLowerCase());
  if (!term) return null;

  const evidence = getEditorialEvidence(term.term);
  const evidenceCount = evidence?.sources.length ?? 0;
  const latestEvidenceAt = evidence ? latestDate(evidence.sources.map((source) => source.publishedAt)) : null;

  if (term.popularityStatus === "trending") {
    if (evidenceCount >= 2 && latestEvidenceAt) {
      return {
        term: term.term,
        signal: "verified_trending",
        confidence: "alta",
        evidenceCount,
        latestEvidenceAt,
        reviewedAt: evidence?.reviewedAt ?? null,
        note: "Marcado como trending no catálogo e sustentado por múltiplas fontes editoriais externas.",
      };
    }
    return {
      term: term.term,
      signal: "catalog_only",
      confidence: "baixa",
      evidenceCount,
      latestEvidenceAt,
      reviewedAt: evidence?.reviewedAt ?? null,
      note: "O catálogo marca o termo como trending, mas ainda não há evidência editorial suficiente para publicar isso como tendência verificada.",
    };
  }

  const mapping: Record<string, TemporalSignal> = {
    ativo: "active",
    em_queda: "declining",
    regional: "regional",
    internacional: "international",
  };

  return {
    term: term.term,
    signal: mapping[term.popularityStatus] ?? "catalog_only",
    confidence: evidenceCount ? "media" : "baixa",
    evidenceCount,
    latestEvidenceAt,
    reviewedAt: evidence?.reviewedAt ?? null,
    note: evidenceCount
      ? "Sinal do catálogo acompanhado por evidência editorial disponível."
      : "Sinal descritivo do catálogo; não representa medição estatística da população ou da internet.",
  };
}

export function getVerifiedTrendSignals(limit = 20) {
  return SLANG_DATA
    .map((term) => getTemporalSignal(term.term))
    .filter((item): item is TemporalTermSignal => Boolean(item && item.signal === "verified_trending"))
    .sort((a, b) => (b.latestEvidenceAt || "").localeCompare(a.latestEvidenceAt || ""))
    .slice(0, Math.max(1, Math.min(limit, 50)));
}
