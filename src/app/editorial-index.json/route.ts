import { ACTIVE_GUIDE_CLUSTERS } from "@/lib/guide-policy";
import { getEditorialEvidence, getEditorialEvidenceTerms } from "@/lib/editorial-evidence";

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const updatedAt = new Date(
    Math.max(...ACTIVE_GUIDE_CLUSTERS.map((cluster) => new Date(cluster.updatedAt).getTime())),
  ).toISOString();

  return Response.json(
    {
      name: "Gíria AI — índice editorial",
      description:
        "Diretório estruturado dos principais guias, superfícies editoriais e verbetes com revisão documentada do Gíria AI.",
      publisher: {
        name: "Gíria AI",
        id: `${site}/#organization`,
        canonicalSite: site,
      },
      updatedAt,
      canonicalIndex: `${site}/guias`,
      dictionary: `${site}/girias`,
      meanings: `${site}/o-que-significa`,
      observatory: `${site}/observatorio`,
      methodology: `${site}/data/methodology.json`,
      press: `${site}/imprensa`,
      sitemap: `${site}/sitemap.xml`,
      aiDiscovery: `${site}/ai-index.json`,
      knowledgeManifest: `${site}/knowledge.json`,
      citationPattern: `${site}/citation/{termo}`,
      reviewedTerms: getEditorialEvidenceTerms().map((term) => {
        const evidence = getEditorialEvidence(term);
        return {
          term,
          url: `${site}/o-que-significa/${encodeURIComponent(term)}`,
          citation: `${site}/citation/${encodeURIComponent(term)}`,
          reviewedAt: evidence?.reviewedAt || null,
          evidenceCount: evidence?.sources?.length || 0,
          sources: evidence?.sources?.map(({ publisher, title, url, publishedAt }) => ({ publisher, title, url, publishedAt })) || [],
        };
      }),
      guides: ACTIVE_GUIDE_CLUSTERS.map((cluster) => ({
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
        "x-robots-tag": "index, follow",
        "content-language": "pt-BR",
        "link": `<${site}/editorial-index.json>; rel=\"canonical\"`,
      },
    },
  );
}
