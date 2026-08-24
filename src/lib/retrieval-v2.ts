import { SLANG_DATA } from "@/lib/slang-data";
import { semanticSearchSlang } from "@/lib/semantic-search";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export type RetrievalStage = "exact" | "lexical" | "reranked" | "none";

export interface RetrievalCandidate {
  term: string;
  meaning: string;
  score: number;
  stage: RetrievalStage;
  whyMatched: string[];
  evidenceCount: number;
  confidence: "alta" | "media" | "baixa";
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function exactCandidate(input: string): RetrievalCandidate | null {
  const normalized = normalize(input);
  const term = SLANG_DATA.find((item) => normalize(item.term) === normalized || item.variations.some((variation) => normalize(variation) === normalized));
  if (!term) return null;
  const evidenceCount = getEditorialEvidence(term.term)?.sources.length || 0;
  return { term: term.term, meaning: term.meaning, score: 1, stage: "exact", whyMatched: ["termo ou variação exata"], evidenceCount, confidence: "alta" };
}

export function retrieveSlang(input: string, limit = 5): RetrievalCandidate[] {
  const exact = exactCandidate(input);
  if (exact) return [exact];

  const candidates: RetrievalCandidate[] = semanticSearchSlang(input, Math.max(limit * 2, 8)).map((result) => {
    const evidenceCount = getEditorialEvidence(result.term.term)?.sources.length || 0;
    const evidenceBoost = Math.min(0.08, evidenceCount * 0.02);
    const contextBoost = result.matchedSignals.includes("contexto") || result.matchedSignals.includes("intenção") ? 0.05 : 0;
    const reranked = Math.min(1, result.score + evidenceBoost + contextBoost);
    const confidence: RetrievalCandidate["confidence"] = reranked >= 0.72 ? "alta" : reranked >= 0.42 ? "media" : "baixa";
    return {
      term: result.term.term,
      meaning: result.term.meaning,
      score: Number(reranked.toFixed(3)),
      stage: "reranked",
      whyMatched: [...result.matchedSignals, ...(evidenceCount ? ["evidência editorial"] : [])],
      evidenceCount,
      confidence,
    };
  });

  return candidates.sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.min(limit, 10)));
}
