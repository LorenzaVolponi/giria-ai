export type SeoKeywordCluster = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  intent: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const ORGANIC_SEO_KEYWORDS = [
  "gírias de influencer",
  "influencer",
  "linguagem de influencer",
  "nave espacial",
  "gíria nave espacial",
  "ET",
  "et",
  "alienígena",
  "alienigena",
  "gírias alienígenas",
  "gírias do Paraná",
  "Paraná",
  "gírias paranaenses",
  "Curitiba",
  "internet brasileira",
  "memes brasileiros",
  "tradutor de gírias brasileiras",
] as const;

export const SEO_KEYWORD_CLUSTERS: SeoKeywordCluster[] = [
  {
    slug: "girias-de-influencer",
    title: "Gírias de influencer: entenda a linguagem das redes sociais",
    shortTitle: "Gírias de influencer",
    description:
      "Guia de gírias de influencer para entender expressões usadas em reels, lives, publis, stories e conteúdos virais.",
    keywords: [
      "gírias de influencer",
      "influencer",
      "linguagem de influencer",
      "gírias de redes sociais",
      "gírias do Instagram",
      "gírias do TikTok",
      "publis",
      "trend",
      "viral",
    ],
    intent: "Entender termos usados por influencers, criadores de conteúdo e comunidades de redes sociais.",
    intro:
      "Influencer virou uma das palavras centrais da cultura digital. Nesta camada de SEO, o Gíria AI organiza expressões usadas em vídeos, lives, publis, comentários e tendências para ajudar pais, educadores, marcas e curiosos a entenderem o que está sendo dito nas redes.",
    sections: [
      {
        title: "Por que gírias de influencer ranqueiam bem?",
        body:
          "Esse tipo de busca mistura intenção educacional e intenção de tendência: a pessoa quer entender rapidamente uma palavra que ouviu em um story, em uma publi ou em um vídeo curto. Por isso, páginas com explicação direta, exemplo e contexto social tendem a responder melhor à busca orgânica.",
      },
      {
        title: "Como o Gíria AI interpreta esse vocabulário",
        body:
          "O foco não é apenas traduzir a palavra, mas explicar intenção, tom e risco de interpretação. Uma frase de influencer pode ser elogio, ironia, convite para engajamento ou apenas estética de internet.",
      },
    ],
    faqs: [
      {
        question: "O que são gírias de influencer?",
        answer:
          "São expressões usadas por criadores de conteúdo em vídeos, lives, stories, publis e comentários para gerar identificação, humor, autoridade ou engajamento.",
      },
      {
        question: "Gíria de influencer é sempre igual a gíria adolescente?",
        answer:
          "Não. Muitas se misturam, mas a linguagem de influencer também inclui termos de marketing, tendências, estética, engajamento e cultura de plataforma.",
      },
    ],
  },
  {
    slug: "girias-nave-espacial-et-alienigena",
    title: "Gírias de nave espacial, ET e alienígena na internet",
    shortTitle: "Nave espacial, ET e alienígena",
    description:
      "Entenda como nave espacial, ET e alienígena aparecem em memes, apelidos, ironias e gírias da cultura digital brasileira.",
    keywords: [
      "nave espacial",
      "gíria nave espacial",
      "ET",
      "et",
      "alienígena",
      "alienigena",
      "gírias alienígenas",
      "meme de ET",
      "meme alienígena",
      "cultura geek brasileira",
    ],
    intent: "Capturar buscas curiosas sobre termos espaciais usados como metáfora, meme ou apelido na internet.",
    intro:
      "Termos como nave espacial, ET e alienígena aparecem em memes, brincadeiras e comparações para falar de algo muito diferente, futurista, estranho, genial ou fora da realidade. Essa camada ajuda o buscador a entender que o Gíria AI também cobre expressões de cultura geek, memes e metáforas digitais.",
    sections: [
      {
        title: "Quando ‘alienígena’ vira gíria?",
        body:
          "Na linguagem informal, alienígena pode indicar algo fora do comum, uma habilidade absurda, uma aparência muito diferente ou uma situação que parece de outro planeta. O sentido depende do tom: pode ser elogio, humor ou estranhamento.",
      },
      {
        title: "Como ‘nave espacial’ aparece em memes",
        body:
          "Nave espacial costuma ser metáfora para tecnologia, velocidade, visual futurista ou algo exageradamente chamativo. Em comunidades digitais, a expressão pode aparecer em comentários sobre carros, setups, roupas, shows e efeitos visuais.",
      },
    ],
    faqs: [
      {
        question: "ET pode ser usado como gíria?",
        answer:
          "Sim. ET pode ser usado informalmente para falar de alguém muito diferente, muito habilidoso ou fora do padrão, mas o tom precisa ser observado para evitar ofensa.",
      },
      {
        question: "Alienígena é uma gíria ofensiva?",
        answer:
          "Depende do contexto. Pode ser brincadeira ou elogio, mas também pode soar ofensivo se usado para ridicularizar aparência, origem ou comportamento de alguém.",
      },
    ],
  },
  {
    slug: "girias-do-parana",
    title: "Gírias do Paraná: expressões paranaenses e linguagem regional",
    shortTitle: "Gírias do Paraná",
    description:
      "Guia de gírias do Paraná, expressões paranaenses e diferenças de uso em Curitiba, interior e internet brasileira.",
    keywords: [
      "gírias do Paraná",
      "Paraná",
      "gírias paranaenses",
      "expressões do Paraná",
      "gírias de Curitiba",
      "Curitiba",
      "regionalismo paranaense",
      "gírias do Sul",
    ],
    intent: "Fortalecer buscas regionais sobre Paraná e conectar regionalismos ao glossário brasileiro de gírias.",
    intro:
      "O Paraná tem uma mistura forte de linguagem do Sul, cultura urbana de Curitiba, interior, internet e expressões de fronteira cultural. Esta página cria uma camada regional para ajudar o Gíria AI a ranquear melhor quando a busca envolve Paraná, gírias paranaenses e jeito local de falar.",
    sections: [
      {
        title: "Por que criar uma camada de SEO para Paraná?",
        body:
          "Buscas regionais são mais específicas e geralmente têm menor concorrência. Ao explicar gírias do Paraná com contexto, exemplos e relação com a internet brasileira, o site aumenta relevância sem depender apenas de termos genéricos como ‘gírias brasileiras’.",
      },
      {
        title: "Paraná, Curitiba e linguagem digital",
        body:
          "Nem toda expressão usada no Paraná nasce no estado. Muitas vêm de redes sociais, escola, gaming, funk, memes e cultura jovem, mas ganham pronúncia, frequência e contexto local em Curitiba e no interior.",
      },
    ],
    faqs: [
      {
        question: "Existe gíria específica do Paraná?",
        answer:
          "Sim, existem expressões regionais e usos mais comuns no Paraná, além de gírias nacionais que ganham contexto local em Curitiba, interior e comunidades online.",
      },
      {
        question: "Como encontrar gírias do Paraná no Gíria AI?",
        answer:
          "Use o glossário regional, busque por Paraná, Curitiba ou termos específicos e acompanhe as páginas de guias regionais que organizam expressões por intenção e contexto.",
      },
    ],
  },
];

export function getSeoKeywordCluster(slug: string): SeoKeywordCluster | undefined {
  return SEO_KEYWORD_CLUSTERS.find((cluster) => cluster.slug === slug);
}

export function getSeoKeywordClusterSlugs(): string[] {
  return SEO_KEYWORD_CLUSTERS.map((cluster) => cluster.slug);
}
