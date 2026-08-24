import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export function getCanonicalRecord(termValue: string) {
  const normalized = termValue.trim().toLowerCase();
  const term = SLANG_DATA.find((item) => item.term.toLowerCase() === normalized || item.variations.some((variation) => variation.toLowerCase() === normalized));
  if (!term) return null;
  const quality = evaluateIndexQuality(term);
  const evidence = getEditorialEvidence(term.term);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonical = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  return {
    term: term.term,
    definition: evidence?.definition || term.meaning,
    context: evidence?.context || term.context,
    canonical,
    indexable: quality.indexable,
    qualityScore: quality.score,
    reviewedAt: evidence?.reviewedAt || null,
    sources: evidence?.sources || [],
    citation: { name: "Gíria AI", url: canonical, language: "pt-BR" },
  };
}

export function getIndexableCanonicalRecords() {
  return SLANG_DATA.map((term) => getCanonicalRecord(term.term)).filter((record): record is NonNullable<typeof record> => Boolean(record?.indexable));
}
