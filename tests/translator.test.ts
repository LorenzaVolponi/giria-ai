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
});
