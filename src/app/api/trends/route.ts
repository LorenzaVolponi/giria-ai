import { NextResponse } from "next/server";
import { getVerifiedTrendSignals } from "@/lib/temporal-signals";

export async function GET() {
  return NextResponse.json({
    methodology: "Somente termos marcados como trending no catálogo e sustentados por múltiplas fontes editoriais externas entram como verified_trending.",
    disclaimer: "Os sinais descrevem o acervo e evidências editoriais do Gíria AI; não equivalem a pesquisa estatística da população brasileira ou da internet.",
    trends: getVerifiedTrendSignals(20),
  }, {
    headers: { "Cache-Control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
