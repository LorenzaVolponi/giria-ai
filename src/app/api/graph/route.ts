import { NextResponse } from "next/server";
import { getLanguageGraphIndex } from "@/lib/language-graph";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  return NextResponse.json({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${site}/api/graph#dataset`,
    name: "Gíria AI Language Graph",
    description: "Índice de entidades da linguagem informal brasileira catalogadas pelo Gíria AI.",
    publisher: {
      name: "Gíria AI",
      id: `${site}/#organization`,
    },
    canonicalSite: site,
    termPattern: `${site}/api/graph/{termo}`,
    citationPattern: `${site}/citation/{termo}`,
    definitionPattern: `${site}/o-que-significa/{termo}`,
    provenanceNotice: "As relações do grafo representam relações e inferências internas do acervo Gíria AI, não fatos universais sobre a língua portuguesa.",
    nodes: getLanguageGraphIndex(),
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "index, follow",
      "Content-Language": "pt-BR",
      "Link": `<${site}/api/graph>; rel=\"canonical\", <${site}/ai-index.json>; rel=\"describedby\"`,
    },
  });
}
