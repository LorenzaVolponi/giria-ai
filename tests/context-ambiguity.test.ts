import { describe, expect, it } from "vitest";
import { analyzeContext } from "@/lib/context-intelligence";

describe("context intelligence ambiguity", () => {
  it("raises confidence when an exact term arrives inside a richer sentence", () => {
    const result = analyzeContext("ele falou que eu tô cooked depois daquela reunião no grupo");
    expect(result.detectedTerm?.term).toBe("cooked");
    expect(result.confidenceScore).toBeGreaterThan(0.85);
    expect(result.contextualMeaning.toLowerCase()).toContain("provavelmente");
  });

  it("asks for context instead of claiming certainty for unknown language", () => {
    const result = analyzeContext("xyzqv");
    expect(result.confidence).toBe("baixa");
    expect(result.ambiguity).toBe(true);
    expect(result.clarificationQuestion).toBeTruthy();
  });

  it("never returns more than two alternative readings", () => {
    const result = analyzeContext("cooked");
    expect(result.alternatives.length).toBeLessThanOrEqual(2);
  });
});
