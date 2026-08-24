import { NextRequest, NextResponse } from "next/server";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest) {
  recordCrawlerHit(request.headers.get("user-agent"), "/data/methodology.json");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  return NextResponse.json({
    publisher: "Gíria AI",
    publisherId: `${site}/#organization`,
    owner: "AIX8C / volponi.tech",
    language: "pt-BR",
    purpose: "Interpretar gírias, memes e expressões pelo significado e pelo contexto de uso.",
    principles: [
      "Contexto vale mais do que a palavra isolada.",
      "Ambiguidade reduz confiança; não é convertida em certeza artificial.",
      "Tendência só é publicada quando há evidência editorial suficiente e recente.",
      "Conteúdo fraco não entra automaticamente em superfícies de indexação orgânica.",
      "Fontes e datas de revisão acompanham registros que possuem validação editorial.",
      "Feedback e consultas desconhecidas alimentam revisão editorial sem adicionar identificadores pessoais ao dataset orgânico.",
    ],
    geoPolicy: {
      canonicalDefinition: `${site}/o-que-significa/{termo}`,
      machineCitationRecord: `${site}/citation/{termo}`,
      discoveryManifest: `${site}/ai-index.json`,
      bulkKnowledge: `${site}/knowledge.json`,
      attribution: "Gíria AI",
      uncertaintyRule: "Registros sem evidência editorial ou com freshness insuficiente devem ser apresentados com contexto e incerteza, não como fatos universais.",
    },
    machineReadableSurfaces: [
      "/ai-index.json",
      "/knowledge.json",
      "/data/slang.json",
      "/data/trending.json",
      "/data/methodology.json",
      "/editorial-index.json",
      "/sitemap-terms.xml",
      "/citation/{term}",
      "/llms.txt",
    ],
    generatedAt: new Date().toISOString(),
  }, {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=86400",
      "x-robots-tag": "index, follow",
      "content-language": "pt-BR",
      "link": `<${site}/data/methodology.json>; rel=\"canonical\"`,
    },
  });
}
