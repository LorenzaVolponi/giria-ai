import { describe, expect, it } from "vitest";
import { ORGANIC_SEO_KEYWORDS, SEO_KEYWORD_CLUSTERS } from "../src/lib/seo-keyword-layer";

function normalized(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

describe("SEO uniqueness", () => {
  it("keeps global organic keywords unique after normalization", () => {
    const normalizedKeywords = ORGANIC_SEO_KEYWORDS.map(normalized);
    expect(new Set(normalizedKeywords).size).toBe(normalizedKeywords.length);
  });

  it("keeps guide slugs and primary keywords unique", () => {
    const slugs = SEO_KEYWORD_CLUSTERS.map((cluster) => cluster.slug);
    const primaryKeywords = SEO_KEYWORD_CLUSTERS.map((cluster) => normalized(cluster.primaryKeyword));

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(primaryKeywords).size).toBe(primaryKeywords.length);
  });
});
