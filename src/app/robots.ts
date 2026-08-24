import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/o-que-significa/",
        "/answer/",
        "/answers.json",
        "/citation/",
        "/provenance/",
        "/provenance.json",
        "/knowledge.json",
        "/ai-index.json",
        "/authority.json",
        "/editorial-index.json",
        "/distribution.json",
        "/data/",
        "/llms.txt",
        "/observatorio/dados.json",
        "/api/graph",
        "/api/graph/",
      ],
      disallow: ["/api/", "/admin"],
    },
    sitemap: [`${site}/sitemap.xml`, `${site}/sitemap-terms.xml`, `${site}/guias/sitemap.xml`],
    host: site,
  };
}
