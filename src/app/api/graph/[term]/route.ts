import { NextResponse } from "next/server";
import { getLanguageGraphNode } from "@/lib/language-graph";

export const dynamic = "force-static";

export async function GET(_request: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const node = getLanguageGraphNode(decodeURIComponent(term));
  if (!node) return NextResponse.json({ error: "Termo não encontrado no grafo." }, { status: 404 });
  return NextResponse.json(node, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
