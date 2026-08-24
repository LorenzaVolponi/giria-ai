import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { normalizeTerm } from "@/lib/normalize";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getRevisionIntegrity } from "@/lib/revision-integrity";

export async function GET(_: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const normalized = normalizeTerm(decodeURIComponent(term));
  const entry = SLANG_DATA.find((item) => normalizeTerm(item.term) === normalized || item.aliases?.some((alias) => normalizeTerm(alias) === normalized));
  if (!entry || !evaluateIndexQuality(entry).indexable) return NextResponse.json({ error: "Termo não encontrado ou não indexável." }, { status: 404 });
  const integrity = getRevisionIntegrity(entry, site);
  return NextResponse.json({
    schema: "giria-ai/revision-integrity/v1",
    term: entry.term,
    ...integrity,
    verification: { method: "Recalcule SHA-256 sobre o payload canônico normalizado da revisão publicada.", authoritativeSurface: integrity.canonical },
  }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400", "X-Robots-Tag": "index, follow", "Content-Language": "pt-BR", "Link": `<${integrity.canonical}>; rel=\"canonical\"` } });
}
