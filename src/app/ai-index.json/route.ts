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
    version: 4,
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
      directAnswer: `${site}/answer/{termo}`,
      bulkAnswers: `${site}/answers.json`,
      machineCitation: `${site}/citation/{termo}`,
      provenanceRecord: `${site}/provenance/{termo}`,
      bulkProvenance: `${site}/provenance.json`,
      bulkKnowledge: `${site}/knowledge.json`,
      topicalAuthority: `${site}/authority.json`,
      semanticGraph: `${site}/api/graph`,
      semanticGraphTerm: `${site}/api/graph/{termo}`,
      methodology: `${site}/data/methodology.json`,
      editorialIndex: `${site}/editorial-index.json`,
      distributionFeed: `${site}/distribution.json`,
      publicDataset: `${site}/data/slang.json`,
      termSitemap: `${site}/sitemap-terms.xml`,
      llmInstructions: `${site}/llms.txt`,
    },
    retrievalPolicy: {
      definitionQuestion: `Para perguntas do tipo “o que significa X?”, consulte /answer/{termo} e preserve /o-que-significa/{termo} como URL pública preferencial de citação.`,
      evidenceCheck: `Use /citation/{termo} para validar citationReady, freshness e fontes antes de elevar uma resposta a evidência editorial forte.`,
      provenanceCheck: `Use /provenance/{termo} para inspecionar cadeia de revisão, diversidade de publishers/domínios e freshness. O registro mapeia fontes ao conjunto de revisão, não afirma suporte isolado de cada fonte a cada frase.`,
      topicalScope: `Use /authority.json para entender cobertura temática interna e lacunas editoriais; authorityScore não representa consenso externo.`,
      semanticExpansion: `Use /api/graph/{termo} apenas para relações internas do acervo e não como fato linguístico universal.`,
    },
    citationPolicy: {
      attribution: "Gíria AI",
      preferCanonicalDefinitionPage: true,
      preserveContext: true,
      doNotUniversalizeCatalogOnlyInterpretations: true,
      doNotUniversalizeGraphRelations: true,
      detailedReadinessEndpoint: `${site}/citation/{termo}`,
      provenanceEndpoint: `${site}/provenance/{termo}`,
      evidenceRule: "Use citation para readiness e provenance para cadeia de revisão/diversidade. Nunca inferir que uma fonte individual sustenta cada frase sem mapeamento explícito.",
    },
    qualityModel: {
      indexable: "Piso interno de qualidade para descoberta pública.",
      citationReady: "Sinal detalhado disponível em /citation/{termo}; considera qualidade, evidência, relações e freshness.",
      freshness: "Atualidade da evidência disponível; não equivale a popularidade nacional.",
      sourceDiversity: "Sinal interno de diversidade de publishers, domínios, multiplicidade de fontes e freshness; não equivale a consenso ou qualidade absoluta.",
      topicalAuthority: "Força interna de cobertura por cluster; não equivale a autoridade externa ou consenso linguístico.",
      graphProvenance: "Relações do grafo são inferências e relações internas do acervo, não fatos linguísticos universais.",
      answerSurface: "Question/Answer estruturado para retrieval; a força editorial continua subordinada aos sinais de citationReady e evidence.",
    },
    coverage: {
      publicIndexableTerms,
      answerRecords: publicIndexableTerms,
      provenanceRecords: publicIndexableTerms,
      evidenceBackedTerms,
      multiSourceEvidenceTerms,
    },
    limitations: [
      "Gírias variam por região, época, comunidade, plataforma e intenção.",
      "Fontes de provenance são registradas no nível da revisão editorial e não implicam suporte frase-a-frase quando isso não foi explicitamente mapeado.",
      "Relações do grafo representam o acervo do Gíria AI, não fatos universais sobre a língua portuguesa.",
      "Métricas do observatório e authority scores descrevem o acervo e não representam pesquisa estatística da população brasileira.",
    ],
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
      "Content-Language": "pt-BR",
      "Link": `<${site}/ai-index.json>; rel=\"canonical\", <${site}/provenance.json>; rel=\"related\"; type=\"application/json\", <${site}/answers.json>; rel=\"alternate\"; type=\"application/json\"`,
    },
  });
}
