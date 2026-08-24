import { NextRequest, NextResponse } from "next/server";
import { getPublicTerm, listPublicTerms, searchPublicIntelligence } from "@/lib/public-intelligence-api";

const headers = { "cache-control": "public, max-age=60, s-maxage=300", "x-api-version": "1" };

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const term = searchParams.get("term")?.trim();
  const query = searchParams.get("q")?.trim();
  const limit = Number(searchParams.get("limit") || 10);
  const cursor = Number(searchParams.get("cursor") || 0);

  if (term) {
    const item = getPublicTerm(term);
    return item
      ? NextResponse.json({ data: item }, { headers })
      : NextResponse.json({ error: "Termo não encontrado." }, { status: 404, headers });
  }

  if (query) {
    if (query.length < 3 || query.length > 300) return NextResponse.json({ error: "Consulta deve ter entre 3 e 300 caracteres." }, { status: 400, headers });
    return NextResponse.json({ data: searchPublicIntelligence(query, limit), query }, { headers });
  }

  return NextResponse.json({ data: listPublicTerms(limit, cursor) }, { headers });
}
