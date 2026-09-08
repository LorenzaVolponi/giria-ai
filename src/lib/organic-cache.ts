import "server-only";

import { unstable_cache } from "next/cache";
import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";
import { getOrganicDataset } from "@/lib/organic-intelligence";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { buildGeoAnswerSurface } from "@/lib/geo-answer-surface";

const ORGANIC_REVALIDATE_SECONDS = 60 * 60;
const DISCOVERY_REVALIDATE_SECONDS = 6 * 60 * 60;

export const getCachedOrganicDataset = unstable_cache(
  async () => getOrganicDataset(),
  ["giria-ai", "organic-dataset", "v2"],
  { revalidate: ORGANIC_REVALIDATE_SECONDS, tags: ["organic-dataset"] },
);

export const getCachedIndexableTerms = unstable_cache(
  async (): Promise<SlangTerm[]> => SLANG_DATA.filter((term) => evaluateIndexQuality(term).indexable),
  ["giria-ai", "indexable-terms", "v2"],
  { revalidate: ORGANIC_REVALIDATE_SECONDS, tags: ["organic-dataset", "indexable-terms"] },
);

export const getCachedGeoAnswers = unstable_cache(
  async () => {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
    const terms = SLANG_DATA.filter((term) => evaluateIndexQuality(term).indexable);
    return terms.map((term) => buildGeoAnswerSurface(term, site, false));
  },
  ["giria-ai", "geo-answer-feed", "v1"],
  { revalidate: ORGANIC_REVALIDATE_SECONDS, tags: ["organic-dataset", "indexable-terms", "geo-answers"] },
);

export const getCachedDiscoveryCoverage = unstable_cache(
  async () => {
    let publicIndexableTerms = 0;
    let evidenceBackedTerms = 0;
    let multiSourceEvidenceTerms = 0;

    for (const term of SLANG_DATA) {
      const quality = evaluateIndexQuality(term);
      if (!quality.indexable) continue;

      publicIndexableTerms += 1;
      const sourceCount = getEditorialEvidence(term.term)?.sources?.length || 0;
      if (sourceCount > 0) evidenceBackedTerms += 1;
      if (sourceCount >= 2) multiSourceEvidenceTerms += 1;
    }

    return {
      publicIndexableTerms,
      evidenceBackedTerms,
      multiSourceEvidenceTerms,
    };
  },
  ["giria-ai", "discovery-coverage", "v1"],
  { revalidate: DISCOVERY_REVALIDATE_SECONDS, tags: ["organic-dataset", "discovery-coverage"] },
);
