import { describe, expect, it } from "vitest";
import { getTerm, getTermsByRegion, searchTerms, SLANG_DATA } from "../src/lib/slang-data";
import { REGIONAL_DEEP_EXPANSION_COUNT } from "../src/lib/slang-regional-deep-expansion";
import {
  getAvailableRegionalStates,
  getRegionalCoverageStats,
  getRegionalEntryByRoot,
  getRegionalStateCounts,
  getRegionalEntryForTerm,
  getRegionalExpressionRoutes,
  getRegionalTerms,
  getRelatedRegionalEntries,
  groupRegionalEntries,
  groupRegionalTerms,
  normalizeRegionLabel,
} from "../src/lib/regional-glossary";
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


it("adds more than seven thousand deep regional contextual entries", () => {
  expect(REGIONAL_DEEP_EXPANSION_COUNT).toBeGreaterThanOrEqual(7000);
  expect(SLANG_DATA.length).toBeGreaterThanOrEqual(7000);
  expect(getTerm("arre diacho no zap")?.region).toBe("Norte");
  expect(getTerm("oxente do São João")?.region).toBe("Nordeste");
  expect(getTerm("baita do chimarrão")?.region).toBe("Sul");
});

it("normalizes UF-specific regional labels into macro-regions", () => {
  expect(normalizeRegionLabel("Nordeste (CE/PB/RN)")).toBe("Nordeste");
  expect(normalizeRegionLabel("Sul (RS/SC/PR)")).toBe("Sul");
  expect(normalizeRegionLabel("Centro-Oeste / Sudeste (DF/RJ)")).toBe("Brasil");
  expect(normalizeRegionLabel("São Paulo / Brasília")).toBe("Brasil");
});

it("builds regional glossary stats for the public Regionais tab", () => {
  const regionalTerms = getRegionalTerms();
  const stats = getRegionalCoverageStats(regionalTerms);
  const grouped = groupRegionalTerms(regionalTerms);

  expect(stats.total).toBe(regionalTerms.length);
  expect(stats.trending).toBeGreaterThan(0);
  expect(getAvailableRegionalStates(regionalTerms)).toEqual(expect.arrayContaining(["AC", "CE", "MG", "RS"]));
  expect(grouped.get("Norte")?.some((term) => term.term === "arre diacho")).toBe(true);
  expect(grouped.get("Nordeste")?.some((term) => term.term === "carioquinha")).toBe(true);
  expect(grouped.get("Sul")?.some((term) => term.term === "bergamota")).toBe(true);
});

it("filters regional glossary by UF, risk and contextual search", () => {
  const ceTerms = getRegionalTerms({ uf: "CE", q: "pão", risk: "green" });
  expect(ceTerms.some((term) => term.term === "carioquinha")).toBe(true);
  expect(ceTerms.every((term) => term.riskLevel === "green")).toBe(true);
  expect(ceTerms.every((term) => term.region.includes("CE"))).toBe(true);
});


it("groups repetitive contextual slang as variations of the base expression", () => {
  const centroOesteEntries = groupRegionalEntries(getRegionalTerms()).get("Centro-Oeste") ?? [];
  const arredaEntry = centroOesteEntries.find((entry) => entry.rootTerm === "arreda");

  expect(arredaEntry).toBeDefined();
  expect(arredaEntry?.summary).toBe("pedido para abrir espaço");
  expect(arredaEntry?.totalVariants).toBeGreaterThan(20);
  expect(arredaEntry?.featuredVariations.length).toBeLessThanOrEqual(3);
  expect(arredaEntry?.featuredVariations.map((term) => term.term)).not.toContain("arreda do X");
  expect(arredaEntry?.variationGroups.map((group) => group.label)).toEqual(expect.arrayContaining(["Digital", "Território"]));
  expect(arredaEntry?.variations.map((term) => term.term)).toEqual(expect.arrayContaining(["arreda da rua", "arreda da serra"]));
});

it("orders regional glossary cards by curated roots before generated volume", () => {
  const nordesteEntries = groupRegionalEntries(getRegionalTerms()).get("Nordeste") ?? [];
  expect(nordesteEntries.slice(0, 4).map((entry) => entry.rootTerm)).toEqual(["oxente", "arre égua", "arretado", "avexado"]);
});


it("resolves a regional expression root page lookup by root and region", () => {
  const lookup = getRegionalEntryByRoot("arreda", "Centro-Oeste");

  expect(lookup?.region).toBe("Centro-Oeste");
  expect(lookup?.entry.rootTerm).toBe("arreda");
  expect(lookup?.entry.featuredVariations.length).toBeGreaterThan(0);
});


it("builds SEO routes and related entries for regional expression pages", () => {
  const routes = getRegionalExpressionRoutes(3);
  const related = getRelatedRegionalEntries("arreda", "Centro-Oeste", 3);

  expect(routes.some((route) => route.path.includes("/girias/regionais/") && route.path.includes("regiao="))).toBe(true);
  expect(routes.every((route) => route.priority >= 0.55)).toBe(true);
  expect(related).toHaveLength(3);
  expect(related.every((entry) => entry.rootTerm !== "arreda")).toBe(true);
});


it("links individual generated regional terms back to their expression root", () => {
  const lookup = getRegionalEntryForTerm("arreda da rua");

  expect(lookup?.region).toBe("Centro-Oeste");
  expect(lookup?.entry.rootTerm).toBe("arreda");
  expect(lookup?.entry.variations.some((term) => term.term === "arreda da rua")).toBe(true);
});


it("reuses the cached regional grouping for unfiltered lookups", () => {
  const terms = getRegionalTerms();
  const first = groupRegionalEntries(terms);
  const second = groupRegionalEntries(getRegionalTerms());

  expect(second).toBe(first);
  expect(getRegionalEntryByRoot("arreda", "Centro-Oeste")?.entry).toBe(first.get("Centro-Oeste")?.find((entry) => entry.rootTerm === "arreda"));
});


it("counts regional entries by UF for quick filters", () => {
  const stateCounts = getRegionalStateCounts(getRegionalTerms());
  const ce = stateCounts.find((item) => item.state === "CE");
  const rs = stateCounts.find((item) => item.state === "RS");

  expect(ce?.count).toBeGreaterThan(0);
  expect(rs?.count).toBeGreaterThan(0);
  expect(stateCounts.map((item) => item.state)).toEqual([...stateCounts.map((item) => item.state)].sort());
});
