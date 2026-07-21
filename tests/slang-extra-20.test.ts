import { describe, expect, it } from "vitest";

import { getTerm, searchTerms } from "@/lib/slang-data";

describe("additional practical slang additions", () => {
  it("loads terms for parent-friendly context explanations", () => {
    expect(getTerm("foi de arrasta")?.riskLevel).toBe("yellow");
    expect(getTerm("passou a visão")?.riskLevel).toBe("green");
    expect(getTerm("meter o shape")?.contextNotes).toContain("cobrança corporal");
  });

  it("exposes new terms through search", () => {
    const results = searchTerms("sapatinho");
    expect(results.some((term) => term.term === "no sapatinho")).toBe(true);
  });
});
