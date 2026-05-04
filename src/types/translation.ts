export type InformalityLevel = "baixa" | "media" | "alta";

export interface TranslationResponse {
  regionalTermApplied?: string;
  regionalization?: {
    requestedRegion?: string;
    appliedRegion?: string;
    usedFallback: boolean;
    safetyNotes?: string;
  };
  input: string;
  normalized: string;
  traducaoFormal: string;
  explicacaoContextual: string;
  intencaoSocialEmocional: string;
  nivelInformalidade: InformalityLevel;
  source: "local" | "external";
}
