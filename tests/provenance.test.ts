import { describe, expect, it } from "vitest";
import { SLANG_DATA } from "../src/lib/slang-data";
import { buildProvenanceRecord } from "../src/lib/provenance";
import { GET as provenanceFeedGet } from "../src/app/provenance.json/route";
import robots from "../src/app/robots";

const site = "https://giria-ai.vercel.app";

describe("GEO provenance", () => {
  it("exposes review-set provenance without manufacturing per-source claim support", () => {
    const term = SLANG_DATA.find((item) => item.term === "delulu");
    expect(term).toBeTruthy();
    const record = buildProvenanceRecord(term!, site);
    expect(record.reviewEvidence?.sourceCount).toBeGreaterThanOrEqual(2);
    expect(record.sourceDiversity.uniquePublishers).toBeGreaterThanOrEqual(2);
    expect(record.provenancePolicy.claimLevelMapping).toBe("review_set");
    expect(record.provenancePolicy.doNotInferPerSourceClaimSupport).toBe(true);
    expect(record.reviewEvidence?.scopeNotice.toLowerCase()).toContain("não afirma");
  });

  it("keeps catalog-only records explicit when no editorial evidence exists", () => {
    const term = SLANG_DATA.find((item) => !["farmar aura", "six seven", "delulu", "brainrot"].includes(item.term));
    expect(term).toBeTruthy();
    const record = buildProvenanceRecord(term!, site);
    expect(record.reviewEvidence).toBeNull();
    expect(record.sourceDiversity.interpretation).toBe("catalog_only");
    expect(record.sourceDiversity.score).toBe(0);
  });

  it("publishes a bulk provenance feed for public terms", async () => {
    const res = await provenanceFeedGet();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data["@type"]).toBe("DataFeed");
    expect(data.itemCount).toBeGreaterThan(0);
    expect(data.dataFeedElement).toHaveLength(data.itemCount);
    expect(data.policy.doNotInferPerSourceClaimSupport).toBe(true);
  });

  it("allows provenance surfaces in robots", () => {
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(false);
    if (Array.isArray(rules)) throw new Error("Expected a single robots rule");
    const allow = Array.isArray(rules.allow) ? rules.allow : [rules.allow];
    expect(allow).toContain("/provenance/");
    expect(allow).toContain("/provenance.json");
  });
});
