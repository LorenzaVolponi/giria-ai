export type EditorialSource = {
  publisher: string;
  title: string;
  url: string;
  publishedAt: string;
};

export type EditorialEvidence = {
  reviewedAt: string;
  definition: string;
  context: string;
  relatedTerms: string[];
  sources: EditorialSource[];
};

const normalize = (value: string) => value.trim().toLowerCase();

const EDITORIAL_EVIDENCE: Record<string, EditorialEvidence> = {
  "farmar aura": {
    reviewedAt: "2026-08-15",
    definition:
      "Farmar aura significa acumular simbolicamente presença, carisma, respeito ou status social por uma atitude marcante. Pode ser elogio sincero ou ironia quando alguém parece estar se esforçando demais para parecer descolado.",
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
    definition:
      "Six seven, 67 ou 6-7 é um meme propositalmente ambíguo e muitas vezes sem significado literal fixo. Ele funciona como piada nonsense, reação e sinal de pertencimento entre quem reconhece a referência.",
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
  "delulu": {
    reviewedAt: "2026-08-24",
    definition:
      "Delulu é uma forma abreviada e bem-humorada de delusional. Pode descrever alguém agindo de modo fantasioso ou excessivamente confiante e, em alguns contextos online, também funciona como autoironia sobre acreditar muito em uma possibilidade improvável.",
    context:
      "O termo nasceu e circulou por comunidades de fandom, especialmente K-pop, e depois se espalhou para redes sociais de forma mais ampla. O uso pode variar entre crítica leve, brincadeira e uma ideia positiva de autoconfiança exagerada, por isso o contexto da frase importa.",
    relatedTerms: ["delusional", "stan", "brainrot", "manifestar"],
    sources: [
      {
        publisher: "Merriam-Webster",
        title: "DELULU Slang Meaning",
        url: "https://www.merriam-webster.com/slang/delulu",
        publishedAt: "2026-01-08",
      },
      {
        publisher: "Dictionary.com",
        title: "delulu | Slang",
        url: "https://www.dictionary.com/culture/slang/delulu",
        publishedAt: "2023-09-14",
      },
      {
        publisher: "Cambridge University Press",
        title: "Skibidi, delulu, tradwife are new words in the Cambridge Dictionary",
        url: "https://www.cambridge.org/core/blog/?p=64046",
        publishedAt: "2025-08-29",
      },
    ],
  },
  "brainrot": {
    reviewedAt: "2026-08-24",
    definition:
      "Brainrot, também escrito brain rot, descreve conteúdo digital percebido como raso, repetitivo ou viciante e também a fixação intensa nesse tipo de conteúdo. Em uso informal, pode ainda indicar obsessão divertida por um fandom, assunto ou meme.",
    context:
      "Na cultura digital recente, brainrot aparece tanto como crítica ao consumo excessivo de conteúdo de baixo valor quanto como rótulo irônico para memes, bordões e obsessões online. Não é um diagnóstico médico e o sentido depende do tom da conversa.",
    relatedTerms: ["six seven", "skibidi", "meme", "doomscrolling"],
    sources: [
      {
        publisher: "Merriam-Webster",
        title: "BRAIN ROT Slang Meaning",
        url: "https://www.merriam-webster.com/slang/brain-rot",
        publishedAt: "2026-01-06",
      },
      {
        publisher: "Merriam-Webster",
        title: "BRAINROT Definition & Meaning",
        url: "https://www.merriam-webster.com/dictionary/brainrot",
        publishedAt: "2026-02-24",
      },
      {
        publisher: "Dictionary.com",
        title: "brainrot | Slang",
        url: "https://www.dictionary.com/culture/slang/brainrot",
        publishedAt: "2024-11-22",
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
