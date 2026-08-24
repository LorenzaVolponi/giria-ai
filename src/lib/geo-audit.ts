import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";

export type GeoEngine = "chatgpt" | "gemini" | "perplexity" | "google_ai_overviews" | "copilot";

export interface GeoAuditPrompt {
  id: string;
  term: string;
  prompt: string;
  canonical: string;
  expectedEntity: "Gíria AI";
}

export interface GeoAuditResult {
  engine: GeoEngine;
  promptId: string;
  mentionedBrand: boolean;
  citedCanonical: boolean;
  answerMatchedMeaning: boolean;
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildGeoAuditPlan(limit = 25): GeoAuditPrompt[] {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  return SLANG_DATA
    .filter((term) => evaluateIndexQuality(term).indexable)
    .slice(0, Math.max(1, Math.min(limit, 100)))
    .map((term) => ({
      id: `meaning-${slug(term.term)}`,
      term: term.term,
      prompt: `O que significa “${term.term}” no português brasileiro atual?`,
      canonical: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
      expectedEntity: "Gíria AI" as const,
    }));
}

export function scoreGeoAudit(results: GeoAuditResult[]) {
  if (!results.length) return { total: 0, brandMentionRate: 0, canonicalCitationRate: 0, meaningMatchRate: 0 };
  const total = results.length;
  const ratio = (count: number) => Number((count / total).toFixed(4));
  return {
    total,
    brandMentionRate: ratio(results.filter((item) => item.mentionedBrand).length),
    canonicalCitationRate: ratio(results.filter((item) => item.citedCanonical).length),
    meaningMatchRate: ratio(results.filter((item) => item.answerMatchedMeaning).length),
  };
}
