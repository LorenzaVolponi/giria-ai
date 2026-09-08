import { NextRequest, NextResponse } from "next/server";
import { resolveIndexedTerm } from "@/lib/slang-index";
import { buildOrganicTermRecord } from "@/lib/organic-intelligence";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest, { params }: { params: Promise<{ term: string }> }) {
  recordCrawlerHit(request.headers.get("user-agent"), "/api/citation/[term]");
  const { term } = await params;
  const match = resolveIndexedTerm(term);
  if (!match) return NextResponse.json({ error: "Termo não encontrado." }, { status: 404 });

  const record = buildOrganicTermRecord(match);
  if (!record.indexability.indexable) {
    return NextResponse.json({ error: "Termo ainda não atingiu qualidade suficiente para citação pública." }, { status: 404 });
  }

  return NextResponse.json(record, {
    headers: {
      "cache-control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
      "x-giria-citation-ready": String(record.indexability.citationReady),
    },
  });
}
