import { ORGANIC_SEO_KEYWORDS, SEO_KEYWORD_CLUSTERS } from "@/lib/seo-keyword-layer";

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const updatedAt = new Date(
    Math.max(...SEO_KEYWORD_CLUSTERS.map((cluster) => new Date(cluster.updatedAt).getTime())),
  ).toISOString();

  return Response.json(
    {
      name: "Gíria AI SEO index",
      updatedAt,
      canonicalIndex: `${site}/guias`,
      sitemap: `${site}/guias/sitemap.xml`,
      organicKeywords: ORGANIC_SEO_KEYWORDS,
      clusters: SEO_KEYWORD_CLUSTERS.map((cluster) => ({
        slug: cluster.slug,
        url: `${site}/guias/${cluster.slug}`,
        title: cluster.title,
        primaryKeyword: cluster.primaryKeyword,
        keywords: Array.from(new Set([cluster.primaryKeyword, ...cluster.keywords])),
        queryVariants: cluster.queryVariants,
        semanticEntities: cluster.semanticEntities,
        audience: cluster.audience,
        updatedAt: cluster.updatedAt,
      })),
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
