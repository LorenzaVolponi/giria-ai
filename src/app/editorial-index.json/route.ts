import { SEO_KEYWORD_CLUSTERS } from "@/lib/seo-keyword-layer";
import { getEditorialEvidenceTerms } from "@/lib/editorial-evidence";

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const updatedAt = new Date(
    Math.max(...SEO_KEYWORD_CLUSTERS.map((cluster) => new Date(cluster.updatedAt).getTime())),
  ).toISOString();

  return Response.json(
    {
      name: "Gíria AI — índice editorial",
      description:
        "Diretório estruturado dos principais guias, superfícies editoriais e verbetes com revisão documentada do Gíria AI.",
      updatedAt,
      canonicalIndex: `${site}/guias`,
      dictionary: `${site}/girias`,
      meanings: `${site}/o-que-significa`,
      observatory: `${site}/observatorio`,
      methodology: `${site}/sobre`,
      press: `${site}/imprensa`,
      sitemap: `${site}/sitemap.xml`,
      reviewedTerms: getEditorialEvidenceTerms().map((term) => ({
        term,
        url: `${site}/o-que-significa/${encodeURIComponent(term)}`,
      })),
      guides: SEO_KEYWORD_CLUSTERS.map((cluster) => ({
        slug: cluster.slug,
        url: `${site}/guias/${cluster.slug}`,
        title: cluster.title,
        description: cluster.description,
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
