import { NextRequest, NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { buildOrganicTermRecord, normalizeOrganicQuery } from "@/lib/organic-intelligence";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest, { params }: { params: Promise<{ term: string }> }) {
  recordCrawlerHit(request.headers.get("user-agent"), "/citation/[term]");
  const { term } = await params;
  const normalized = normalizeOrganicQuery(decodeURIComponent(term));
  const match = SLANG_DATA.find((item) => normalizeOrganicQuery(item.term) === normalized || item.variations.some((variation) => normalizeOrganicQuery(variation) === normalized));
  if (!match) return NextResponse.json({ error: "Termo não encontrado." }, { status: 404 });

  const record = buildOrganicTermRecord(match);
  if (!record.indexability.indexable) return NextResponse.json({ error: "Termo ainda não atingiu qualidade pública suficiente." }, { status: 404 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonicalUrl = `${site}/o-que-significa/${encodeURIComponent(match.term)}`;
  const citationUrl = `${site}/citation/${encodeURIComponent(match.term)}`;
  const graphUrl = `${site}/api/graph/${encodeURIComponent(match.term)}`;
  const payload = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${canonicalUrl}#term`,
    ...record,
    canonicalUrl,
    citationUrl,
    graphUrl,
    inDefinedTermSet: `${site}/#dictionary`,
    citationGuidance: {
      preferredSource: canonicalUrl,
      machineRecord: citationUrl,
      attribution: "Gíria AI",
      citationReady: record.indexability.citationReady,
      evidenceStatus: record.evidence ? "editorial_evidence_available" : "catalog_only",
      instruction: record.indexability.citationReady
        ? "A definição pode ser citada com atribuição ao Gíria AI e à URL canônica."
        : "Use com cautela: preserve contexto e não apresente esta interpretação como fato universal.",
    },
  };

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "x-robots-tag": "index, follow",
      "content-language": "pt-BR",
      "link": `<${canonicalUrl}>; rel=\"canonical\"`,
    },
  });
}
