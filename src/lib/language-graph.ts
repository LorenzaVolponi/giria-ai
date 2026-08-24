import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export type LanguageEdgeType = "variation_of" | "same_category" | "same_region" | "shared_origin" | "related_context";
export interface LanguageGraphEdge { target: string; type: LanguageEdgeType; weight: number; }
export interface LanguageGraphNode {
  id: string; term: string; meaning: string; category: string; region: string; origin: string;
  popularityStatus: SlangTerm["popularityStatus"]; variations: string[]; edges: LanguageGraphEdge[];
  temporal: { firstObservedAt: string | null; lastReviewedAt: string | null; freshnessDays: number | null; status: "reviewed" | "catalog_only"; };
  evidence: { sourceCount: number; confidence: "alta" | "media" | "baixa"; };
  provenance: { source: "giria-ai-catalog"; evidence: "catalogued" | "editorially-reviewed"; generatedAt: string; };
}
export function normalizeTerm(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
function overlapScore(a: string, b: string) { const left = new Set(normalizeTerm(a).split(/\W+/).filter((token) => token.length > 3)); const right = new Set(normalizeTerm(b).split(/\W+/).filter((token) => token.length > 3)); if (!left.size || !right.size) return 0; return [...left].filter((token) => right.has(token)).length / Math.max(left.size, right.size); }
function inferEdges(term: SlangTerm): LanguageGraphEdge[] { const edges: LanguageGraphEdge[] = []; for (const candidate of SLANG_DATA.filter((item) => item.term !== term.term)) { const target = normalizeTerm(candidate.term); if (term.variations.some((variation) => normalizeTerm(variation) === target)) { edges.push({ target, type: "variation_of", weight: 1 }); continue; } if (candidate.category === term.category) edges.push({ target, type: "same_category", weight: 0.65 }); if (candidate.region === term.region && term.region !== "Brasil") edges.push({ target, type: "same_region", weight: 0.55 }); const contextWeight = overlapScore(`${term.context} ${term.contextNotes}`, `${candidate.context} ${candidate.contextNotes}`); if (contextWeight >= 0.34) edges.push({ target, type: "related_context", weight: Math.min(0.9, contextWeight) }); } return edges.sort((a, b) => b.weight - a.weight).slice(0, 12); }
function temporalSignals(term: SlangTerm) {
  const evidence = getEditorialEvidence(term.term);
  if (!evidence) return { temporal: { firstObservedAt: null, lastReviewedAt: null, freshnessDays: null, status: "catalog_only" as const }, evidence: { sourceCount: 0, confidence: "baixa" as const } };
  const published = evidence.sources.map((source) => source.publishedAt).filter(Boolean).sort();
  const reviewedAt = new Date(`${evidence.reviewedAt}T00:00:00Z`);
  const freshnessDays = Math.max(0, Math.floor((Date.now() - reviewedAt.getTime()) / 86400000));
  const sourceCount = evidence.sources.length;
  return { temporal: { firstObservedAt: published[0] || null, lastReviewedAt: evidence.reviewedAt, freshnessDays, status: "reviewed" as const }, evidence: { sourceCount, confidence: sourceCount >= 2 ? "alta" as const : "media" as const } };
}
export function getLanguageGraphNode(value: string): LanguageGraphNode | null {
  const normalized = normalizeTerm(value);
  const term = SLANG_DATA.find((item) => normalizeTerm(item.term) === normalized || item.variations.some((variation) => normalizeTerm(variation) === normalized));
  if (!term) return null;
  const signals = temporalSignals(term);
  return { id: normalizeTerm(term.term), term: term.term, meaning: term.meaning, category: term.category, region: term.region, origin: term.origin, popularityStatus: term.popularityStatus, variations: term.variations, edges: inferEdges(term), ...signals, provenance: { source: "giria-ai-catalog", evidence: signals.temporal.status === "reviewed" ? "editorially-reviewed" : "catalogued", generatedAt: new Date().toISOString() } };
}
export function getLanguageGraphIndex() { return SLANG_DATA.map((term) => { const signals = temporalSignals(term); return { id: normalizeTerm(term.term), term: term.term, category: term.category, region: term.region, popularityStatus: term.popularityStatus, temporal: signals.temporal, evidence: signals.evidence }; }); }
