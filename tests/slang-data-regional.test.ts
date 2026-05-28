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

it("includes expanded Nordeste entries", () => {
  const nordesteTerms = getTermsByRegion("nordeste");
  expect(nordesteTerms.some((t) => t.term === "avexado")).toBe(true);
  expect(nordesteTerms.some((t) => t.term === "brocado")).toBe(true);
});

it("supports expanded Sudeste/Centro-Oeste terms", () => {
  const capiau = getTerm("capiau");
  expect(capiau).toBeDefined();
  expect(capiau?.region.toLowerCase()).toContain("sudeste");
});


it("includes newer regional expansion across all macro-regions", () => {
  expect(getTerm("arre diacho")?.region).toContain("AC");
  expect(getTerm("arre égua")?.region).toContain("CE");
  expect(getTerm("camelo")?.region).toContain("Centro-Oeste");
  expect(getTerm("pão de sal")?.region).toContain("MG");
  expect(getTerm("cacetinho")?.region).toContain("RS");
});

it("exposes UF-specific regional entries for quick filters", () => {
  const ceTerms = getTermsByRegion("CE");
  const rsTerms = getTermsByRegion("RS");
  expect(ceTerms.some((t) => t.term === "carioquinha")).toBe(true);
  expect(rsTerms.some((t) => t.term === "bergamota")).toBe(true);
});
