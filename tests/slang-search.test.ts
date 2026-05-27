import { describe, expect, it } from "vitest";

import { findClosestTermsWithScore, lookupTerm, normalize } from "@/lib/slang-search";
import { SLANG_DATA } from "@/lib/slang-data";

describe("slang-search relevance", () => {
  it("prioriza etapa exata antes de fuzzy", () => {
    const result = lookupTerm("delulu");
    expect(result.stage).toBe("exact");
    expect(result.items[0]?.term.toLowerCase()).toContain("delulu");
  });

  it("resolve variações com etapa dedicada", () => {
    const base = SLANG_DATA.find((t) => (t.variations ?? []).length > 0);
    expect(base).toBeTruthy();
    const result = lookupTerm(base!.variations![0]);
    expect(["variation", "exact"]).toContain(result.stage);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("retorna candidatos fuzzy para erro ortográfico", () => {
    const result = findClosestTermsWithScore("delullu", 3);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("slang-search performance smoke", () => {
  it("escala de forma controlada com dataset 2x", () => {
    const queries = ["delullu", "farmar aura", "crinje", "siggma", "amassou", "lacre", "mitou", "gaag"];
    const sampleSize = 80;

    const buildOverride = (dataset: typeof SLANG_DATA) => {
      const ngramIndex = new Map<string, Set<string>>();
      const normalizedPool = dataset.map((term) => ({ normalized: normalize(term.term), term }));
      for (const entry of normalizedPool) {
        const value = entry.normalized;
        const grams = value.length <= 3 ? [value] : Array.from({ length: value.length - 2 }, (_, i) => value.slice(i, i + 3));
        for (const gram of grams) {
          const set = ngramIndex.get(gram) ?? new Set<string>();
          set.add(entry.normalized);
          ngramIndex.set(gram, set);
        }
      }
      return { ngramIndex, normalizedPool };
    };

    const baseOverride = buildOverride(SLANG_DATA);
    const doubledOverride = buildOverride([...SLANG_DATA, ...SLANG_DATA]);

    const bench = (override: ReturnType<typeof buildOverride>) => {
      const start = performance.now();
      for (let i = 0; i < sampleSize; i++) {
        for (const q of queries) findClosestTermsWithScore(q, 5, override);
      }
      return (performance.now() - start) / sampleSize;
    };

    const baseAvg = bench(baseOverride);
    const doubledAvg = bench(doubledOverride);

    expect(doubledAvg / baseAvg).toBeLessThan(2.3);
  });
});
