import { describe, it, expect } from "vitest";
import { translateSlang } from "../src/lib/translator";

describe("translateSlang", () => {
  it("returns formal translation fields", () => {
    const r = translateSlang("slay");
    expect(r).toHaveProperty("traducaoFormal");
    expect(r).toHaveProperty("explicacaoContextual");
    expect(r).toHaveProperty("intencaoSocialEmocional");
    expect(r).toHaveProperty("nivelInformalidade");
    expect(r).toHaveProperty("slangLevel", "light");
  });

  it("forces none on sensitive context", () => {
    const r = translateSlang("slay", { slangLevel: "regional", context: "suporte jurídico" });
    expect(r.slangLevel).toBe("none");
  });

  it("throws on empty input", () => {
    expect(() => translateSlang("   ")).toThrow();
  });
});
