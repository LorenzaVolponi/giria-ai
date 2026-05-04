export type InformalityLevel = "baixa" | "media" | "alta";
export type SlangLevel = "none" | "light" | "regional" | "heavy";

export interface TranslationResponse {
  input: string;
  normalized: string;
  traducaoFormal: string;
  explicacaoContextual: string;
  intencaoSocialEmocional: string;
  nivelInformalidade: InformalityLevel;
  slangLevel: SlangLevel;
  source: "local" | "external";
}
