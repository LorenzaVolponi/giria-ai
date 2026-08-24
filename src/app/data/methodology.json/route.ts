import { NextRequest, NextResponse } from "next/server";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest) {
  recordCrawlerHit(request.headers.get("user-agent"), "/data/methodology.json");
  return NextResponse.json({
    publisher: "Gíria AI",
    owner: "AIX8C / volponi.tech",
    purpose: "Interpretar gírias, memes e expressões pelo significado e pelo contexto de uso.",
    principles: [
      "Contexto vale mais do que a palavra isolada.",
      "Ambiguidade reduz confiança; não é convertida em certeza artificial.",
      "Tendência só é publicada quando há evidência editorial suficiente e recente.",
      "Conteúdo fraco não entra automaticamente em superfícies de indexação orgânica.",
      "Fontes e datas de revisão acompanham registros que possuem validação editorial.",
      "Feedback e consultas desconhecidas alimentam revisão editorial sem adicionar identificadores pessoais ao dataset orgânico.",
    ],
    machineReadableSurfaces: ["/data/slang.json", "/data/trending.json", "/sitemap-terms.xml", "/citation/{term}"],
    generatedAt: new Date().toISOString(),
  }, { headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } });
}
