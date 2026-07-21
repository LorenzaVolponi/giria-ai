import { describe, expect, it } from "vitest";

import { getTerm, searchTerms } from "@/lib/slang-data";

describe("curated trending slang additions", () => {
  it("loads the new contextual slang pack", () => {
    expect(getTerm("de milhões")?.adultTranslation).toContain("Excelente");
    expect(getTerm("fofoca premium")?.riskLevel).toBe("yellow");
    expect(getTerm("plot twist")?.popularityStatus).toBe("internacional");
  });

  it("finds the new terms through glossary search", () => {
    const results = searchTerms("lapada");
    expect(results.some((term) => term.term === "lapada seca")).toBe(true);
  });
});
