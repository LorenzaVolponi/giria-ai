import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";

const SEARCH_STOPWORDS = new Set([
  "a", "ao", "aos", "as", "com", "como", "da", "das", "de", "do", "dos", "e", "em", "essa", "esse", "esta", "este",
  "eu", "foi", "me", "na", "nas", "no", "nos", "o", "os", "ou", "para", "por", "pra", "que", "se", "significa", "um", "uma",
]);

let exactIndex: Map<string, SlangTerm> | null = null;
let categoryIndex: Map<string, SlangTerm[]> | null = null;
let tokenIndex: Map<string, SlangTerm[]> | null = null;
let prefixIndex: Map<string, SlangTerm[]> | null = null;
let searchableText: Map<SlangTerm, string> | null = null;

export function normalizeSlangKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[“”"'`]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeVariations(term: SlangTerm): string[] {
  return Array.isArray(term.variations) ? term.variations.filter((value): value is string => typeof value === "string") : [];
}

function ensurePrimaryIndexes() {
  if (exactIndex && categoryIndex) return;

  const nextExact = new Map<string, SlangTerm>();
  const nextCategory = new Map<string, SlangTerm[]>();

  for (const term of SLANG_DATA) {
    const key = normalizeSlangKey(term.term);
    if (key && !nextExact.has(key)) nextExact.set(key, term);

    for (const variation of safeVariations(term)) {
      const variationKey = normalizeSlangKey(variation);
      if (variationKey && !nextExact.has(variationKey)) nextExact.set(variationKey, term);
    }

    const bucket = nextCategory.get(term.category) ?? [];
    bucket.push(term);
    nextCategory.set(term.category, bucket);
  }

  exactIndex = nextExact;
  categoryIndex = nextCategory;
}

function searchTokens(value: string): string[] {
  return normalizeSlangKey(value)
    .split(" ")
    .filter((token) => token.length >= 2 && !SEARCH_STOPWORDS.has(token));
}

function pushUnique(index: Map<string, SlangTerm[]>, key: string, term: SlangTerm) {
  if (!key) return;
  const bucket = index.get(key);
  if (!bucket) {
    index.set(key, [term]);
    return;
  }
  if (bucket[bucket.length - 1] !== term && !bucket.includes(term)) bucket.push(term);
}

function ensureSearchIndexes() {
  if (tokenIndex && prefixIndex && searchableText) return;

  const nextTokenIndex = new Map<string, SlangTerm[]>();
  const nextPrefixIndex = new Map<string, SlangTerm[]>();
  const nextSearchableText = new Map<SlangTerm, string>();

  for (const term of SLANG_DATA) {
    const fields = [
      term.term,
      ...safeVariations(term),
      term.meaning,
      term.adultTranslation,
      term.category,
      term.region,
    ].filter(Boolean);

    const normalizedText = normalizeSlangKey(fields.join(" "));
    nextSearchableText.set(term, normalizedText);

    const uniqueTokens = new Set(searchTokens(normalizedText));
    for (const token of uniqueTokens) {
      pushUnique(nextTokenIndex, token, term);
      if (token.length >= 3) pushUnique(nextPrefixIndex, token.slice(0, 3), term);
    }
  }

  tokenIndex = nextTokenIndex;
  prefixIndex = nextPrefixIndex;
  searchableText = nextSearchableText;
}

export function getIndexedTerm(value: string): SlangTerm | undefined {
  const key = normalizeSlangKey(value);
  if (!key) return undefined;
  ensurePrimaryIndexes();
  return exactIndex!.get(key);
}

export function resolveIndexedTerm(value: string): SlangTerm | undefined {
  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();

  const direct = getIndexedTerm(decoded);
  if (direct) return direct;

  if (decoded.includes("-")) {
    const slugExpanded = getIndexedTerm(decoded.replace(/-/g, " "));
    if (slugExpanded) return slugExpanded;
  }

  return undefined;
}

export function getRelatedTerms(termOrValue: SlangTerm | string, limit = 5): SlangTerm[] {
  ensurePrimaryIndexes();
  const base = typeof termOrValue === "string" ? resolveIndexedTerm(termOrValue) : termOrValue;
  if (!base) return [];
  return (categoryIndex!.get(base.category) ?? []).filter((term) => term.term !== base.term).slice(0, Math.max(0, limit));
}

export function searchIndexedTerms(query: string, limit = 10): SlangTerm[] {
  const normalizedQuery = normalizeSlangKey(query);
  if (!normalizedQuery || limit <= 0) return [];

  const exact = getIndexedTerm(normalizedQuery);
  if (exact) return [exact];

  ensureSearchIndexes();
  const tokens = searchTokens(normalizedQuery);
  if (tokens.length === 0) return [];

  const scores = new Map<SlangTerm, number>();
  const addScore = (term: SlangTerm, points: number) => scores.set(term, (scores.get(term) ?? 0) + points);

  for (const token of tokens) {
    const exactBucket = tokenIndex!.get(token);
    if (exactBucket) {
      for (const term of exactBucket) addScore(term, 12);
      continue;
    }

    if (token.length >= 3) {
      const prefixBucket = prefixIndex!.get(token.slice(0, 3)) ?? [];
      for (const term of prefixBucket) {
        const haystack = searchableText!.get(term) ?? "";
        if (haystack.includes(token)) addScore(term, 5);
      }
    }
  }

  return [...scores.entries()]
    .map(([term, score]) => {
      const termKey = normalizeSlangKey(term.term);
      const variationKeys = safeVariations(term).map(normalizeSlangKey);
      let finalScore = score;
      if (termKey.startsWith(normalizedQuery)) finalScore += 80;
      else if (termKey.includes(normalizedQuery)) finalScore += 55;
      if (variationKeys.some((value) => value === normalizedQuery)) finalScore += 75;
      else if (variationKeys.some((value) => value.includes(normalizedQuery))) finalScore += 45;
      for (const token of tokens) {
        if (termKey === token) finalScore += 30;
        else if (termKey.includes(token)) finalScore += 18;
        if (variationKeys.some((value) => value.includes(token))) finalScore += 12;
      }
      return { term, score: finalScore };
    })
    .sort((a, b) => b.score - a.score || a.term.term.localeCompare(b.term.term, "pt-BR"))
    .slice(0, limit)
    .map(({ term }) => term);
}

export function containsIndexedExpression(input: string, term: SlangTerm): boolean {
  const normalizedInput = ` ${normalizeSlangKey(input)} `;
  if (!normalizedInput.trim()) return false;
  const expressions = [term.term, ...safeVariations(term)];
  return expressions.some((expression) => {
    const key = normalizeSlangKey(expression);
    return key.length > 0 && normalizedInput.includes(` ${key} `);
  });
}
