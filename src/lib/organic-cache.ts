import "server-only";

import { unstable_cache } from "next/cache";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

const DISCOVERY_REVALIDATE_SECONDS = 6 * 60 * 60;

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
  { revalidate: DISCOVERY_REVALIDATE_SECONDS, tags: ["discovery-coverage"] },
);
