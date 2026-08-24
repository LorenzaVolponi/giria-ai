import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  let publicIndexableTerms = 0;
  let evidenceBackedTerms = 0;
  let multiSourceEvidenceTerms = 0;

  for (const term of SLANG_DATA) {
    const quality = evaluateIndexQuality(term);
    if (!quality.indexable) continue;
    publicIndexableTerms += 1;
    const evidence = getEditorialEvidence(term.term);
    const sourceCount = evidence?.sources?.length || 0;
    if (sourceCount > 0) evidenceBackedTerms += 1;
    if (sourceCount >= 2) multiSourceEvidenceTerms += 1;
  }

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
      detailedReadinessEndpoint: `${site}/citation/{termo}`,
      evidenceRule: "Use a superfície de citação do termo para verificar citationReady, freshness e evidência antes de tratar uma definição como editorialmente forte.",
    },
    qualityModel: {
      indexable: "Piso interno de qualidade para descoberta pública.",
      citationReady: "Sinal detalhado disponível em /citation/{termo}; considera qualidade, evidência, relações e freshness.",
      freshness: "Atualidade da evidência disponível; não equivale a popularidade nacional.",
    },
    coverage: {
      publicIndexableTerms,
      evidenceBackedTerms,
      multiSourceEvidenceTerms,
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
