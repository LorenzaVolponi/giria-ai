import { describe, expect, it } from "vitest";
import { GET as aiIndexGet } from "../src/app/ai-index.json/route";
import { GET as knowledgeGet } from "../src/app/knowledge.json/route";
import robots from "../src/app/robots";

describe("GEO discovery and citation contracts", () => {
  it("publishes a compact AI discovery manifest with preferred citation surfaces", async () => {
    const res = await aiIndexGet();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-robots-tag")).toContain("index");
    expect(data.entity.name).toBe("Gíria AI");
    expect(data.preferredSurfaces.humanCitation).toContain("/o-que-significa/{termo}");
    expect(data.preferredSurfaces.machineCitation).toContain("/citation/{termo}");
    expect(data.preferredSurfaces.bulkKnowledge).toContain("/knowledge.json");
    expect(data.coverage.publicIndexableTerms).toBeGreaterThan(0);
    expect(data.citationPolicy.preserveContext).toBe(true);
  });

  it("publishes indexable knowledge as DefinedTerm records with evidence signals", async () => {
    const res = await knowledgeGet();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data["@type"]).toBe("DataFeed");
    expect(data.itemCount).toBeGreaterThan(0);
    expect(data.terms).toHaveLength(data.itemCount);

    const first = data.terms[0];
    expect(first["@type"]).toBe("DefinedTerm");
    expect(first.canonical).toContain("/o-que-significa/");
    expect(first.citation).toContain("/citation/");
    expect(first).toHaveProperty("freshness");
    expect(first).toHaveProperty("indexQuality");
    expect(first).toHaveProperty("evidenceBacked");
  });

  it("keeps the semantic graph crawlable while private API surfaces stay blocked", () => {
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(false);
    if (Array.isArray(rules)) throw new Error("Expected a single robots rule");
    const allow = Array.isArray(rules.allow) ? rules.allow : [rules.allow];
    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];

    expect(allow).toContain("/api/graph");
    expect(allow).toContain("/citation/");
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/admin");
  });
});
