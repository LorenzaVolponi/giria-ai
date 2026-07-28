import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;

interface IndexedTerm {
  item: SlangTerm;
  term: string;
  variations: string[];
  category: string;
  region: string;
  searchable: string;
}

let cachedIndex: IndexedTerm[] | null = null;
let cachedExactMap: Map<string, SlangTerm> | null = null;

export function normalizeSlangText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getIndex(): IndexedTerm[] {
  if (cachedIndex) return cachedIndex;

  const seen = new Set<string>();
  cachedIndex = [];

  for (const item of SLANG_DATA) {
    const term = normalizeSlangText(item.term);
    if (!term || seen.has(term)) continue;
    seen.add(term);

    const variations = (item.variations ?? [])
      .map(normalizeSlangText)
      .filter(Boolean);
    const category = normalizeSlangText(item.category);
    const region = normalizeSlangText(item.region);

    cachedIndex.push({
      item,
      term,
      variations,
      category,
      region,
      searchable: [term, ...variations, category, region].join(" "),
    });
  }

  return cachedIndex;
}

function getExactMap(): Map<string, SlangTerm> {
  if (cachedExactMap) return cachedExactMap;

  cachedExactMap = new Map<string, SlangTerm>();
  for (const entry of getIndex()) {
    if (!cachedExactMap.has(entry.term)) cachedExactMap.set(entry.term, entry.item);
    for (const variation of entry.variations) {
      if (!cachedExactMap.has(variation)) cachedExactMap.set(variation, entry.item);
    }
  }

  return cachedExactMap;
}

export function findSlangTerm(query: string): SlangTerm | undefined {
  const normalized = normalizeSlangText(query);
  if (!normalized) return undefined;
  return getExactMap().get(normalized);
}

export function searchSlangTerms(query: string, limit = DEFAULT_LIMIT): SlangTerm[] {
  const normalized = normalizeSlangText(query);
  if (!normalized) return [];

  const safeLimit = Math.max(1, Math.min(limit, MAX_LIMIT));
  const queryTokens = normalized.split(" ").filter(Boolean);

  return getIndex()
    .map((entry) => {
      let score = 0;
      if (entry.term === normalized) score += 100;
      else if (entry.term.startsWith(normalized)) score += 70;
      else if (entry.term.includes(normalized)) score += 50;

      if (entry.variations.some((variation) => variation === normalized)) score += 90;
      else if (entry.variations.some((variation) => variation.startsWith(normalized))) score += 60;
      else if (entry.variations.some((variation) => variation.includes(normalized))) score += 40;

      if (entry.category === normalized || entry.region === normalized) score += 35;
      for (const token of queryTokens) {
        if (entry.searchable.includes(token)) score += 6;
      }

      return { item: entry.item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.term.localeCompare(b.item.term, "pt-BR"))
    .slice(0, safeLimit)
    .map((entry) => entry.item);
}

export function getSlangPage(offset = 0, limit = 40): SlangTerm[] {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, Math.min(limit, MAX_LIMIT));
  return getIndex()
    .slice(safeOffset, safeOffset + safeLimit)
    .map((entry) => entry.item);
}

export function getSlangCount(): number {
  return getIndex().length;
}
