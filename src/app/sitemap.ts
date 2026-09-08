import type { MetadataRoute } from "next";
import { ACTIVE_GUIDE_CLUSTERS } from "@/lib/guide-policy";

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

  // Term URLs live in /sitemap-terms.xml. Keeping them out of the root sitemap
  // avoids rebuilding the full slang corpus twice while preserving discovery.
  return [...staticRoutes, ...guideRoutes];
}
