import { NextResponse } from "next/server";
import { getOrganicDataset } from "@/lib/organic-intelligence";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const generatedAt = new Date().toISOString();
  const records = getOrganicDataset();
  const terms = records.map((record) => {
    const canonical = `${site}/o-que-significa/${encodeURIComponent(record.term)}`;
    const citation = `${site}/citation/${encodeURIComponent(record.term)}`;
    return {
      "@type": "DefinedTerm",
      "@id": `${canonical}#term`,
      term: record.term,
      definition: record.definition,
      meaning: record.meaning,
      context: record.context,
      example: record.example,
      category: record.category,
      region: record.region,
      variations: record.variations,
      relatedTerms: record.relatedTerms,
      canonical,
      citation,
      graph: `${site}/api/graph/${encodeURIComponent(record.term)}`,
      publisher: "Gíria AI",
      freshness: record.freshness,
      indexability: record.indexability,
      evidence: record.evidence,
    };
  });

  return NextResponse.json({
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "@id": `${site}/knowledge.json#feed`,
    name: "Gíria AI Knowledge Manifest",
    url: `${site}/knowledge.json`,
    generatedAt,
    language: "pt-BR",
    scope: "linguagem informal brasileira e cultura digital",
    publisher: {
      "@type": "Organization",
      "@id": `${site}/#organization`,
      name: "Gíria AI",
      url: site,
    },
    methodology: `${site}/data/methodology.json`,
    citationPolicy: {
      preferredHumanSource: `${site}/o-que-significa/{termo}`,
      preferredMachineRecord: `${site}/citation/{termo}`,
      attribution: "Gíria AI",
      rule: "Não elevar registros sem evidence ou citationReady=false ao mesmo nível de uma definição editorialmente verificada.",
    },
    itemCount: terms.length,
    terms,
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
      "Link": `<${site}/knowledge.json>; rel=\"canonical\"`,
    },
  });
}
