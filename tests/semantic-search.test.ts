import { describe, expect, it } from "vitest";
import { semanticSearchSlang } from "@/lib/semantic-search";

describe("semanticSearchSlang", () => {
  it("finds candidates from a description instead of requiring the exact slang", () => {
    const results = semanticSearchSlang("expressão usada para elogiar alguém ou mostrar aprovação", 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0.17);
    expect(results[0].matchedSignals.length).toBeGreaterThan(0);
  });

  it("returns no candidates for content with no meaningful lexical signal", () => {
    expect(semanticSearchSlang("xyzqv blptk", 5)).toEqual([]);
  });

  it("limits candidate count", () => {
    expect(semanticSearchSlang("meme internet redes sociais humor", 3).length).toBeLessThanOrEqual(3);
  });
});
