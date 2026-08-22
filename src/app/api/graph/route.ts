import { NextResponse } from "next/server";
import { getLanguageGraphIndex } from "@/lib/language-graph";

export async function GET() {
  return NextResponse.json({
    name: "Gíria AI Language Graph",
    description: "Índice de entidades da linguagem informal brasileira catalogadas pelo Gíria AI.",
    nodes: getLanguageGraphIndex(),
  }, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
