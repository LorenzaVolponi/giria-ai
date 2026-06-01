export type SuggestionQualityInput = {
  term: string;
  meaning: string;
  context?: string;
  submitterName?: string;
  submitterWhatsapp?: string;
  submitterEmail?: string;
};

export type SuggestionRecommendation = "approve" | "review" | "reject";

export type SuggestionQuality = {
  recommendation: SuggestionRecommendation;
  confidence: number;
  label: string;
  reasons: string[];
  blockers: string[];
  scoreParts: Array<{ label: string; ok: boolean; detail: string }>;
};

const offensivePattern = /\b(idiota|otario|otário|racista|nazista|fdp|vsf|caralho|porra)\b/i;
const garbagePattern = /(.)\1{5,}|\b(test|asdf|1234|kkkk|lol)\b/i;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function wordCount(value: string) {
  return (value.trim().match(/[\p{L}\p{N}]+/gu) || []).length;
}

export function analyzeSuggestionQuality(input: SuggestionQualityInput, baseScore = 0): SuggestionQuality {
  const term = input.term.trim().toLowerCase();
  const meaning = input.meaning.trim();
  const context = input.context?.trim() || "";
  const combined = `${term} ${meaning} ${context}`;
  const letters = (term.match(/\p{L}/gu) || []).length;
  const vowels = (term.match(/[aeiouáàâãéêíóôõú]/gi) || []).length;
  const consonants = (term.match(/[bcdfghjklmnpqrstvwxyzç]/gi) || []).length;
  const reasons: string[] = [];
  const blockers: string[] = [];
  let heuristicScore = clamp01(baseScore);

  const scoreParts: SuggestionQuality["scoreParts"] = [];
  const addPart = (label: string, ok: boolean, detail: string, delta: number) => {
    scoreParts.push({ label, ok, detail });
    heuristicScore = clamp01(heuristicScore + (ok ? delta : -Math.abs(delta) / 2));
    if (ok) reasons.push(detail);
  };

  if (letters < 2) blockers.push("Termo com poucas letras reais.");
  if (term.length > 40 || meaning.length > 280 || context.length > 280) blockers.push("Texto acima do limite seguro.");
  if (garbagePattern.test(combined)) blockers.push("Padrão de teste/repetição detectado.");
  if (offensivePattern.test(combined)) blockers.push("Termo ofensivo sensível exige revisão humana.");
  if (term.length > 3 && vowels === 0) blockers.push("Termo sem vogais, provável ruído.");
  if (term.length >= 6 && consonants > vowels * 4) blockers.push("Padrão consonantal artificial.");

  addPart("Termo legível", letters >= 2 && term.length <= 40, "Termo tem tamanho e letras suficientes.", 0.08);
  addPart("Significado útil", wordCount(meaning) >= 2, "Significado tem descrição mínima para publicar.", 0.12);
  addPart("Contexto informado", wordCount(context) >= 2, "Contexto ajuda a validar uso real.", 0.08);
  addPart("Contato rastreável", Boolean(input.submitterEmail || input.submitterWhatsapp), "Envio tem contato para auditoria/retorno.", 0.04);
  addPart("Sinal forte", baseScore >= 0.72, "Score automático indica alta confiança.", 0.16);

  let recommendation: SuggestionRecommendation = "review";
  if (blockers.length > 0 || heuristicScore < 0.22) recommendation = "reject";
  else if (heuristicScore >= 0.82 && wordCount(meaning) >= 2) recommendation = "approve";

  const label = recommendation === "approve" ? "Aprovar automaticamente" : recommendation === "reject" ? "Rejeitar/segurar" : "Revisar no painel";

  return {
    recommendation,
    confidence: clamp01(heuristicScore),
    label,
    reasons: reasons.slice(0, 5),
    blockers,
    scoreParts,
  };
}
