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

  return NextResponse.json(record, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "x-robots-tag": "index, follow",
      "link": `<${record.canonicalUrl}>; rel=\"canonical\"`,
    },
  });
}
