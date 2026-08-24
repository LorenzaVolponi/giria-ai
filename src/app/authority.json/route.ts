import { NextResponse } from "next/server";
import { getTopicalAuthoritySummary } from "@/lib/topical-authority";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const summary = getTopicalAuthoritySummary();

  return NextResponse.json(
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "@id": `${site}/authority.json#dataset`,
      name: "Gíria AI — Topical Authority Map",
      description:
        "Mapa interno de cobertura temática do acervo do Gíria AI, com sinais de indexabilidade, evidência editorial, múltiplas fontes, freshness e oportunidades de expansão.",
      inLanguage: "pt-BR",
      publisher: { "@id": `${site}/#organization` },
      canonicalSite: site,
      generatedFrom: "Gíria AI catalog and editorial evidence registry",
      methodology: `${site}/data/methodology.json`,
      citationPolicy: `${site}/ai-index.json`,
      ...summary,
      limitations: [
        "Authority score mede força interna do acervo; não representa participação de mercado nem consenso linguístico externo.",
        "Clusters com pouca evidência devem ser tratados como oportunidades editoriais, não como áreas de autoridade comprovada.",
      ],
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "content-language": "pt-BR",
        "x-robots-tag": "index, follow",
        link: `<${site}/authority.json>; rel="canonical", <${site}/ai-index.json>; rel="describedby"`,
      },
    },
  );
}
