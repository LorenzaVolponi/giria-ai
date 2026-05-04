import { getTerm, searchTerms, type SlangTerm } from "@/lib/slang-data";
import type { InformalityLevel, TranslationResponse } from "@/types/translation";
import { sanitizeUserInput } from "@/lib/security";

const MAX_TEXT = 220;

function toCanonicalNeutral(term: SlangTerm): string {
  return `${term.adultTranslation} Contexto neutro: ${term.context}`;
}

function fromCanonicalNeutral(canonical: string, preferNeutral: boolean): string {
  if (preferNeutral) return canonical;
  return canonical;
}

function isContextUncertain(exactMatch: boolean, normalized: string): boolean {
  if (!exactMatch) return true;
  return normalized.length < 3;
}

function detectInformality(text: string): InformalityLevel {
  const t = text.toLowerCase();
  if (/[!?]{2,}|\b(pqp|krl|fds|slk)\b/.test(t)) return "alta";
  if (t.length > 60 || t.includes("tipo") || t.includes("mano")) return "media";
  return "baixa";
}

export function translateSlang(input: string, options?: { preferNeutral?: boolean }): TranslationResponse {
  const normalized = sanitizeUserInput(input.toLowerCase(), MAX_TEXT);
  if (!normalized) throw new Error("EMPTY_INPUT");

  const preferNeutral = options?.preferNeutral ?? true;
  const exact = getTerm(normalized);
  if (exact) {
    return {
      input,
      normalized,
      versaoNeutraCanonica: toCanonicalNeutral(exact),
      traducaoFormal: fromCanonicalNeutral(toCanonicalNeutral(exact), preferNeutral),
      explicacaoContextual: exact.context,
      intencaoSocialEmocional: exact.contextNotes || "Comunicação informal do dia a dia.",
      nivelInformalidade: detectInformality(normalized),
      source: "local",
    };
  }

  const related = searchTerms(normalized).slice(0, 3);
  if (related.length > 0) {
    const top = related[0];
    return {
      input,
      normalized,
      versaoNeutraCanonica: toCanonicalNeutral(top),
      traducaoFormal: fromCanonicalNeutral(toCanonicalNeutral(top), preferNeutral),
      explicacaoContextual: `Não houve match exato. Melhor aproximação para "${top.term}": ${top.context}`,
      intencaoSocialEmocional: top.contextNotes || "Expressão de grupo/comunidade digital.",
      nivelInformalidade: detectInformality(normalized),
      source: "local",
    };
  }

  const uncertain = isContextUncertain(Boolean(exact), normalized);
  return {
    input,
    normalized,
    versaoNeutraCanonica: "Não há correspondência canônica confirmada; resposta neutra por segurança de contexto.",
    traducaoFormal: uncertain
      ? "Não há correspondência canônica confirmada; resposta neutra por segurança de contexto."
      : "Não encontrei uma tradução exata para essa gíria.",
    explicacaoContextual: "Pode ser uma variação local, meme novo ou grafia alternativa.",
    intencaoSocialEmocional: "Possível tentativa de humor, aproximação social ou reforço de identidade de grupo.",
    nivelInformalidade: detectInformality(normalized),
    source: process.env.TRANSLATION_PROVIDER ? "external" : "local",
  };
}
