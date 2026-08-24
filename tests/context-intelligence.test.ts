import { describe, expect, it } from "vitest";
import { analyzeContext, detectTermInContext } from "../src/lib/context-intelligence";

describe("context intelligence", () => {
  it("finds a catalogued slang term inside a full sentence", () => {
    const term = detectTermInContext("ele falou que eu tô cooked depois da reunião");
    expect(term?.term).toBe("cooked");
  });

  it("raises confidence when an exact expression appears with context", () => {
    const result = analyzeContext("me mandaram cooked no grupo depois da call");
    expect(result.detectedTerm?.term).toBe("cooked");
    expect(result.confidence).toBe("alta");
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.9);
    expect(result.platform).toBe("mensagem / conversa privada");
  });

  it("asks for context instead of pretending certainty for unknown language", () => {
    const result = analyzeContext("xyzabc totalmente novo");
    expect(result.confidence).toBe("baixa");
    expect(result.ambiguity).toBe(true);
    expect(result.clarificationQuestion).toBeTruthy();
    expect(result.contextualMeaning).toContain("Não há evidência suficiente");
  });
});
