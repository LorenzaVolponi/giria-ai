import { SLANG_DATA } from "@/lib/slang-data";
import { semanticSearchSlang } from "@/lib/semantic-search";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

const MAX_LIMIT = 20;

export function listPublicTerms(limit = 10, cursor = 0) {
  const safeLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 10, MAX_LIMIT));
  const safeCursor = Math.max(0, Number.isFinite(cursor) ? cursor : 0);
  const items = SLANG_DATA.slice(safeCursor, safeCursor + safeLimit).map(toPublicTerm);
  const nextCursor = safeCursor + items.length < SLANG_DATA.length ? safeCursor + items.length : null;
  return { items, nextCursor, total: SLANG_DATA.length };
}

export function getPublicTerm(term: string) {
  const normalized = term.trim().toLowerCase();
  const match = SLANG_DATA.find((item) => item.term.toLowerCase() === normalized || item.variations.some((v) => v.toLowerCase() === normalized));
  return match ? toPublicTerm(match) : null;
}

export function searchPublicIntelligence(query: string, limit = 5) {
  return semanticSearchSlang(query, Math.max(1, Math.min(limit, 10))).map(({ term, score, matchedSignals }) => ({
    ...toPublicTerm(term),
    relevance: Number(score.toFixed(3)),
    matchedSignals,
  }));
}

function toPublicTerm(term: (typeof SLANG_DATA)[number]) {
  const evidence = getEditorialEvidence(term.term);
  return {
    term: term.term,
    meaning: term.meaning,
    translation: term.adultTranslation,
    context: term.context,
    category: term.category,
    variations: term.variations,
    origin: term.origin,
    popularity: term.popularity,
    editorial: evidence ? {
      reviewedAt: evidence.reviewedAt,
      sourceCount: evidence.sources.length,
      sources: evidence.sources.map(({ publisher, title, url, publishedAt }) => ({ publisher, title, url, publishedAt })),
    } : null,
  };
}
