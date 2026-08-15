import { describe, expect, it } from "vitest";
import { SEO_KEYWORD_CLUSTERS } from "../src/lib/seo-keyword-layer";
import { ACTIVE_GUIDE_CLUSTERS, DEPRECATED_GUIDE_SLUGS } from "../src/lib/guide-policy";
import { getEditorialEvidence, getEditorialEvidenceTerms } from "../src/lib/editorial-evidence";

function normalized(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

describe("editorial index integrity", () => {
  it("keeps guide slugs and central topics unique", () => {
    const slugs = SEO_KEYWORD_CLUSTERS.map((cluster) => cluster.slug);
    const primaryTopics = SEO_KEYWORD_CLUSTERS.map((cluster) => normalized(cluster.primaryKeyword));

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(primaryTopics).size).toBe(primaryTopics.length);
  });

  it("keeps deprecated guide clusters out of the public editorial collection", () => {
    const activeSlugs = new Set(ACTIVE_GUIDE_CLUSTERS.map((cluster) => cluster.slug));

    for (const slug of DEPRECATED_GUIDE_SLUGS) {
      expect(activeSlugs.has(slug)).toBe(false);
    }
  });

  it("keeps reviewed terms unique and backed by valid sources", () => {
    const terms = getEditorialEvidenceTerms();
    expect(new Set(terms.map(normalized)).size).toBe(terms.length);

    for (const term of terms) {
      const evidence = getEditorialEvidence(term);
      expect(evidence).toBeDefined();
      expect(evidence?.definition.trim().length).toBeGreaterThan(40);
      expect(evidence?.sources.length).toBeGreaterThanOrEqual(2);
      expect(evidence?.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      for (const source of evidence?.sources ?? []) {
        expect(source.url.startsWith("https://")).toBe(true);
        expect(source.publisher.trim().length).toBeGreaterThan(0);
        expect(source.title.trim().length).toBeGreaterThan(0);
        expect(source.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });
});
