import { SLANG_VARIANT_RULES, type RegionCode } from "@/config/slang-variants";
import { getTerm, searchTerms } from "@/lib/slang-data";
import { sanitizeUserInput } from "@/lib/security";
import type { InformalityLevel, TranslationResponse } from "@/types/translation";

const MAX_TEXT = 220;

type TranslateOptions = {
  region?: string;
};

function detectInformality(text: string): InformalityLevel {
  const t = text.toLowerCase();
  if (/[!?]{2,}|\b(pqp|krl|fds|slk)\b/.test(t)) return "alta";
  if (t.length > 60 || t.includes("tipo") || t.includes("mano")) return "media";
  return "baixa";
}

function resolveRegionalVariant(baseTerm: string, requestedRegion?: string) {
  const rule = SLANG_VARIANT_RULES.find((entry) => entry.base_term === baseTerm);
  if (!rule) {
    return { appliedTerm: baseTerm, appliedRegion: undefined, usedFallback: true, safetyNotes: undefined };
  }

  if (!requestedRegion) {
    return { appliedTerm: baseTerm, appliedRegion: undefined, usedFallback: true, safetyNotes: rule.safety_notes };
  }

  const regionalTerm = rule.regional_variants[requestedRegion as RegionCode];
  if (!regionalTerm) {
    return { appliedTerm: baseTerm, appliedRegion: undefined, usedFallback: true, safetyNotes: rule.safety_notes };
  }

  return { appliedTerm: regionalTerm, appliedRegion: requestedRegion, usedFallback: false, safetyNotes: rule.safety_notes };
}

export function translateSlang(input: string, options: TranslateOptions = {}): TranslationResponse {
  const normalized = sanitizeUserInput(input.toLowerCase(), MAX_TEXT);
  if (!normalized) throw new Error("EMPTY_INPUT");

  const exact = getTerm(normalized);
  if (exact) {
    const regionalization = resolveRegionalVariant(exact.term, options.region);
    return {
      input,
      normalized,
      traducaoFormal: exact.adultTranslation,
      explicacaoContextual: exact.context,
      intencaoSocialEmocional: exact.contextNotes || "Comunicação informal do dia a dia.",
      nivelInformalidade: detectInformality(normalized),
      source: "local",
      regionalTermApplied: regionalization.appliedTerm,
      regionalization: {
        requestedRegion: options.region,
        appliedRegion: regionalization.appliedRegion,
        usedFallback: regionalization.usedFallback,
        safetyNotes: regionalization.safetyNotes,
      },
    };
  }

  const related = searchTerms(normalized).slice(0, 3);
  if (related.length > 0) {
    const top = related[0];
    const regionalization = resolveRegionalVariant(top.term, options.region);
    return {
      input,
      normalized,
      traducaoFormal: top.adultTranslation,
      explicacaoContextual: `Não houve match exato. Melhor aproximação para "${regionalization.appliedTerm}": ${top.context}`,
      intencaoSocialEmocional: top.contextNotes || "Expressão de grupo/comunidade digital.",
      nivelInformalidade: detectInformality(normalized),
      source: "local",
      regionalTermApplied: regionalization.appliedTerm,
      regionalization: {
        requestedRegion: options.region,
        appliedRegion: regionalization.appliedRegion,
        usedFallback: regionalization.usedFallback,
        safetyNotes: regionalization.safetyNotes,
      },
    };
  }

  return {
    input,
    normalized,
    traducaoFormal: "Não encontrei uma tradução exata para essa gíria.",
    explicacaoContextual: "Pode ser uma variação local, meme novo ou grafia alternativa.",
    intencaoSocialEmocional: "Possível tentativa de humor, aproximação social ou reforço de identidade de grupo.",
    nivelInformalidade: detectInformality(normalized),
    source: process.env.TRANSLATION_PROVIDER ? "external" : "local",
    regionalization: {
      requestedRegion: options.region,
      usedFallback: true,
    },
  };
}
