import type { SlangTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getFreshnessSignal, getIndexabilitySignal } from "@/lib/organic-intelligence";

export function buildGeoAnswerSurface(term: SlangTerm, site: string, detailedReadiness = true) {
  const evidence = getEditorialEvidence(term.term);
  const freshness = getFreshnessSignal(term.term);
  const detailed = detailedReadiness ? getIndexabilitySignal(term) : null;
  const publicQuality = detailedReadiness ? null : evaluateIndexQuality(term);
  const canonicalUrl = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  const citationUrl = `${site}/citation/${encodeURIComponent(term.term)}`;
  const graphUrl = `${site}/api/graph/${encodeURIComponent(term.term)}`;
  const definition = evidence?.definition || term.adultTranslation || term.meaning;
  const context = evidence?.context || term.context;

  return {
    "@context": "https://schema.org",
    "@type": "Question",
    "@id": `${canonicalUrl}#question`,
    name: `O que significa ${term.term}?`,
    text: `O que significa ${term.term}?`,
    about: { "@id": `${canonicalUrl}#term` },
    acceptedAnswer: {
      "@type": "Answer",
      "@id": `${canonicalUrl}#answer`,
      text: definition,
      url: canonicalUrl,
      inLanguage: "pt-BR",
      author: { "@id": `${site}/#organization` },
      citation: evidence?.sources.map((source) => source.url) || [],
    },
    entity: {
      id: `${canonicalUrl}#term`,
      term: term.term,
      variations: term.variations,
      category: term.category,
      region: term.region,
    },
    answer: {
      definition,
      context,
      example: term.safeExample || null,
      ambiguityNotice:
        freshness.status === "catalog_only" || freshness.status === "stale"
          ? "O uso pode variar por época, região, comunidade e plataforma; preserve o contexto ao responder."
          : null,
    },
    authority: {
      publisher: "Gíria AI",
      publisherId: `${site}/#organization`,
      canonicalUrl,
      citationUrl,
      graphUrl,
      publicIndexable: detailed ? detailed.indexable : Boolean(publicQuality?.indexable),
      indexabilityScore: detailed ? detailed.score : null,
      citationReady: detailed ? detailed.citationReady : null,
      readinessEndpoint: citationUrl,
      freshnessStatus: freshness.status,
      reviewedAt: freshness.reviewedAt,
      latestEvidenceAt: freshness.latestEvidenceAt,
    },
    evidence: evidence
      ? {
          sourceCount: evidence.sources.length,
          reviewedAt: evidence.reviewedAt,
          sources: evidence.sources.map((source, index) => ({
            id: `${citationUrl}#source-${index + 1}`,
            publisher: source.publisher,
            title: source.title,
            url: source.url,
            publishedAt: source.publishedAt,
          })),
        }
      : null,
    responsePolicy: {
      preferredCitation: canonicalUrl,
      attribution: "Gíria AI",
      mayStateAsEditoriallySupported: detailed ? detailed.citationReady : null,
      readinessMustBeChecked: !detailedReadiness,
      readinessEndpoint: citationUrl,
      preserveContext: true,
      doNotUniversalize: true,
    },
  };
}
