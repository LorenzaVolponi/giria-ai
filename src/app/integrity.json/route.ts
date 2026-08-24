import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getRevisionIntegrity } from "@/lib/revision-integrity";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const records = SLANG_DATA.filter((entry) => evaluateIndexQuality(entry).indexable).map((entry) => ({ term: entry.term, ...getRevisionIntegrity(entry, site), integrityUrl: `${site}/integrity/${encodeURIComponent(entry.term.toLowerCase().trim().replace(/\s+/g, "-"))}` }));
  return NextResponse.json({ schema: "giria-ai/revision-integrity-manifest/v1", generatedAt: new Date().toISOString(), publisher: { name: "Gíria AI", id: `${site}/#organization` }, records, limitations: ["Hashes detectam mudança de conteúdo; não demonstram correção factual.", "observedRevisionAt depende de data editorial disponível no acervo."] }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400", "X-Robots-Tag": "index, follow", "Content-Language": "pt-BR", "Link": `<${site}/integrity.json>; rel=\"canonical\"` } });
}
