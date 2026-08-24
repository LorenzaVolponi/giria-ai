import type { SlangTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { getFreshnessSignal } from "@/lib/organic-intelligence";

function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; }
}

function ageDays(date: string) {
  const ts = Date.parse(date);
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, Math.floor((Date.now() - ts) / 86400000));
}

export function buildProvenanceRecord(term: SlangTerm, site: string) {
  const evidence = getEditorialEvidence(term.term);
  const freshness = getFreshnessSignal(term.term);
  const canonicalUrl = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  const provenanceUrl = `${site}/provenance/${encodeURIComponent(term.term)}`;
  const citationUrl = `${site}/citation/${encodeURIComponent(term.term)}`;
  const sources = (evidence?.sources || []).map((source, index) => ({
    id: `${provenanceUrl}#source-${index + 1}`,
    publisher: source.publisher,
    domain: domainOf(source.url),
    title: source.title,
    url: source.url,
    publishedAt: source.publishedAt,
    ageDays: ageDays(source.publishedAt),
    role: "editorial_review_source",
  }));
  const publishers = [...new Set(sources.map((source) => source.publisher))];
  const domains = [...new Set(sources.map((source) => source.domain))];
  const sourceCount = sources.length;
  const publisherDiversity = sourceCount ? publishers.length / sourceCount : 0;
  const domainDiversity = sourceCount ? domains.length / sourceCount : 0;
  const multiSource = sourceCount >= 2;
  const freshnessWeight = freshness.status === "fresh" ? 1 : freshness.status === "aging" ? 0.7 : freshness.status === "stale" ? 0.35 : 0;
  const diversityScore = Math.round(100 * Math.min(1, (publisherDiversity * 0.4) + (domainDiversity * 0.25) + (multiSource ? 0.2 : 0) + (freshnessWeight * 0.15)));

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${provenanceUrl}#record`,
    name: `Proveniência editorial: ${term.term}`,
    url: provenanceUrl,
    canonical: canonicalUrl,
    citation: citationUrl,
    inLanguage: "pt-BR",
    publisher: { "@id": `${site}/#organization` },
    subject: {
      "@type": "DefinedTerm",
      "@id": `${canonicalUrl}#term`,
      name: term.term,
    },
    claims: [
      { id: `${provenanceUrl}#claim-definition`, type: "definition", text: evidence?.definition || term.adultTranslation || term.meaning },
      { id: `${provenanceUrl}#claim-context`, type: "context", text: evidence?.context || term.context },
    ],
    reviewEvidence: evidence ? {
      reviewedAt: evidence.reviewedAt,
      sourceCount,
      publishers,
      domains,
      sources,
      scopeNotice: "As fontes listadas foram usadas na revisão editorial do verbete. O registro não afirma que cada fonte sustenta isoladamente cada frase do texto final.",
    } : null,
    sourceDiversity: {
      score: diversityScore,
      sourceCount,
      uniquePublishers: publishers.length,
      uniqueDomains: domains.length,
      multiSource,
      publisherDiversity: Number(publisherDiversity.toFixed(3)),
      domainDiversity: Number(domainDiversity.toFixed(3)),
      interpretation: sourceCount === 0 ? "catalog_only" : diversityScore >= 70 ? "strong" : diversityScore >= 45 ? "moderate" : "limited",
      disclaimer: "Este score mede diversidade interna das fontes registradas; não representa consenso externo nem qualidade absoluta da fonte.",
    },
    freshness: {
      status: freshness.status,
      score: freshness.score,
      reviewedAt: freshness.reviewedAt,
      latestEvidenceAt: freshness.latestEvidenceAt,
    },
    provenancePolicy: {
      claimLevelMapping: "review_set",
      doNotInferPerSourceClaimSupport: true,
      preservePublisherAttribution: true,
      preferCanonicalCitation: canonicalUrl,
    },
  };
}
