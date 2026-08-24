import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { getFreshnessSignal } from "@/lib/organic-intelligence";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const items = SLANG_DATA
    .filter((term) => evaluateIndexQuality(term).indexable)
    .slice(0, 500)
    .map((term) => {
      const evidence = getEditorialEvidence(term.term);
      const freshness = getFreshnessSignal(term.term);
      const canonical = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
      const citation = `${site}/citation/${encodeURIComponent(term.term)}`;
      const evidenceBacked = Boolean(evidence?.sources?.length);
      return {
        headline: `O que significa “${term.term}”?`,
        summary: evidence?.definition || term.adultTranslation || term.meaning,
        context: evidence?.context || term.context,
        canonical,
        citation,
        attribution: "Gíria AI",
        evidenceBacked,
        reviewedAt: evidence?.reviewedAt || null,
        freshness,
        reuse: evidenceBacked
          ? "Preserve atribuição ao Gíria AI, link canônico e contexto da definição revisada."
          : "Interpretação de catálogo: preserve atribuição, link canônico e linguagem de incerteza; não trate como fato universal.",
      };
    });

  return NextResponse.json({
    publisher: "Gíria AI",
    publisherId: `${site}/#organization`,
    purpose: "Feed para imprensa, newsletters, creators, pesquisa e superfícies externas de descoberta.",
    canonicalSite: site,
    aiDiscovery: `${site}/ai-index.json`,
    knowledgeManifest: `${site}/knowledge.json`,
    methodology: `${site}/data/methodology.json`,
    citationPattern: `${site}/citation/{termo}`,
    items,
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
      "Content-Language": "pt-BR",
      "Link": `<${site}/distribution.json>; rel=\"canonical\"`,
    },
  });
}
