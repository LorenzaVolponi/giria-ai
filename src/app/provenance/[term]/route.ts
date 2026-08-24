import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { normalizeOrganicQuery } from "@/lib/organic-intelligence";
import { buildProvenanceRecord } from "@/lib/provenance";

export async function GET(_: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const normalized = normalizeOrganicQuery(decodeURIComponent(term));
  const match = SLANG_DATA.find((item) => normalizeOrganicQuery(item.term) === normalized || item.variations.some((variation) => normalizeOrganicQuery(variation) === normalized));
  if (!match) return NextResponse.json({ error: "Termo não encontrado." }, { status: 404 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const record = buildProvenanceRecord(match, site);
  return NextResponse.json(record, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "content-language": "pt-BR",
      "x-robots-tag": "index, follow",
      link: `<${record.canonical}>; rel=\"canonical\", <${record.citation}>; rel=\"related\"`,
    },
  });
}
