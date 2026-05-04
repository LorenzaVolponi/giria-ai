import { describe, it, expect } from "vitest";
import { translateSlang } from "../src/lib/translator";

describe("translateSlang", () => {
  it("returns formal translation fields", () => {
    const r = translateSlang("slay");
    expect(r).toHaveProperty("traducaoFormal");
    expect(r).toHaveProperty("explicacaoContextual");
    expect(r).toHaveProperty("intencaoSocialEmocional");
    expect(r).toHaveProperty("nivelInformalidade");
  });

  it("throws on empty input", () => {
    expect(() => translateSlang("   ")).toThrow();
  });

  it("applies neutral fallback for ambiguous term with low region confidence", () => {
    const r = translateSlang("fechar", { regionConfidence: 0.2, context: "marketing" });
    expect(r.fallbackNeutro).toBe(true);
    expect(r.fallbackReason).toBe("ambiguous_term_low_region_confidence");
  });
});
