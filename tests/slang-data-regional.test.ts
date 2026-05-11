import { describe, expect, it } from "vitest";
import { getTerm, getTermsByRegion, searchTerms } from "../src/lib/slang-data";

describe("regional slang support", () => {
  it("loads explicit regional terms", () => {
    const term = getTerm("oxi mainha");
    expect(term).toBeDefined();
    expect(term?.category).toBe("regional");
  });

  it("can filter by region", () => {
    const nordesteTerms = getTermsByRegion("nordeste");
    expect(nordesteTerms.length).toBeGreaterThan(0);
    expect(nordesteTerms.some((t) => t.term === "oxi mainha")).toBe(true);
  });

  it("supports searching by region keyword", () => {
    const results = searchTerms("sul");
    expect(results.some((t) => t.term === "tri massa")).toBe(true);
  });
});


it("includes North region entries", () => {
  const norteTerms = getTermsByRegion("norte");
  expect(norteTerms.some((t) => t.term === "pai d'égua")).toBe(true);
});
