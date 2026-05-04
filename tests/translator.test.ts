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

  it("applies regional variant when region is known", () => {
    const r = translateSlang("massa", { region: "pt-BR-NE" });
    expect(r.regionalTermApplied).toBe("arretado");
    expect(r.regionalization?.usedFallback).toBe(false);
  });

  it("keeps base term when region is unknown", () => {
    const r = translateSlang("massa", { region: "pt-BR-XX" });
    expect(r.regionalTermApplied).toBe("massa");
    expect(r.regionalization?.usedFallback).toBe(true);
  });

});
