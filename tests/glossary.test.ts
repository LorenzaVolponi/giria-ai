import { describe, expect, it } from "vitest";

import {
  createGlossaryEntry,
  diffGlossaryVersions,
  type GlossaryVersion,
} from "@/lib/glossary";

describe("glossary", () => {
  it("estrutura entrada com metadados e exemplos permitidos", () => {
    const entry = createGlossaryEntry({
      termo: "cria",
      regiao: "RJ",
      sinonimoNeutro: "amigo",
      contexto: "Vocativo entre jovens em tom amistoso.",
      risco: "green",
      dataInclusao: "2026-05-04",
      responsavel: "time-curadoria",
      exemplosPermitidos: ["E aí cria, tudo certo?", ""],
    });

    expect(entry.exemplosPermitidos).toEqual(["E aí cria, tudo certo?"]);
    expect(entry.responsavel).toBe("time-curadoria");
  });

  it("gera diff entre versões para revisão rápida", () => {
    const anterior: GlossaryVersion = {
      versao: "v1",
      criadoEm: "2026-05-01",
      entradas: [
        {
          termo: "cria",
          regiao: "RJ",
          sinonimoNeutro: "amigo",
          contexto: "Vocativo entre jovens em tom amistoso.",
          risco: "green",
          dataInclusao: "2026-05-01",
          responsavel: "time-curadoria",
          exemplosPermitidos: ["E aí cria, firmeza?"],
        },
      ],
    };

    const atual: GlossaryVersion = {
      versao: "v2",
      criadoEm: "2026-05-04",
      entradas: [
        {
          termo: "cria",
          regiao: "RJ",
          sinonimoNeutro: "colega",
          contexto: "Vocativo entre jovens em tom amistoso.",
          risco: "green",
          dataInclusao: "2026-05-01",
          responsavel: "time-curadoria",
          exemplosPermitidos: ["Salve, cria!"],
        },
        {
          termo: "pai amado",
          regiao: "Nordeste",
          sinonimoNeutro: "surpresa",
          contexto: "Expressão de espanto sem insulto.",
          risco: "green",
          dataInclusao: "2026-05-04",
          responsavel: "time-curadoria",
          exemplosPermitidos: ["Pai amado, quanta chuva!"],
        },
      ],
    };

    const diff = diffGlossaryVersions(anterior, atual);

    expect(diff.adicionados).toHaveLength(1);
    expect(diff.removidos).toHaveLength(0);
    expect(diff.alterados).toHaveLength(1);
    expect(diff.alterados[0].camposAlterados).toEqual([
      "sinonimoNeutro",
      "exemplosPermitidos",
    ]);
  });
});
