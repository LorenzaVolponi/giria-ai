import { SLANG_DATA } from "@/lib/slang-data";

function rank(values: string[], limit = 12) {
  const counts = new Map<string, number>();
  for (const rawValue of values) {
    const value = rawValue?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const totalTerms = SLANG_DATA.length;
  const totalVariations = SLANG_DATA.reduce((sum, term) => sum + (term.variations?.length || 0), 0);
  const categories = new Set(SLANG_DATA.map((term) => term.category).filter(Boolean)).size;
  const regions = new Set(SLANG_DATA.map((term) => term.region).filter(Boolean)).size;
  const trending = SLANG_DATA.filter((term) => term.popularityStatus === "trending").length;
  const regional = SLANG_DATA.filter((term) => term.popularityStatus === "regional").length;

  return Response.json(
    {
      name: "Observatório Gíria AI — retrato do acervo",
      canonical: `${site}/observatorio`,
      scope:
        "Indicadores agregados do acervo do Gíria AI. Não representam pesquisa estatística da população brasileira nem ranking nacional de uso.",
      citation: "Fonte sugerida: dados do acervo do Gíria AI.",
      metrics: {
        terms: totalTerms,
        variations: totalVariations,
        categories,
        regionalLabels: regions,
        trendingLabels: trending,
        regionalPopularityLabels: regional,
      },
      topCategories: rank(SLANG_DATA.map((term) => term.category)),
      topRegions: rank(SLANG_DATA.map((term) => term.region)),
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400",
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
