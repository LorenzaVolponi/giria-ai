export type EditorialSource = {
  publisher: string;
  title: string;
  url: string;
  publishedAt: string;
};

export type EditorialEvidence = {
  reviewedAt: string;
  context: string;
  relatedTerms: string[];
  sources: EditorialSource[];
};

const normalize = (value: string) => value.trim().toLowerCase();

const EDITORIAL_EVIDENCE: Record<string, EditorialEvidence> = {
  "farmar aura": {
    reviewedAt: "2026-08-15",
    context:
      "A expressão segue recebendo cobertura editorial no Brasil em 2026 e saiu do uso puramente online para aparecer também em eventos presenciais. O sentido continua ligado a acumular, de forma séria ou irônica, presença, carisma, respeito ou status social simbólico.",
    relatedTerms: ["aura", "aura farming", "six seven", "brainrot"],
    sources: [
      {
        publisher: "Band",
        title: "Farmar aura: saiba o significado de expressão que viralizou na internet",
        url: "https://www.band.com.br/entretenimento/o-que-e-farmar-aura-202604211641",
        publishedAt: "2026-04-21",
      },
      {
        publisher: "Capricho",
        title: "O que significa farmar aura, outra gíria do momento da geração alfa",
        url: "https://capricho.abril.com.br/comportamento/o-que-significa-farmar-aura/",
        publishedAt: "2026-04-22",
      },
      {
        publisher: "Band",
        title: "O que é farmar aura? Entenda a gíria jovem que virou até campeonato no BR",
        url: "https://www.band.com.br/entretenimento/o-que-e-farmar-aura-entenda-a-giria-jovem-que-virou-ate-campeonato-no-br-202607241656",
        publishedAt: "2026-07-25",
      },
    ],
  },
  "six seven": {
    reviewedAt: "2026-08-15",
    context:
      "Six seven, também escrito 67 ou 6-7, funciona principalmente como meme nonsense e marcador de pertencimento. A ambiguidade faz parte da piada: em muitos usos não existe uma tradução literal estável.",
    relatedTerms: ["41", "brainrot", "farmar aura", "aura farming"],
    sources: [
      {
        publisher: "Dictionary.com",
        title: "Dictionary.com’s 2025 Word of the Year Is 67",
        url: "https://www.dictionary.com/articles/word-of-the-year-2025",
        publishedAt: "2025-10-28",
      },
      {
        publisher: "Dictionary.com",
        title: "67 | Slang",
        url: "https://www.dictionary.com/culture/slang/67",
        publishedAt: "2025-09-15",
      },
      {
        publisher: "Folha de S.Paulo",
        title: "Saiba o que é farmar aura, 6-7, gag e outras gírias jovens",
        url: "https://www1.folha.uol.com.br/amp/folhateen/2026/04/saiba-o-que-e-farmar-aura-6-7-gag-e-outras-girias-jovens.shtml",
        publishedAt: "2026-04-28",
      },
    ],
  },
};

export function getEditorialEvidence(term: string): EditorialEvidence | undefined {
  return EDITORIAL_EVIDENCE[normalize(term)];
}

export function getEditorialEvidenceTerms(): string[] {
  return Object.keys(EDITORIAL_EVIDENCE);
}
