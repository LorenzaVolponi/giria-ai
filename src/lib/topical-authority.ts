import { SLANG_DATA } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getFreshnessSignal } from "@/lib/organic-intelligence";

type ClusterAccumulator = {
  id: string;
  terms: number;
  indexableTerms: number;
  evidenceBackedTerms: number;
  multiSourceTerms: number;
  freshEvidenceTerms: number;
  examples: string[];
};

function clusterId(category: string, region: string) {
  const normalizedCategory = String(category || "outros").trim().toLowerCase();
  const normalizedRegion = String(region || "brasil").trim().toLowerCase();
  return `${normalizedCategory}:${normalizedRegion}`;
}

export function getTopicalAuthorityMap() {
  const clusters = new Map<string, ClusterAccumulator>();

  for (const term of SLANG_DATA) {
    const id = clusterId(term.category, term.region);
    const current = clusters.get(id) || {
      id,
      terms: 0,
      indexableTerms: 0,
      evidenceBackedTerms: 0,
      multiSourceTerms: 0,
      freshEvidenceTerms: 0,
      examples: [],
    };
    const evidence = getEditorialEvidence(term.term);
    const freshness = getFreshnessSignal(term.term);
    const quality = evaluateIndexQuality(term);

    current.terms += 1;
    if (quality.indexable) current.indexableTerms += 1;
    if (evidence?.sources.length) current.evidenceBackedTerms += 1;
    if ((evidence?.sources.length || 0) >= 2) current.multiSourceTerms += 1;
    if (evidence && freshness.score >= 60) current.freshEvidenceTerms += 1;
    if (current.examples.length < 5 && quality.indexable) current.examples.push(term.term);
    clusters.set(id, current);
  }

  return [...clusters.values()]
    .map((cluster) => {
      const indexCoverage = cluster.terms ? cluster.indexableTerms / cluster.terms : 0;
      const evidenceCoverage = cluster.terms ? cluster.evidenceBackedTerms / cluster.terms : 0;
      const multiSourceCoverage = cluster.terms ? cluster.multiSourceTerms / cluster.terms : 0;
      const freshnessCoverage = cluster.evidenceBackedTerms ? cluster.freshEvidenceTerms / cluster.evidenceBackedTerms : 0;
      const authorityScore = Math.round(
        100 * (indexCoverage * 0.35 + evidenceCoverage * 0.3 + multiSourceCoverage * 0.2 + freshnessCoverage * 0.15),
      );
      const evidenceGap = Math.max(0, cluster.indexableTerms - cluster.evidenceBackedTerms);
      const opportunityScore = Math.min(100, Math.round(evidenceGap * 4 + (100 - authorityScore) * 0.55));
      return {
        ...cluster,
        authorityScore,
        opportunityScore,
        coverage: {
          indexable: Number(indexCoverage.toFixed(3)),
          evidenceBacked: Number(evidenceCoverage.toFixed(3)),
          multiSource: Number(multiSourceCoverage.toFixed(3)),
          freshEvidence: Number(freshnessCoverage.toFixed(3)),
        },
      };
    })
    .sort((a, b) => b.authorityScore - a.authorityScore || b.indexableTerms - a.indexableTerms);
}

export function getTopicalAuthoritySummary() {
  const clusters = getTopicalAuthorityMap();
  const totalTerms = clusters.reduce((sum, item) => sum + item.terms, 0);
  const indexableTerms = clusters.reduce((sum, item) => sum + item.indexableTerms, 0);
  const evidenceBackedTerms = clusters.reduce((sum, item) => sum + item.evidenceBackedTerms, 0);
  const multiSourceTerms = clusters.reduce((sum, item) => sum + item.multiSourceTerms, 0);
  return {
    totalTerms,
    indexableTerms,
    evidenceBackedTerms,
    multiSourceTerms,
    authorityClusters: clusters.length,
    strongestClusters: clusters.slice(0, 10),
    editorialOpportunities: [...clusters]
      .filter((item) => item.indexableTerms > 0)
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 15),
  };
}
