import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { buildProvenanceRecord } from "@/lib/provenance";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const records = SLANG_DATA
    .filter((term) => evaluateIndexQuality(term).indexable)
    .map((term) => buildProvenanceRecord(term, site))
    .map((record) => ({
      term: record.subject.name,
      canonical: record.canonical,
      provenance: record.url,
      citation: record.citation,
      evidenceBacked: Boolean(record.reviewEvidence),
      sourceDiversity: record.sourceDiversity,
      freshness: record.freshness,
    }));

  return NextResponse.json({
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "@id": `${site}/provenance.json#feed`,
    name: "Gíria AI — Provenance Feed",
    description: "Resumo de proveniência, diversidade de fontes e freshness dos verbetes públicos do Gíria AI.",
    inLanguage: "pt-BR",
    publisher: { "@id": `${site}/#organization` },
    itemCount: records.length,
    provenanceEndpointTemplate: `${site}/provenance/{termo}`,
    policy: {
      claimMapping: "review_set",
      doNotInferPerSourceClaimSupport: true,
      sourceDiversityIsInternalSignal: true,
    },
    dataFeedElement: records,
  }, {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "content-language": "pt-BR",
      "x-robots-tag": "index, follow",
      link: `<${site}/provenance.json>; rel=\"canonical\", <${site}/ai-index.json>; rel=\"describedby\"`,
    },
  });
}
