import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const items = SLANG_DATA
    .filter((term) => evaluateIndexQuality(term).indexable)
    .slice(0, 500)
    .map((term) => ({
      headline: `O que significa “${term.term}”?`,
      summary: term.meaning,
      context: term.context,
      canonical: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
      attribution: "Gíria AI",
      reuse: "Resumo factual do acervo; preserve link canônico e atribuição.",
    }));

  return NextResponse.json({
    publisher: "Gíria AI",
    purpose: "Feed para imprensa, newsletters, creators, pesquisa e superfícies externas de descoberta.",
    canonicalSite: site,
    knowledgeManifest: `${site}/knowledge.json`,
    items,
  }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
