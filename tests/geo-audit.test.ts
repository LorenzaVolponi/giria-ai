import { describe, expect, it } from "vitest";
import { buildGeoAuditPlan, scoreGeoAudit } from "@/lib/geo-audit";

describe("GEO audit", () => {
  it("builds stable prompts only for indexable canonical terms", () => {
    const prompts = buildGeoAuditPlan(10);
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts.length).toBeLessThanOrEqual(10);
    for (const prompt of prompts) {
      expect(prompt.prompt).toContain(prompt.term);
      expect(prompt.canonical).toContain("/o-que-significa/");
      expect(prompt.expectedEntity).toBe("Gíria AI");
    }
  });

  it("scores brand, citation and meaning independently", () => {
    const score = scoreGeoAudit([
      { engine: "chatgpt", promptId: "a", mentionedBrand: true, citedCanonical: true, answerMatchedMeaning: true },
      { engine: "gemini", promptId: "a", mentionedBrand: false, citedCanonical: false, answerMatchedMeaning: true },
    ]);
    expect(score).toEqual({ total: 2, brandMentionRate: 0.5, canonicalCitationRate: 0.5, meaningMatchRate: 1 });
  });
});
