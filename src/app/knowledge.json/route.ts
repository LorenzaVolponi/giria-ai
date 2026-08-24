import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { getFreshnessSignal } from "@/lib/organic-intelligence";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const generatedAt = new Date().toISOString();
  const terms = SLANG_DATA.flatMap((term) => {
    const indexQuality = evaluateIndexQuality(term);
    if (!indexQuality.indexable) return [];

    const evidence = getEditorialEvidence(term.term);
    const freshness = getFreshnessSignal(term.term);
    const canonical = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
    const citation = `${site}/citation/${encodeURIComponent(term.term)}`;
    return [{
      "@type": "DefinedTerm",
      "@id": `${canonical}#term`,
      term: term.term,
      definition: evidence?.definition || term.adultTranslation || term.meaning,
      meaning: term.meaning,
      context: evidence?.context || term.context,
      example: term.safeExample,
      category: term.category,
      region: term.region,
      origin: term.origin,
      variations: term.variations,
      canonical,
      citation,
      graph: `${site}/api/graph/${encodeURIComponent(term.term)}`,
      publisher: "Gíria AI",
      freshness,
      indexQuality,
      evidenceBacked: Boolean(evidence?.sources?.length),
      evidence: evidence ? {
        reviewedAt: evidence.reviewedAt,
        sources: evidence.sources.map(({ publisher, title, url, publishedAt }) => ({ publisher, title, url, publishedAt })),
      } : null,
    }];
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
      rule: "Consulte o registro /citation/{termo} para citation readiness detalhada. Ausência de evidence exige linguagem de incerteza.",
    },
    itemCount: terms.length,
    terms,
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
      "Content-Language": "pt-BR",
      "Link": `<${site}/knowledge.json>; rel=\"canonical\"`,
    },
  });
}
