import { describe, expect, it } from "vitest";
import { SEO_KEYWORD_CLUSTERS } from "../src/lib/seo-keyword-layer";
import sitemap from "../src/app/sitemap";
import { GET as seoIndexGet } from "../src/app/seo-index.json/route";
import { GET as guideSitemapGet } from "../src/app/guias/sitemap.xml/route";
import { GET as guideFeedGet } from "../src/app/guias/feed.xml/route";
import { GET as openSearchGet } from "../src/app/opensearch.xml/route";

describe("SEO guide index", () => {
  it("keeps guide clusters complete and people-first", () => {
    expect(SEO_KEYWORD_CLUSTERS.length).toBeGreaterThanOrEqual(3);

    for (const cluster of SEO_KEYWORD_CLUSTERS) {
      expect(cluster.slug).toMatch(/^[a-z0-9-]+$/);
      expect(cluster.title.length).toBeGreaterThan(20);
      expect(cluster.description.length).toBeGreaterThan(70);
      expect(cluster.primaryKeyword.length).toBeGreaterThan(2);
      expect(cluster.quickAnswer.length).toBeGreaterThan(90);
      expect(cluster.queryVariants.length).toBeGreaterThanOrEqual(5);
      expect(cluster.glossary.length).toBeGreaterThanOrEqual(4);
      expect(cluster.examples.length).toBeGreaterThanOrEqual(3);
      expect(cluster.semanticEntities.length).toBeGreaterThanOrEqual(5);
      expect(cluster.contentSignals.length).toBeGreaterThanOrEqual(4);
      expect(new Set([cluster.primaryKeyword, ...cluster.keywords]).size).toBeGreaterThanOrEqual(cluster.keywords.length);
    }
  });

  it("exposes all guides in the main sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const cluster of SEO_KEYWORD_CLUSTERS) {
      expect(urls).toContain(`https://giria-ai.vercel.app/guias/${cluster.slug}`);
    }
  });

  it("publishes a dedicated guide sitemap", async () => {
    const res = await guideSitemapGet();
    const xml = await res.text();
    expect(res.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain("<urlset");
    for (const cluster of SEO_KEYWORD_CLUSTERS) {
      expect(xml).toContain(`/guias/${cluster.slug}`);
    }
  });

  it("publishes a machine-readable SEO index", async () => {
    const res = await seoIndexGet();
    const json = await res.json();
    expect(json.canonicalIndex).toBe("https://giria-ai.vercel.app/guias");
    expect(json.sitemap).toBe("https://giria-ai.vercel.app/guias/sitemap.xml");
    expect(json.clusters).toHaveLength(SEO_KEYWORD_CLUSTERS.length);
    expect(json.clusters[0]).toHaveProperty("semanticEntities");
  });

  it("publishes an RSS feed for guide updates", async () => {
    const res = await guideFeedGet();
    const xml = await res.text();
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    expect(xml).toContain("<rss");
    for (const cluster of SEO_KEYWORD_CLUSTERS) {
      expect(xml).toContain(`/guias/${cluster.slug}`);
      expect(xml).toContain(cluster.primaryKeyword);
    }
  });

  it("publishes OpenSearch discovery for site search", async () => {
    const res = await openSearchGet();
    const xml = await res.text();
    expect(res.headers.get("content-type")).toContain("application/opensearchdescription+xml");
    expect(xml).toContain("<OpenSearchDescription");
    expect(xml).toContain("/o-que-significa/{searchTerms}");
    expect(xml).toContain("/seo-index.json?q={searchTerms}");
  });
});
