import { describe, expect, it } from "vitest";
import { getPublicTerm, listPublicTerms, searchPublicIntelligence } from "@/lib/public-intelligence-api";

describe("public intelligence API", () => {
  it("paginates without exposing unlimited payloads", () => {
    const result = listPublicTerms(999, 0);
    expect(result.items.length).toBeLessThanOrEqual(20);
    expect(result.total).toBeGreaterThan(0);
  });

  it("resolves exact public terms", () => {
    const result = getPublicTerm("farmar aura");
    expect(result?.term).toBe("farmar aura");
    expect(result).toHaveProperty("meaning");
  });

  it("supports descriptive search", () => {
    const results = searchPublicIntelligence("expressão para elogiar ou mostrar aprovação", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("relevance");
  });
});
