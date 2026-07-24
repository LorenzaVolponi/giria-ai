import { describe, expect, it } from "vitest";
import { SLANG_DATA } from "../src/lib/slang-data";

describe("slang data scale", () => {
  it("keeps the searchable slang dictionary above 10k deduplicated entries", () => {
    expect(SLANG_DATA.length).toBeGreaterThanOrEqual(10_000);
  });

  it("keeps searchable term labels unique after normalization", () => {
    const normalizedTerms = SLANG_DATA.map((item) =>
      item.term.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(),
    );

    expect(new Set(normalizedTerms).size).toBe(normalizedTerms.length);
  });
});
