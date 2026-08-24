import { NextRequest, NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { normalizeOrganicQuery, getIndexabilitySignal } from "@/lib/organic-intelligence";
import { buildGeoAnswerSurface } from "@/lib/geo-answer-surface";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest, { params }: { params: Promise<{ term: string }> }) {
  recordCrawlerHit(request.headers.get("user-agent"), "/answer/[term]");
  const { term } = await params;
  const normalized = normalizeOrganicQuery(decodeURIComponent(term));
  const match = SLANG_DATA.find(
    (item) =>
      normalizeOrganicQuery(item.term) === normalized ||
      item.variations.some((variation) => normalizeOrganicQuery(variation) === normalized),
  );

  if (!match || !getIndexabilitySignal(match).indexable) {
    return NextResponse.json({ error: "Termo não encontrado ou ainda não indexável." }, { status: 404 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonicalUrl = `${site}/o-que-significa/${encodeURIComponent(match.term)}`;
  const payload = buildGeoAnswerSurface(match, site);

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "content-language": "pt-BR",
      "x-robots-tag": "index, follow",
      link: `<${canonicalUrl}>; rel="canonical", <${site}/ai-index.json>; rel="describedby"`,
    },
  });
}
