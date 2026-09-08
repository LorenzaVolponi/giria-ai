import { NextResponse } from "next/server";
import { resolveIndexedTerm } from "@/lib/slang-index";
import { buildProvenanceRecord } from "@/lib/provenance";

export async function GET(_: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const match = resolveIndexedTerm(term);
  if (!match) return NextResponse.json({ error: "Termo não encontrado." }, { status: 404 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.volponi.tech";
  const record = buildProvenanceRecord(match, site);
  return NextResponse.json(record, {
    headers: {
      "cache-control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
      "content-language": "pt-BR",
      "x-robots-tag": "index, follow",
      link: `<${record.canonical}>; rel=\"canonical\", <${record.citation}>; rel=\"related\"`,
    },
  });
}
