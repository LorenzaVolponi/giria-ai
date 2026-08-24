import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";

export interface SemanticSearchResult {
  term: SlangTerm;
  score: number;
  matchedSignals: string[];
}

const STOPWORDS = new Set(["a","o","as","os","de","da","do","das","dos","e","em","um","uma","que","pra","para","por","com","sem","isso","esse","essa","tipo","quando","alguem","alguém","coisa","negocio","negócio"]);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 2 && !STOPWORDS.has(token)));
}

function overlap(query: Set<string>, text: string) {
  const candidate = tokens(text);
  if (!query.size || !candidate.size) return 0;
  let matches = 0;
  for (const token of query) if (candidate.has(token)) matches += 1;
  return matches / Math.sqrt(query.size * candidate.size);
}

export function semanticSearchSlang(input: string, limit = 5): SemanticSearchResult[] {
  const query = tokens(input);
  if (!query.size) return [];

  return SLANG_DATA.map((term) => {
    const signals: Array<[string, number, string]> = [
      [term.term, 1.2, "termo"],
      [term.variations.join(" "), 1.05, "variação"],
      [term.adultTranslation, 1, "tradução"],
      [term.meaning, 0.95, "significado"],
      [term.context, 0.85, "contexto"],
      [term.contextNotes, 0.8, "intenção"],
      [term.category, 0.55, "categoria"],
      [term.origin, 0.4, "origem"],
    ];
    let score = 0;
    const matchedSignals: string[] = [];
    for (const [text, weight, label] of signals) {
      const value = overlap(query, text || "") * weight;
      if (value > 0) { score += value; matchedSignals.push(label); }
    }
    return { term, score: Math.min(1, score), matchedSignals: [...new Set(matchedSignals)] };
  })
    .filter((result) => result.score >= 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 10)));
}
