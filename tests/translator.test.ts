import { describe, it, expect, vi } from "vitest";
import { translateSlang } from "../src/lib/translator";

describe("translateSlang", () => {
  it("returns formal translation fields", () => {
    const r = translateSlang("slay");
    expect(r).toHaveProperty("traducaoFormal");
    expect(r).toHaveProperty("explicacaoContextual");
    expect(r).toHaveProperty("intencaoSocialEmocional");
    expect(r).toHaveProperty("nivelInformalidade");
  });

  it("does not claim an external source when no external provider is invoked", () => {
    vi.stubEnv("TRANSLATION_PROVIDER", "external-provider");
    try {
      const result = translateSlang("giria-inexistente-xqz-987654321");
      expect(result.source).toBe("local");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("throws on empty input", () => {
    expect(() => translateSlang("   ")).toThrow();
  });
});
