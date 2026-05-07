import type { RiskLevel } from "./slang-data";

export interface GlossaryEntry {
  termo: string;
  regiao: string;
  sinonimoNeutro: string;
  contexto: string;
  risco: RiskLevel;
  dataInclusao: string;
  responsavel: string;
  exemplosPermitidos: string[];
}

export interface GlossaryVersion {
  versao: string;
  criadoEm: string;
  entradas: GlossaryEntry[];
}

export interface GlossaryDiff {
  adicionados: GlossaryEntry[];
  removidos: GlossaryEntry[];
  alterados: Array<{
    termo: string;
    antes: GlossaryEntry;
    depois: GlossaryEntry;
    camposAlterados: Array<keyof GlossaryEntry>;
  }>;
}

const TRACKED_FIELDS: Array<keyof GlossaryEntry> = [
  "termo",
  "regiao",
  "sinonimoNeutro",
  "contexto",
  "risco",
  "dataInclusao",
  "responsavel",
  "exemplosPermitidos",
];

export function createGlossaryEntry(entry: GlossaryEntry): GlossaryEntry {
  return {
    ...entry,
    exemplosPermitidos: entry.exemplosPermitidos.filter(Boolean),
  };
}

export function diffGlossaryVersions(
  anterior: GlossaryVersion,
  atual: GlossaryVersion,
): GlossaryDiff {
  const oldMap = new Map(anterior.entradas.map((item) => [item.termo, item]));
  const newMap = new Map(atual.entradas.map((item) => [item.termo, item]));

  const adicionados = atual.entradas.filter((item) => !oldMap.has(item.termo));
  const removidos = anterior.entradas.filter((item) => !newMap.has(item.termo));

  const alterados = atual.entradas
    .filter((item) => oldMap.has(item.termo))
    .map((item) => {
      const before = oldMap.get(item.termo)!;
      const camposAlterados = TRACKED_FIELDS.filter((field) => {
        const oldValue = before[field];
        const newValue = item[field];
        return JSON.stringify(oldValue) !== JSON.stringify(newValue);
      });

      return {
        termo: item.termo,
        antes: before,
        depois: item,
        camposAlterados,
      };
    })
    .filter((item) => item.camposAlterados.length > 0);

  return { adicionados, removidos, alterados };
}
