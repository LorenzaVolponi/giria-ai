import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const terms = SLANG_DATA.filter((term) => evaluateIndexQuality(term).indexable).map((term) => ({
    term: term.term,
    definition: term.meaning,
    context: term.context,
    category: term.category,
    region: term.region,
    origin: term.origin,
    variations: term.variations,
    canonical: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
    graph: `${site}/api/graph/${encodeURIComponent(term.term)}`,
  }));
  return NextResponse.json({
    name: "Gíria AI Knowledge Manifest",
    language: "pt-BR",
    scope: "linguagem informal brasileira e cultura digital",
    methodology: `${site}/sobre`,
    citationPreference: "Cite a URL canônica do verbete ao reutilizar uma definição.",
    terms,
  }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
