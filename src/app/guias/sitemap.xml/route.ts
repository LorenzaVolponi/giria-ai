import { SEO_KEYWORD_CLUSTERS } from "@/lib/seo-keyword-layer";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const urls = [
    {
      loc: `${site}/guias`,
      lastmod: new Date(Math.max(...SEO_KEYWORD_CLUSTERS.map((cluster) => new Date(cluster.updatedAt).getTime()))).toISOString(),
      changefreq: "weekly",
      priority: "0.88",
    },
    ...SEO_KEYWORD_CLUSTERS.map((cluster) => ({
      loc: `${site}/guias/${cluster.slug}`,
      lastmod: new Date(cluster.updatedAt).toISOString(),
      changefreq: "weekly",
      priority: "0.90",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) => `  <url>\n    <loc>${xmlEscape(url.loc)}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
