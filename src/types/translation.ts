export type InformalityLevel = "baixa" | "media" | "alta";

export interface TranslationResponse {
  input: string;
  normalized: string;
  traducaoFormal: string;
  explicacaoContextual: string;
  intencaoSocialEmocional: string;
  nivelInformalidade: InformalityLevel;
  source: "local" | "external";
}
