export type RegionCode = "pt-BR-SP" | "pt-BR-NE" | "pt-BR-RS";

export interface SlangVariantRule {
  base_term: string;
  regional_variants: Partial<Record<RegionCode, string>>;
  safety_notes: string;
  confidence_threshold?: number;
}

export const SLANG_VARIANT_RULES: SlangVariantRule[] = [
  {
    base_term: "de boa",
    regional_variants: {
      "pt-BR-SP": "suave",
      "pt-BR-NE": "de boas",
      "pt-BR-RS": "tri de boa",
    },
    safety_notes:
      "Evitar em textos formais, jurídicos ou quando houver risco de estereotipar o interlocutor pela região.",
    confidence_threshold: 0.7,
  },
  {
    base_term: "massa",
    regional_variants: {
      "pt-BR-SP": "daora",
      "pt-BR-NE": "arretado",
      "pt-BR-RS": "tri",
    },
    safety_notes:
      "Não substituir quando a resposta exigir neutralidade técnica ou tom institucional.",
    confidence_threshold: 0.75,
  },
  {
    base_term: "maneiro",
    regional_variants: {
      "pt-BR-SP": "da hora",
      "pt-BR-NE": "massa",
      "pt-BR-RS": "bah, tri legal",
    },
    safety_notes:
      "Não usar em contextos sensíveis (bullying, saúde mental) sem validação humana do tom.",
  },
];
