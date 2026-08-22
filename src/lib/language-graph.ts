import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";

export type LanguageEdgeType =
  | "variation_of"
  | "same_category"
  | "same_region"
  | "shared_origin"
  | "related_context";

export interface LanguageGraphEdge {
  target: string;
  type: LanguageEdgeType;
  weight: number;
}

export interface LanguageGraphNode {
  id: string;
  term: string;
  meaning: string;
  category: string;
  region: string;
  origin: string;
  popularityStatus: SlangTerm["popularityStatus"];
  variations: string[];
  edges: LanguageGraphEdge[];
  provenance: {
    source: "giria-ai-catalog";
    evidence: "catalogued";
    generatedAt: string;
  };
}

export function normalizeTerm(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function overlapScore(a: string, b: string) {
  const left = new Set(normalizeTerm(a).split(/\W+/).filter((token) => token.length > 3));
  const right = new Set(normalizeTerm(b).split(/\W+/).filter((token) => token.length > 3));
  if (!left.size || !right.size) return 0;
  return [...left].filter((token) => right.has(token)).length / Math.max(left.size, right.size);
}

function inferEdges(term: SlangTerm): LanguageGraphEdge[] {
  const candidates = SLANG_DATA.filter((item) => item.term !== term.term);
  const edges: LanguageGraphEdge[] = [];

  for (const candidate of candidates) {
    const target = normalizeTerm(candidate.term);
    if (term.variations.some((variation) => normalizeTerm(variation) === target)) {
      edges.push({ target, type: "variation_of", weight: 1 });
      continue;
    }
    if (candidate.category === term.category) edges.push({ target, type: "same_category", weight: 0.65 });
    if (candidate.region === term.region && term.region !== "Brasil") edges.push({ target, type: "same_region", weight: 0.55 });
    const contextWeight = overlapScore(`${term.context} ${term.contextNotes}`, `${candidate.context} ${candidate.contextNotes}`);
    if (contextWeight >= 0.34) edges.push({ target, type: "related_context", weight: Math.min(0.9, contextWeight) });
  }

  return edges.sort((a, b) => b.weight - a.weight).slice(0, 12);
}

export function getLanguageGraphNode(value: string): LanguageGraphNode | null {
  const normalized = normalizeTerm(value);
  const term = SLANG_DATA.find((item) => normalizeTerm(item.term) === normalized || item.variations.some((variation) => normalizeTerm(variation) === normalized));
  if (!term) return null;

  return {
    id: normalizeTerm(term.term),
    term: term.term,
    meaning: term.meaning,
    category: term.category,
    region: term.region,
    origin: term.origin,
    popularityStatus: term.popularityStatus,
    variations: term.variations,
    edges: inferEdges(term),
    provenance: {
      source: "giria-ai-catalog",
      evidence: "catalogued",
      generatedAt: new Date().toISOString(),
    },
  };
}

export function getLanguageGraphIndex() {
  return SLANG_DATA.map((term) => ({
    id: normalizeTerm(term.term),
    term: term.term,
    category: term.category,
    region: term.region,
    popularityStatus: term.popularityStatus,
  }));
}
