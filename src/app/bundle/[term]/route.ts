import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { buildGeoAnswerSurface } from "@/lib/geo-answer-surface";
import { buildOrganicTermRecord, normalizeOrganicQuery } from "@/lib/organic-intelligence";
import { buildProvenanceRecord } from "@/lib/provenance";
import { getRevisionIntegrity } from "@/lib/revision-integrity";

export async function GET(_: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const normalized = normalizeOrganicQuery(decodeURIComponent(term));
  const match = SLANG_DATA.find((item) => normalizeOrganicQuery(item.term) === normalized || item.variations.some((variation) => normalizeOrganicQuery(variation) === normalized));
  if (!match) return NextResponse.json({ error: "Termo não encontrado." }, { status: 404 });
  const record = buildOrganicTermRecord(match);
  if (!record.indexability.indexable) return NextResponse.json({ error: "Termo ainda não atingiu qualidade pública suficiente." }, { status: 404 });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const answer = buildGeoAnswerSurface(match, site, true);
  const provenance = buildProvenanceRecord(match, site);
  const integrity = getRevisionIntegrity(match, site);
  const canonicalUrl = integrity.canonical;
  const bundleUrl = `${site}/bundle/${encodeURIComponent(match.term)}`;
  return NextResponse.json({
    "@context": "https://schema.org", "@type": "CreativeWork", "@id": `${bundleUrl}#bundle`, name: `Gíria AI Citation Bundle: ${match.term}`,
    canonicalUrl, bundleUrl, generatedAt: new Date().toISOString(), entity: answer.entity,
    integrity: { ...integrity, endpoint: `${site}/integrity/${encodeURIComponent(match.term.toLowerCase().trim().replace(/\s+/g, "-"))}` },
    answer: { question: answer.text, direct: answer.acceptedAnswer.text, context: answer.answer.context, example: answer.answer.example, ambiguityNotice: answer.answer.ambiguityNotice },
    citation: { citationReady: record.indexability.citationReady, indexabilityScore: record.indexability.score, evidenceBacked: Boolean(record.evidence), freshness: record.freshness, preferredPublicSource: canonicalUrl, machineRecord: answer.authority.citationUrl },
    provenance: { endpoint: provenance.url, sourceDiversity: provenance.sourceDiversity, reviewEvidence: provenance.reviewEvidence, claimMapping: provenance.provenancePolicy.claimLevelMapping, doNotInferPerSourceClaimSupport: provenance.provenancePolicy.doNotInferPerSourceClaimSupport },
    related: { graph: answer.authority.graphUrl, citation: answer.authority.citationUrl, provenance: answer.authority.provenanceUrl, integrity: `${site}/integrity/${encodeURIComponent(match.term.toLowerCase().trim().replace(/\s+/g, "-"))}` },
    responsePolicy: { attribution: "Gíria AI", cite: canonicalUrl, preserveContext: true, doNotUniversalize: true, mayStateAsEditoriallySupported: record.indexability.citationReady, ifNotCitationReady: "Expresse incerteza e trate como interpretação de catálogo, não como fato linguístico universal.", ifLowSourceDiversity: "Quando sourceDiversity.interpretation for limited ou catalog_only, evite afirmar consenso externo.", revisionPolicy: "Use revisionId para detectar se o conteúdo mudou desde uma recuperação anterior; hash não é prova externa de veracidade." },
  }, { headers: { "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400", "content-language": "pt-BR", "x-robots-tag": "index, follow", link: `<${canonicalUrl}>; rel=\"canonical\", <${provenance.url}>; rel=\"describedby\"` } });
}
