import type { MetadataRoute } from "next";
import { SLANG_DATA } from "@/lib/slang-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/girias`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${site}/girias/enviadas-por-usuarios`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${site}/o-que-significa`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const slangRoutes: MetadataRoute.Sitemap = SLANG_DATA.slice(0, 2000).map((term) => ({
    url: `${site}/girias/${encodeURIComponent(term.term)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const intentRoutes: MetadataRoute.Sitemap = SLANG_DATA.slice(0, 2000).map((term) => ({
    url: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...slangRoutes, ...intentRoutes];
}
