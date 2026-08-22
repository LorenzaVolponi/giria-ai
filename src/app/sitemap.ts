import type { MetadataRoute } from "next";
import { SLANG_DATA } from "@/lib/slang-data";
import { ACTIVE_GUIDE_CLUSTERS } from "@/lib/guide-policy";
import { evaluateIndexQuality } from "@/lib/index-quality";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site}/o-que-significa`, changeFrequency: "daily", priority: 0.95 },
    { url: `${site}/observatorio`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${site}/imprensa`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${site}/sobre`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = ACTIVE_GUIDE_CLUSTERS.map((cluster) => ({
    url: `${site}/guias/${cluster.slug}`,
    lastModified: new Date(cluster.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const intentRoutes: MetadataRoute.Sitemap = SLANG_DATA
    .filter((term) => evaluateIndexQuality(term).indexable)
    .map((term) => ({
      url: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

  return [...staticRoutes, ...guideRoutes, ...intentRoutes];
}
