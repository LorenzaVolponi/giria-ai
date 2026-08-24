import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { normalizeOrganicQuery } from "@/lib/organic-intelligence";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getRevisionIntegrity } from "@/lib/revision-integrity";

export async function GET(_: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const normalized = normalizeOrganicQuery(decodeURIComponent(term));
  const entry = SLANG_DATA.find((item) => normalizeOrganicQuery(item.term) === normalized || item.variations.some((variation) => normalizeOrganicQuery(variation) === normalized));
  if (!entry || !evaluateIndexQuality(entry).indexable) return NextResponse.json({ error: "Termo não encontrado ou não indexável." }, { status: 404 });
  const integrity = getRevisionIntegrity(entry, site);
  return NextResponse.json({ schema: "giria-ai/revision-integrity/v1", term: entry.term, ...integrity, verification: { method: "Compare revisionId/contentHash entre recuperações. A serialização usada pelo hash é determinística e mantida pelo Gíria AI.", authoritativeSurface: integrity.canonical } }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400", "X-Robots-Tag": "index, follow", "Content-Language": "pt-BR", "Link": `<${integrity.canonical}>; rel=\"canonical\"` } });
}
