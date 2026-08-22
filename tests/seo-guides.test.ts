import { describe, expect, it } from "vitest";
import { SEO_KEYWORD_CLUSTERS } from "../src/lib/seo-keyword-layer";
import { ACTIVE_GUIDE_CLUSTERS, DEPRECATED_GUIDE_SLUGS } from "../src/lib/guide-policy";
import { SLANG_DATA } from "../src/lib/slang-data";
import { evaluateIndexQuality } from "../src/lib/index-quality";
import sitemap from "../src/app/sitemap";
import { GET as editorialIndexGet } from "../src/app/editorial-index.json/route";
import { GET as seoIndexGet } from "../src/app/seo-index.json/route";
import { GET as guideSitemapGet } from "../src/app/guias/sitemap.xml/route";
import { GET as guideFeedGet } from "../src/app/guias/feed.xml/route";
import { GET as openSearchGet } from "../src/app/opensearch.xml/route";
import { metadata as homeMetadata } from "../src/app/page";

describe("editorial guide index", () => {
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

  it("keeps homepage metadata focused on the primary positioning", () => {
    expect(homeMetadata.title).toContain("gírias brasileiras");
    expect(homeMetadata.description).toContain("gírias brasileiras");
    expect(homeMetadata.keywords).toBeUndefined();
    expect(homeMetadata.alternates).toMatchObject({ canonical: "/" });
  });

  it("exposes only active guides in the main sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const cluster of ACTIVE_GUIDE_CLUSTERS) expect(urls).toContain(`https://giria-ai.vercel.app/guias/${cluster.slug}`);
    for (const slug of DEPRECATED_GUIDE_SLUGS) expect(urls).not.toContain(`https://giria-ai.vercel.app/guias/${slug}`);
  });

  it("publishes canonical intent URLs only for terms that pass the quality gate", () => {
    const urls = sitemap().map((entry) => entry.url);
    const indexableTerms = SLANG_DATA.filter((term) => evaluateIndexQuality(term).indexable);
    const nonIndexableTerms = SLANG_DATA.filter((term) => !evaluateIndexQuality(term).indexable);
    const intentUrls = urls.filter((url) => url.includes("/o-que-significa/"));
    expect(intentUrls).toHaveLength(indexableTerms.length);
    for (const term of indexableTerms) expect(urls).toContain(`https://giria-ai.vercel.app/o-que-significa/${encodeURIComponent(term.term)}`);
    for (const term of nonIndexableTerms) expect(urls).not.toContain(`https://giria-ai.vercel.app/o-que-significa/${encodeURIComponent(term.term)}`);
    for (const term of SLANG_DATA) expect(urls).not.toContain(`https://giria-ai.vercel.app/girias/${encodeURIComponent(term.term)}`);
  });

  it("publishes a dedicated guide sitemap with active guides only", async () => {
    const res = await guideSitemapGet();
    const xml = await res.text();
    expect(res.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain("<urlset");
    for (const cluster of ACTIVE_GUIDE_CLUSTERS) expect(xml).toContain(`/guias/${cluster.slug}`);
    for (const slug of DEPRECATED_GUIDE_SLUGS) expect(xml).not.toContain(`/guias/${slug}`);
  });

  it("publishes a machine-readable editorial index and redirects the legacy SEO index", async () => {
    const editorialRes = editorialIndexGet();
    const json = await editorialRes.json();
    expect(json.canonicalIndex).toBe("https://giria-ai.vercel.app/guias");
    expect(json.sitemap).toBe("https://giria-ai.vercel.app/sitemap.xml");
    expect(json.guides).toHaveLength(ACTIVE_GUIDE_CLUSTERS.length);
    expect(json.reviewedTerms.length).toBeGreaterThanOrEqual(2);
    expect(json).not.toHaveProperty("organicKeywords");
    const legacyRes = seoIndexGet(new Request("https://giria-ai.vercel.app/seo-index.json"));
    expect(legacyRes.status).toBe(308);
    expect(legacyRes.headers.get("location")).toBe("https://giria-ai.vercel.app/editorial-index.json");
  });

  it("publishes an RSS feed for active guide updates", async () => {
    const res = await guideFeedGet();
    const xml = await res.text();
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    expect(xml).toContain("<rss");
    expect(xml).not.toContain("guias de SEO");
    for (const cluster of ACTIVE_GUIDE_CLUSTERS) { expect(xml).toContain(`/guias/${cluster.slug}`); expect(xml).toContain(cluster.shortTitle); }
    for (const slug of DEPRECATED_GUIDE_SLUGS) expect(xml).not.toContain(`/guias/${slug}`);
  });

  it("publishes OpenSearch discovery for canonical meaning pages", async () => {
    const res = await openSearchGet();
    const xml = await res.text();
    expect(res.headers.get("content-type")).toContain("application/opensearchdescription+xml");
    expect(xml).toContain("<OpenSearchDescription");
    expect(xml).toContain("/o-que-significa/{searchTerms}");
    expect(xml).not.toContain("/seo-index.json");
    expect(xml).not.toContain("alienígena");
    expect(xml).not.toContain("nave espacial");
  });
});
