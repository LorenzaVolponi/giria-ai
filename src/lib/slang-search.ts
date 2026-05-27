import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";

export type SearchStage = "exact" | "variation" | "prefix_token" | "fuzzy";

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''"\u2019]/g, "")
    .replace(/[.,;:!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type NormalizedTermEntry = { normalized: string; term: SlangTerm };
type SearchIndexes = {
  exactTermIndex: Map<string, SlangTerm[]>;
  variationIndex: Map<string, SlangTerm[]>;
  prefixIndex: Map<string, Set<string>>;
  ngramIndex: Map<string, Set<string>>;
  normalizedPool: NormalizedTermEntry[];
};

const fuzzyCache = new Map<string, { ts: number; items: Array<{ term: SlangTerm; score: number }> }>();
const FUZZY_CACHE_TTL_MS = 5 * 60 * 1000;

let indexes: SearchIndexes | null = null;

function makeNgrams(value: string, n = 3): string[] {
  if (value.length <= n) return [value];
  const grams: string[] = [];
  for (let i = 0; i <= value.length - n; i++) grams.push(value.slice(i, i + n));
  return grams;
}

function addIndex(map: Map<string, SlangTerm[]>, key: string, term: SlangTerm) {
  const existing = map.get(key);
  if (existing) existing.push(term);
  else map.set(key, [term]);
}

function buildIndexes(): SearchIndexes {
  const exactTermIndex = new Map<string, SlangTerm[]>();
  const variationIndex = new Map<string, SlangTerm[]>();
  const prefixIndex = new Map<string, Set<string>>();
  const ngramIndex = new Map<string, Set<string>>();
  const normalizedPool: NormalizedTermEntry[] = [];

  for (const term of SLANG_DATA) {
    const normalizedTerm = normalize(term.term);
    normalizedPool.push({ normalized: normalizedTerm, term });
    addIndex(exactTermIndex, normalizedTerm, term);

    if (Array.isArray(term.variations)) {
      for (const variation of term.variations) {
        const normalizedVariation = normalize(variation);
        if (normalizedVariation && normalizedVariation !== normalizedTerm) {
          addIndex(variationIndex, normalizedVariation, term);
        }
      }
    }

    const searchableKeys = new Set([normalizedTerm, ...(term.variations ?? []).map(normalize)]);
    for (const key of searchableKeys) {
      if (!key) continue;
      const prefixLimit = Math.min(5, key.length);
      for (let i = 2; i <= prefixLimit; i++) {
        const prefix = key.slice(0, i);
        const keys = prefixIndex.get(prefix) ?? new Set<string>();
        keys.add(normalizedTerm);
        prefixIndex.set(prefix, keys);
      }
      for (const gram of makeNgrams(key)) {
        const keys = ngramIndex.get(gram) ?? new Set<string>();
        keys.add(normalizedTerm);
        ngramIndex.set(gram, keys);
      }
    }
  }

  return { exactTermIndex, variationIndex, prefixIndex, ngramIndex, normalizedPool };
}

function getIndexes(): SearchIndexes {
  if (!indexes) indexes = buildIndexes();
  return indexes;
}

export function getTermIndex(): Map<string, SlangTerm[]> {
  const { exactTermIndex, variationIndex } = getIndexes();
  const merged = new Map(exactTermIndex);
  for (const [key, value] of variationIndex.entries()) {
    const existing = merged.get(key) ?? [];
    merged.set(key, [...existing, ...value]);
  }
  return merged;
}

export function lookupTerm(query: string): { stage: SearchStage | null; items: SlangTerm[] } {
  const normalized = normalize(query);
  if (!normalized) return { stage: null, items: [] };

  const { exactTermIndex, variationIndex, prefixIndex, ngramIndex, normalizedPool } = getIndexes();

  const exact = exactTermIndex.get(normalized);
  if (exact?.length) return { stage: "exact", items: exact };

  const variation = variationIndex.get(normalized);
  if (variation?.length) return { stage: "variation", items: variation };

  if (normalized.length >= 2) {
    const prefixMatches = prefixIndex.get(normalized.slice(0, Math.min(5, normalized.length)));
    if (prefixMatches?.size) {
      const found = [...prefixMatches]
        .flatMap((key) => exactTermIndex.get(key) ?? [])
        .slice(0, 5);
      if (found.length) return { stage: "prefix_token", items: found };
    }
  }

  const closest = findClosestTermsWithScore(normalized, 5, { ngramIndex, normalizedPool });
  return { stage: closest.length ? "fuzzy" : null, items: closest.map((x) => x.term) };
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

export function shouldSkipFuzzy(query: string): boolean {
  const normalized = normalize(query);
  if (normalized.length < 3) return true;
  const alphaNum = normalized.replace(/[^a-z0-9]/g, "");
  return alphaNum.length < 3 || /^([a-z0-9])\1+$/.test(alphaNum);
}

export function findClosestTermsWithScore(query: string, limit = 5, override?: Pick<SearchIndexes, "ngramIndex" | "normalizedPool">): Array<{ term: SlangTerm; score: number }> {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery || shouldSkipFuzzy(normalizedQuery)) return [];

  const cacheKey = `${normalizedQuery}:${limit}`;
  const cached = fuzzyCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < FUZZY_CACHE_TTL_MS) return cached.items;

  const { ngramIndex, normalizedPool } = override ?? getIndexes();
  const candidateKeys = new Set<string>();
  for (const gram of makeNgrams(normalizedQuery)) {
    for (const key of ngramIndex.get(gram) ?? []) candidateKeys.add(key);
  }

  const candidatePool = candidateKeys.size
    ? normalizedPool.filter((entry) => candidateKeys.has(entry.normalized))
    : normalizedPool;

  const ranked = candidatePool
    .map((entry) => ({ term: entry.term, score: levenshtein(normalizedQuery, entry.normalized) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  fuzzyCache.set(cacheKey, { ts: Date.now(), items: ranked });
  if (fuzzyCache.size > 500) {
    const entries = Array.from(fuzzyCache.entries()).sort((a, b) => a[1].ts - b[1].ts);
    for (const [key] of entries.slice(0, entries.length - 500)) fuzzyCache.delete(key);
  }

  return ranked;
}

export function lookupMultipleTerms(phrase: string): Map<string, SlangTerm> {
  const words = normalize(phrase).split(" ");
  const found = new Map<string, SlangTerm>();
  const { exactTermIndex } = getIndexes();

  for (let len = 4; len >= 2; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const chunk = words.slice(i, i + len).join(" ");
      const match = exactTermIndex.get(chunk);
      if (match?.length && !found.has(normalize(match[0].term))) found.set(normalize(match[0].term), match[0]);
    }
  }

  for (const word of words) {
    if (word.length < 2 || found.has(word)) continue;
    const match = exactTermIndex.get(word);
    if (match?.length) found.set(word, match[0]);
  }

  return found;
}
