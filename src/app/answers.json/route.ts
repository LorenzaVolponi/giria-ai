import { NextResponse } from "next/server";
import { SLANG_DATA } from "@/lib/slang-data";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { buildGeoAnswerSurface } from "@/lib/geo-answer-surface";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const answers = SLANG_DATA
    .filter((term) => evaluateIndexQuality(term).indexable)
    .map((term) => buildGeoAnswerSurface(term, site, false));

  return NextResponse.json(
    {
      "@context": "https://schema.org",
      "@type": "DataFeed",
      "@id": `${site}/answers.json#feed`,
      name: "Gíria AI — Answer Feed",
      description: "Perguntas e respostas canônicas sobre gírias brasileiras, memes e linguagem informal, com sinais de evidência, freshness e política de citação.",
      inLanguage: "pt-BR",
      publisher: { "@id": `${site}/#organization` },
      canonicalSite: site,
      answerEndpointTemplate: `${site}/answer/{termo}`,
      citationEndpointTemplate: `${site}/citation/{termo}`,
      readinessPolicy: "O feed em lote não calcula citation readiness detalhada; consulte citationEndpointTemplate por termo antes de elevar uma resposta a evidência editorial forte.",
      itemCount: answers.length,
      dataFeedElement: answers,
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "content-language": "pt-BR",
        "x-robots-tag": "index, follow",
        link: `<${site}/answers.json>; rel="canonical", <${site}/ai-index.json>; rel="describedby"`,
      },
    },
  );
}
