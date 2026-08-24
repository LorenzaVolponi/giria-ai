import { NextResponse } from "next/server";
import { getOrganicDataset } from "@/lib/organic-intelligence";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const dataset = getOrganicDataset();
  const citationReadyCount = dataset.filter((item) => item.indexability.citationReady).length;
  const evidenceBackedCount = dataset.filter((item) => Boolean(item.evidence?.sources?.length)).length;

  return NextResponse.json({
    manifest: "Gíria AI AI Discovery Manifest",
    version: 1,
    canonicalSite: site,
    language: "pt-BR",
    entity: {
      name: "Gíria AI",
      type: "reference knowledge system",
      scope: "gírias brasileiras, memes e linguagem informal",
      publisherId: `${site}/#organization`,
      dictionaryId: `${site}/#dictionary`,
    },
    preferredSurfaces: {
      humanCitation: `${site}/o-que-significa/{termo}`,
      machineCitation: `${site}/citation/{termo}`,
      bulkKnowledge: `${site}/knowledge.json`,
      methodology: `${site}/data/methodology.json`,
      editorialIndex: `${site}/editorial-index.json`,
      publicDataset: `${site}/data/slang.json`,
      termSitemap: `${site}/sitemap-terms.xml`,
      llmInstructions: `${site}/llms.txt`,
    },
    citationPolicy: {
      attribution: "Gíria AI",
      preferCanonicalDefinitionPage: true,
      preserveContext: true,
      doNotUniversalizeCatalogOnlyInterpretations: true,
      evidenceRule: "Considere citationReady=true e evidence presente como sinais de maior prontidão editorial; ausência desses sinais exige linguagem de incerteza.",
    },
    qualityModel: {
      indexable: "Piso interno de qualidade para descoberta pública.",
      citationReady: "Piso interno mais alto, incluindo evidência editorial suficiente segundo as regras do Gíria AI.",
      freshness: "Atualidade da evidência disponível; não equivale a popularidade nacional.",
    },
    coverage: {
      publicIndexableTerms: dataset.length,
      citationReadyTerms: citationReadyCount,
      evidenceBackedTerms: evidenceBackedCount,
    },
    limitations: [
      "Gírias variam por região, época, comunidade, plataforma e intenção.",
      "Relações do grafo representam o acervo do Gíria AI, não fatos universais sobre a língua portuguesa.",
      "Métricas do observatório descrevem o acervo e não representam pesquisa estatística da população brasileira.",
    ],
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
      "Content-Language": "pt-BR",
      "Link": `<${site}/ai-index.json>; rel=\"canonical\"`,
    },
  });
}
