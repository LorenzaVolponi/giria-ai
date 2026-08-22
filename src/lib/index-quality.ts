import type { SlangTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export interface IndexQuality {
  indexable: boolean;
  score: number;
  reasons: string[];
}

export function evaluateIndexQuality(term: SlangTerm): IndexQuality {
  let score = 0;
  const reasons: string[] = [];
  const evidence = getEditorialEvidence(term.term);

  if (term.meaning.trim().length >= 35) { score += 2; reasons.push("definição substancial"); }
  if (term.context.trim().length >= 45) { score += 2; reasons.push("contexto substancial"); }
  if (term.safeExample?.trim().length >= 12) { score += 1; reasons.push("exemplo registrado"); }
  if (term.origin?.trim().length >= 20) { score += 1; reasons.push("origem registrada"); }
  if (term.variations?.length) { score += 1; reasons.push("variações registradas"); }
  if (evidence?.sources?.length) { score += 3; reasons.push("evidência editorial externa"); }

  return { indexable: score >= 6, score, reasons };
}
