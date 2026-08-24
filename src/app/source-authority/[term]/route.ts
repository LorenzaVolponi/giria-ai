import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { normalizeOrganicQuery } from "@/lib/organic-intelligence";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { buildSourceAuthority } from "@/lib/source-authority";

export async function GET(_: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const normalized = normalizeOrganicQuery(decodeURIComponent(term));
  const entry = SLANG_DATA.find((item) => normalizeOrganicQuery(item.term) === normalized || item.variations.some((v) => normalizeOrganicQuery(v) === normalized));
  if (!entry || !evaluateIndexQuality(entry).indexable) return NextResponse.json({ error: "Termo não encontrado ou não indexável." }, { status: 404 });
  const slug = encodeURIComponent(entry.term.toLowerCase().trim().replace(/\s+/g, "-"));
  return NextResponse.json({ schema: "giria-ai/source-authority/v1", term: entry.term, canonical: `${site}/o-que-significa/${slug}`, sourceAuthority: buildSourceAuthority(entry.term), evidence: `${site}/citation/${slug}`, provenance: `${site}/provenance/${slug}`, integrity: `${site}/integrity/${slug}` }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400", "X-Robots-Tag": "index, follow", "Content-Language": "pt-BR", "Link": `<${site}/o-que-significa/${slug}>; rel=\"canonical\"` } });
}
