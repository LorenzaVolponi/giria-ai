import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { buildSourceAuthority } from "@/lib/source-authority";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const records = SLANG_DATA.filter((entry) => evaluateIndexQuality(entry).indexable).map((entry) => ({ term: entry.term, ...buildSourceAuthority(entry.term), url: `${site}/source-authority/${encodeURIComponent(entry.term.toLowerCase().trim().replace(/\s+/g, "-"))}` }));
  const supported = records.filter((r) => r.sourceCount > 0);
  return NextResponse.json({ schema: "giria-ai/source-authority-manifest/v1", generatedAt: new Date().toISOString(), publisher: { name: "Gíria AI", id: `${site}/#organization` }, coverage: { indexableTerms: records.length, evidenceSupportedTerms: supported.length, diverseSupportTerms: records.filter((r) => r.interpretation === "diverse_editorial_support").length }, records, policy: "Métrica interna e transparente baseada apenas nas fontes editoriais registradas no acervo. Não equivale a autoridade externa, PageRank ou garantia de citação." }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400", "X-Robots-Tag": "index, follow", "Content-Language": "pt-BR", "Link": `<${site}/source-authority.json>; rel=\"canonical\"` } });
}
