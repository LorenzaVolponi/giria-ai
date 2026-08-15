import type { MetadataRoute } from "next";
import { SLANG_DATA } from "@/lib/slang-data";
import { SEO_KEYWORD_CLUSTERS } from "@/lib/seo-keyword-layer";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/girias`, changeFrequency: "daily", priority: 0.95 },
    { url: `${site}/girias/regionais`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/girias/enviadas-por-usuarios`, changeFrequency: "daily", priority: 0.85 },
    { url: `${site}/guias`, changeFrequency: "weekly", priority: 0.88 },
    { url: `${site}/o-que-significa`, changeFrequency: "daily", priority: 0.95 },
    { url: `${site}/sobre`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const seoGuideRoutes: MetadataRoute.Sitemap = SEO_KEYWORD_CLUSTERS.map((cluster) => ({
    url: `${site}/guias/${cluster.slug}`,
    lastModified: new Date(cluster.updatedAt),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const intentRoutes: MetadataRoute.Sitemap = SLANG_DATA.map((term) => ({
    url: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...seoGuideRoutes, ...intentRoutes];
}
