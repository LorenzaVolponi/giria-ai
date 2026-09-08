import type { SlangTerm } from "@/lib/slang-data";
import { containsIndexedExpression, getIndexedTerm, getRelatedTerms, normalizeSlangKey } from "@/lib/slang-index";

export type ConfidenceLevel = "alta" | "media" | "baixa";
export type ToneLabel = "positivo" | "neutro" | "ironico" | "provocativo" | "sensivel";
export interface ContextAlternative { term: string; meaning: string; reason: string; score: number; }
export interface ContextIntelligence { detectedTerm: SlangTerm | null; confidence: ConfidenceLevel; confidenceScore: number; tone: ToneLabel; intent: string; platform: string | null; ambiguity: boolean; clarificationQuestion: string | null; contextualMeaning: string; alternatives: ContextAlternative[]; }

function normalize(value: string) {
  return normalizeSlangKey(value);
}

function detectFromNgrams(input: string): SlangTerm | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  // A query that is itself a term/variation remains a direct O(1) lookup.
  const direct = getIndexedTerm(normalized);
  if (direct) return direct;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const maxGram = Math.min(6, tokens.length);
  let best: { term: SlangTerm; score: number } | null = null;

  for (let size = maxGram; size >= 1; size--) {
    for (let start = 0; start <= tokens.length - size; start++) {
      const candidate = tokens.slice(start, start + size).join(" ");
      const match = getIndexedTerm(candidate);
      if (!match) continue;

      const canonicalMatch = normalize(match.term) === candidate;

      // Inside a full sentence, a generic one-word variation (for example
      // "falou") is too weak a signal. Standalone variations are still
      // supported by the direct lookup above.
      if (!canonicalMatch && size === 1) continue;

      // Prefer canonical expressions, then longer/more specific matches.
      // This preserves the old longest-expression behavior without scanning
      // every catalog entry or compiling regexes per request.
      const score = (canonicalMatch ? 10_000 : 5_000) + size * 100 + candidate.length;
      if (!best || score > best.score) best = { term: match, score };
    }
  }

  // Do not fuzzy-search arbitrary prose here. Approximate retrieval belongs to
  // the translation/retrieval layer, which can pass a fallbackTerm explicitly.
  return best?.term ?? null;
}

export function detectTermInContext(input: string): SlangTerm | null {
  return detectFromNgrams(input);
}

function detectPlatform(input: string, term: SlangTerm | null) {
  const text = normalize(input);
  if (/tiktok|reels|shorts/.test(text)) return "vídeo curto / redes sociais";
  if (/discord|steam|valorant|lol|fortnite|minecraft|jogo|game|ranked|partida/.test(text)) return "games / comunidade gamer";
  if (/twitter|tweet|x.com|threads/.test(text)) return "rede social / conversa pública";
  if (/whatsapp|grupo|dm|direct|mensagem|mandou|falou/.test(text)) return "mensagem / conversa privada";
  if (term?.category === "gaming" || term?.category === "games") return "games / comunidade gamer";
  if (term?.category === "redes_sociais" || term?.category === "meme") return "redes sociais / cultura digital";
  return null;
}

function detectTone(term: SlangTerm | null): ToneLabel {
  if (!term) return "neutro";
  if (term.riskLevel === "red") return "sensivel";
  if (["ironia", "humor", "zoeira"].includes(term.category)) return "ironico";
  if (["provocacao", "bullying", "insulto_leve"].includes(term.category) || term.riskLevel === "orange") return "provocativo";
  if (["elogio", "flerte", "saudacao"].includes(term.category)) return "positivo";
  return "neutro";
}

function detectIntent(term: SlangTerm | null, tone: ToneLabel) {
  if (!term) return "Interpretar uma expressão possivelmente nova, local ou escrita de forma alternativa.";
  if (term.contextNotes?.trim()) return term.contextNotes.trim();
  if (tone === "ironico") return "Humor, ironia ou reforço de cumplicidade social.";
  if (tone === "provocativo") return "Provocação, julgamento ou disputa de status social.";
  if (tone === "positivo") return "Aproximação, aprovação ou reforço positivo.";
  return "Comunicação informal dependente do contexto da conversa.";
}

function alternativesFor(selected: SlangTerm | null): ContextAlternative[] {
  if (!selected) return [];
  return getRelatedTerms(selected, 2).map((term, index) => ({
    term: term.term,
    meaning: term.adultTranslation || term.meaning,
    reason: term.category === selected.category ? "mesma categoria/contexto próximo" : "o sentido pode mudar conforme a conversa ou comunidade",
    score: Number((0.72 - index * 0.08).toFixed(2)),
  }));
}

export function analyzeContext(input: string, fallbackTerm: SlangTerm | null = null): ContextIntelligence {
  const detectedTerm = detectTermInContext(input) ?? fallbackTerm;
  const exactInSentence = detectedTerm ? containsIndexedExpression(input, detectedTerm) : false;
  const wordCount = normalize(input).split(/\s+/).filter(Boolean).length;
  const hasContext = wordCount >= 4;
  const richContext = wordCount >= 8;
  const platform = detectPlatform(input, detectedTerm);
  const tone = detectTone(detectedTerm);
  const alternatives = alternativesFor(detectedTerm);

  let confidenceScore = detectedTerm ? (exactInSentence ? 0.9 : 0.66) : 0.2;
  if (hasContext && detectedTerm) confidenceScore += 0.04;
  if (richContext && detectedTerm) confidenceScore += 0.03;
  if (platform && detectedTerm) confidenceScore += 0.02;
  if (alternatives.length) confidenceScore -= exactInSentence && hasContext ? 0.05 : 0.12;
  confidenceScore = Math.max(0.1, Math.min(0.99, confidenceScore));

  const confidence: ConfidenceLevel = confidenceScore >= 0.85 ? "alta" : confidenceScore >= 0.55 ? "media" : "baixa";
  const ambiguity = !detectedTerm || confidence === "baixa" || alternatives.length > 0 || (!hasContext && detectedTerm.riskLevel !== "green");
  const clarificationQuestion = ambiguity
    ? alternatives.length
      ? "Essa expressão pode mudar de sentido. Se você colar a frase inteira, eu digo qual interpretação faz mais sentido aqui."
      : platform
        ? "Você consegue me mandar a frase inteira em que isso apareceu?"
        : "Isso apareceu em conversa, rede social ou jogo? Cole a frase inteira que eu interpreto melhor."
    : null;
  const contextualMeaning = detectedTerm
    ? hasContext
      ? `Aqui, “${detectedTerm.term}” provavelmente quer dizer: ${detectedTerm.adultTranslation}`
      : detectedTerm.adultTranslation
    : "Não há evidência suficiente para afirmar o significado com segurança. Envie a frase inteira ou diga onde apareceu.";

  return {
    detectedTerm,
    confidence,
    confidenceScore,
    tone,
    intent: detectIntent(detectedTerm, tone),
    platform,
    ambiguity,
    clarificationQuestion,
    contextualMeaning,
    alternatives,
  };
}
