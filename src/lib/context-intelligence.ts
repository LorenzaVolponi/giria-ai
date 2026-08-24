import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";

export type ConfidenceLevel = "alta" | "media" | "baixa";
export type ToneLabel = "positivo" | "neutro" | "ironico" | "provocativo" | "sensivel";

export interface ContextIntelligence {
  detectedTerm: SlangTerm | null;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  tone: ToneLabel;
  intent: string;
  platform: string | null;
  ambiguity: boolean;
  clarificationQuestion: string | null;
  contextualMeaning: string;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[“”"'`]/g, "")
    .trim();
}

function containsExpression(text: string, expression: string) {
  const escaped = normalize(expression).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\W)${escaped}(?=$|\\W)`, "i").test(normalize(text));
}

export function detectTermInContext(input: string): SlangTerm | null {
  const candidates = SLANG_DATA.flatMap((term) => [term.term, ...(term.variations || [])].map((expression) => ({ term, expression })))
    .filter(({ expression }) => expression && containsExpression(input, expression))
    .sort((a, b) => b.expression.length - a.expression.length);

  return candidates[0]?.term ?? null;
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

export function analyzeContext(input: string, fallbackTerm: SlangTerm | null = null): ContextIntelligence {
  const detectedTerm = detectTermInContext(input) ?? fallbackTerm;
  const exactInSentence = detectedTerm ? containsExpression(input, detectedTerm.term) || detectedTerm.variations.some((v) => containsExpression(input, v)) : false;
  const hasContext = normalize(input).split(/\s+/).length >= 4;
  const platform = detectPlatform(input, detectedTerm);
  const tone = detectTone(detectedTerm);

  let confidenceScore = detectedTerm ? (exactInSentence ? 0.94 : 0.7) : 0.25;
  if (hasContext && detectedTerm) confidenceScore += 0.03;
  if (platform && detectedTerm) confidenceScore += 0.02;
  confidenceScore = Math.min(0.99, confidenceScore);

  const confidence: ConfidenceLevel = confidenceScore >= 0.85 ? "alta" : confidenceScore >= 0.55 ? "media" : "baixa";
  const ambiguity = !detectedTerm || confidence === "baixa" || (!hasContext && detectedTerm.riskLevel !== "green");
  const clarificationQuestion = ambiguity
    ? platform
      ? "Você consegue me mandar a frase inteira em que isso apareceu?"
      : "Isso apareceu em conversa, TikTok/rede social ou jogo? Se mandar a frase inteira eu consigo cravar melhor."
    : null;

  const contextualMeaning = detectedTerm
    ? hasContext
      ? `Nesse contexto, “${detectedTerm.term}” tende a significar: ${detectedTerm.adultTranslation}`
      : detectedTerm.adultTranslation
    : "Não há evidência suficiente no catálogo para cravar um significado sem mais contexto.";

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
  };
}
