import { describe, expect, it } from "vitest";
import { GET as aiIndexGet } from "../src/app/ai-index.json/route";
import { GET as answersGet } from "../src/app/answers.json/route";
import { GET as knowledgeGet } from "../src/app/knowledge.json/route";
import robots from "../src/app/robots";

describe("GEO discovery and citation contracts", () => {
  it("publishes a compact AI discovery manifest with preferred citation and answer surfaces", async () => {
    const res = await aiIndexGet();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-robots-tag")).toContain("index");
    expect(data.entity.name).toBe("Gíria AI");
    expect(data.preferredSurfaces.humanCitation).toContain("/o-que-significa/{termo}");
    expect(data.preferredSurfaces.directAnswer).toContain("/answer/{termo}");
    expect(data.preferredSurfaces.bulkAnswers).toContain("/answers.json");
    expect(data.preferredSurfaces.machineCitation).toContain("/citation/{termo}");
    expect(data.preferredSurfaces.bulkKnowledge).toContain("/knowledge.json");
    expect(data.coverage.publicIndexableTerms).toBeGreaterThan(0);
    expect(data.coverage.answerRecords).toBe(data.coverage.publicIndexableTerms);
    expect(data.citationPolicy.preserveContext).toBe(true);
    expect(data.retrievalPolicy.definitionQuestion).toContain("/answer/{termo}");
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

  it("publishes Question and Answer records without manufacturing evidence", async () => {
    const res = await answersGet();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data["@type"]).toBe("DataFeed");
    expect(data.itemCount).toBeGreaterThan(0);
    expect(data.dataFeedElement).toHaveLength(data.itemCount);

    const first = data.dataFeedElement[0];
    expect(first["@type"]).toBe("Question");
    expect(first.acceptedAnswer["@type"]).toBe("Answer");
    expect(first.acceptedAnswer.text.length).toBeGreaterThan(20);
    expect(first.authority.canonicalUrl).toContain("/o-que-significa/");
    expect(first.authority.citationUrl).toContain("/citation/");
    expect(first.responsePolicy.preferredCitation).toBe(first.authority.canonicalUrl);
    expect(typeof first.responsePolicy.mayStateAsEditoriallySupported).toBe("boolean");
    if (!first.evidence) expect(first.responsePolicy.mayStateAsEditoriallySupported).toBe(false);
  });

  it("keeps public GEO surfaces crawlable while private API surfaces stay blocked", () => {
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(false);
    if (Array.isArray(rules)) throw new Error("Expected a single robots rule");
    const allow = Array.isArray(rules.allow) ? rules.allow : [rules.allow];
    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];

    expect(allow).toContain("/api/graph");
    expect(allow).toContain("/answer/");
    expect(allow).toContain("/answers.json");
    expect(allow).toContain("/citation/");
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/admin");
  });
});
