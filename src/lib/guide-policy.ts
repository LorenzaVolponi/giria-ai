import { SEO_KEYWORD_CLUSTERS } from "@/lib/seo-keyword-layer";

export const DEPRECATED_GUIDE_SLUGS = new Set([
  "girias-nave-espacial-et-alienigena",
]);

export const ACTIVE_GUIDE_CLUSTERS = SEO_KEYWORD_CLUSTERS.filter(
  (cluster) => !DEPRECATED_GUIDE_SLUGS.has(cluster.slug),
);
