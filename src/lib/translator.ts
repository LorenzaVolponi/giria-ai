import { getTerm, searchTerms } from "@/lib/slang-data";
import type { InformalityLevel, SlangLevel, TranslationResponse } from "@/types/translation";
import { sanitizeUserInput } from "@/lib/security";

const MAX_TEXT = 220;
const SENSITIVE_CONTEXT_PATTERNS = /\b(suporte|cobranca|cobrança|juridico|jurídico|legal|advogad|notifica(c|ç)ao|formal)\b/i;

function detectInformality(text: string): InformalityLevel {
  const t = text.toLowerCase();
  if (/[!?]{2,}|\b(pqp|krl|fds|slk)\b/.test(t)) return "alta";
  if (t.length > 60 || t.includes("tipo") || t.includes("mano")) return "media";
  return "baixa";
}

function applyRegionalTone(text: string, slangLevel: SlangLevel): string {
  if (slangLevel !== "regional" && slangLevel !== "heavy") return text;
  return text
    .replace(/\bvoc[eê]\b/gi, "cê")
    .replace(/\bpara\b/gi, "pra")
    .replace(/\bmuito\b/gi, "mó");
}

function resolveSlangLevel(input: string, context?: string, requestedLevel: SlangLevel = "light"): SlangLevel {
  const combined = `${input} ${context ?? ""}`;
  if (SENSITIVE_CONTEXT_PATTERNS.test(combined)) return "none";
  return requestedLevel;
}

export function translateSlang(input: string, options?: { slangLevel?: SlangLevel; context?: string }): TranslationResponse {
  const normalized = sanitizeUserInput(input.toLowerCase(), MAX_TEXT);
  if (!normalized) throw new Error("EMPTY_INPUT");
  const slangLevel = resolveSlangLevel(normalized, options?.context, options?.slangLevel ?? "light");

  const exact = getTerm(normalized);
  if (exact) {
    return {
      input,
      normalized,
      traducaoFormal: applyRegionalTone(exact.adultTranslation, slangLevel),
      explicacaoContextual: applyRegionalTone(exact.context, slangLevel),
      intencaoSocialEmocional: exact.contextNotes || "Comunicação informal do dia a dia.",
      nivelInformalidade: detectInformality(normalized),
      slangLevel,
      source: "local",
    };
  }

  const related = searchTerms(normalized).slice(0, 3);
  if (related.length > 0) {
    const top = related[0];
    return {
      input,
      normalized,
      traducaoFormal: applyRegionalTone(top.adultTranslation, slangLevel),
      explicacaoContextual: applyRegionalTone(`Não houve match exato. Melhor aproximação para "${top.term}": ${top.context}`, slangLevel),
      intencaoSocialEmocional: top.contextNotes || "Expressão de grupo/comunidade digital.",
      nivelInformalidade: detectInformality(normalized),
      slangLevel,
      source: "local",
    };
  }

  return {
    input,
    normalized,
    traducaoFormal: "Não encontrei uma tradução exata para essa gíria.",
    explicacaoContextual: "Pode ser uma variação local, meme novo ou grafia alternativa.",
    intencaoSocialEmocional: "Possível tentativa de humor, aproximação social ou reforço de identidade de grupo.",
    nivelInformalidade: detectInformality(normalized),
    slangLevel,
    source: process.env.TRANSLATION_PROVIDER ? "external" : "local",
  };
}
