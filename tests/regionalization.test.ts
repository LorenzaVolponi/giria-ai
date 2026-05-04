import { describe, expect, it } from "vitest";
import { translateSlang } from "../src/lib/translator";
import { applyRegionalization } from "../src/lib/regionalization";

describe("regionalization baseline snapshots", () => {
  it("congela baseline atual sem regionalização", () => {
    const base = translateSlang("slay");
    expect(base).toMatchSnapshot();
  });

  it("cenário sem região", () => {
    const base = translateSlang("slay");
    const result = applyRegionalization(base, {}, { enabled: true });
    expect(result).toMatchSnapshot();
  });

  it("cenário com região", () => {
    const base = translateSlang("slay");
    const result = applyRegionalization(
      base,
      { requestedRegion: "SP", confidence: 0.95 },
      { enabled: true },
    );
    expect(result).toMatchSnapshot();
  });

  it("cenário de região conflitante", () => {
    const base = translateSlang("slay");
    const result = applyRegionalization(
      base,
      { requestedRegion: "RJ", inferredRegion: "SP", confidence: 0.95 },
      { enabled: true },
    );
    expect(result).toMatchSnapshot();
  });

  it("fluxo legado permanece idêntico com regionalização desativada", () => {
    const base = translateSlang("slay");
    const result = applyRegionalization(
      base,
      { requestedRegion: "SP", inferredRegion: "SP", confidence: 1 },
      { enabled: false },
    );

    expect(result).toEqual(base);
  });

  it("fallback neutro quando confiança de região é baixa", () => {
    const base = translateSlang("slay");
    const result = applyRegionalization(
      base,
      { requestedRegion: "SP", confidence: 0.2 },
      { enabled: true, lowConfidenceThreshold: 0.7 },
    );

    expect(result.explicacaoContextual).toContain("resposta neutra");
    expect(result).toMatchSnapshot();
  });
});
