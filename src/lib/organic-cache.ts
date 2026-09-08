import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

type DiscoveryCoverage = {
  publicIndexableTerms: number;
  evidenceBackedTerms: number;
  multiSourceEvidenceTerms: number;
};

let discoveryCoverageCache: DiscoveryCoverage | null = null;

export async function getCachedDiscoveryCoverage(): Promise<DiscoveryCoverage> {
  if (discoveryCoverageCache) return discoveryCoverageCache;

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

  discoveryCoverageCache = {
    publicIndexableTerms,
    evidenceBackedTerms,
    multiSourceEvidenceTerms,
  };

  return discoveryCoverageCache;
}
