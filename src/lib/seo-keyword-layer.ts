export type SeoKeywordCluster = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  primaryKeyword: string;
  keywords: string[];
  intent: string;
  intro: string;
  quickAnswer: string;
  updatedAt: string;
  audience: string[];
  semanticEntities: string[];
  contentSignals: string[];
  queryVariants: string[];
  glossary: Array<{
    term: string;
    meaning: string;
  }>;
  examples: Array<{
    phrase: string;
    interpretation: string;
  }>;
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
    primaryKeyword: "gírias de influencer",
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
    quickAnswer:
      "Gírias de influencer são expressões de redes sociais usadas para engajar, vender, brincar, criar pertencimento ou comentar tendências. O sentido depende do formato: publi, live, react, trend, comentário ou bastidor.",
    updatedAt: "2026-06-03",
    audience: ["pais", "educadores", "marcas", "social media", "criadores de conteúdo"],
    semanticEntities: ["influencer", "TikTok", "Instagram", "Reels", "publis", "trend", "engajamento", "criador de conteúdo"],
    contentSignals: [
      "Explica a intenção social por trás de termos de influencer.",
      "Diferencia gírias adolescentes de vocabulário de marketing e plataforma.",
      "Inclui exemplos curtos para interpretação em conversas reais.",
      "Conecta termos de redes sociais com o glossário principal do Gíria AI.",
    ],
    queryVariants: [
      "o que significa gíria de influencer",
      "linguagem de influencer no TikTok",
      "expressões usadas por influencer",
      "gírias de publi e trend",
      "dicionário de gírias de influencer",
    ],
    glossary: [
      { term: "publi", meaning: "Conteúdo patrocinado ou publicidade sinalizada por criador de conteúdo." },
      { term: "trend", meaning: "Formato, áudio, desafio ou estética que se espalha rapidamente nas redes." },
      { term: "engajamento", meaning: "Curtidas, comentários, compartilhamentos, salvamentos e respostas gerados por um conteúdo." },
      { term: "collab", meaning: "Conteúdo feito em parceria entre influenciadores, marcas ou perfis." },
    ],
    examples: [
      { phrase: "Esse look de publi ficou muito clean.", interpretation: "Comentário sobre estética e divulgação de produto." },
      { phrase: "A trend flopou, mas o react salvou.", interpretation: "A tendência não performou bem, mas o vídeo de reação teve melhor resultado." },
      { phrase: "Ela tem muito clout nesse nicho.", interpretation: "A pessoa tem influência e reconhecimento naquele segmento." },
    ],
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
    primaryKeyword: "gíria nave espacial",
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
    quickAnswer:
      "Na internet, nave espacial, ET e alienígena costumam funcionar como metáforas: algo futurista, fora do comum, muito habilidoso, estranho, exagerado ou com estética de outro planeta. O tom pode ser elogio, meme ou crítica.",
    updatedAt: "2026-06-03",
    audience: ["curiosos", "pais", "educadores", "fãs de memes", "comunidades geek"],
    semanticEntities: ["nave espacial", "ET", "alienígena", "meme", "cultura geek", "setup gamer", "filtro", "outro planeta"],
    contentSignals: [
      "Explica metáforas espaciais como gíria, meme e elogio.",
      "Diferencia uso divertido de uso potencialmente ofensivo.",
      "Cobre variações com acento e sem acento para buscas reais.",
      "Mostra exemplos de tecnologia, gaming, filtros e performance.",
    ],
    queryVariants: [
      "nave espacial significado gíria",
      "ET significado meme",
      "alienígena gíria internet",
      "o que significa chamar alguém de ET",
      "meme nave espacial significado",
    ],
    glossary: [
      { term: "nave espacial", meaning: "Metáfora para algo tecnológico, veloz, futurista ou chamativo demais." },
      { term: "ET", meaning: "Apelido informal para alguém ou algo percebido como muito diferente ou fora do padrão." },
      { term: "alienígena", meaning: "Comparação com algo de outro planeta: estranho, raro, genial ou visualmente incomum." },
      { term: "de outro planeta", meaning: "Expressão usada para elogiar habilidade, beleza, performance ou exagero." },
    ],
    examples: [
      { phrase: "Esse setup parece uma nave espacial.", interpretation: "O ambiente tem estética futurista ou muitos equipamentos." },
      { phrase: "O menino joga igual um ET.", interpretation: "A pessoa joga de forma excepcional, fora do comum." },
      { phrase: "Esse filtro deixou todo mundo alienígena.", interpretation: "O efeito visual criou aparência estranha ou divertida." },
    ],
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
    primaryKeyword: "gírias do Paraná",
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
    quickAnswer:
      "Gírias do Paraná combinam expressões regionais, fala de Curitiba, vocabulário do interior e gírias nacionais adaptadas ao contexto local. A busca geralmente quer significado, exemplo e diferença de uso em relação a outras regiões.",
    updatedAt: "2026-06-03",
    audience: ["paranaenses", "curitibanos", "pais", "educadores", "pessoas pesquisando regionalismos"],
    semanticEntities: ["Paraná", "Curitiba", "gírias paranaenses", "regionalismo", "Sul do Brasil", "piá", "vina", "capaz"],
    contentSignals: [
      "Foca em intenção regional específica e menos concorrida.",
      "Conecta Curitiba, interior e gírias nacionais adaptadas ao contexto local.",
      "Inclui termos reconhecíveis para facilitar snippets e respostas diretas.",
      "Aponta para gírias regionais e glossário completo para reforçar links internos.",
    ],
    queryVariants: [
      "gírias do Paraná",
      "gírias paranaenses significado",
      "expressões do Paraná",
      "gírias de Curitiba",
      "como fala no Paraná",
    ],
    glossary: [
      { term: "piá", meaning: "Menino, garoto ou jovem; comum no Sul e muito reconhecido no Paraná." },
      { term: "vina", meaning: "Forma regional de se referir à salsicha, especialmente associada a Curitiba." },
      { term: "capaz", meaning: "Pode expressar surpresa, dúvida, negação ou reação informal, dependendo do tom." },
      { term: "daí", meaning: "Marcador de continuidade na fala, usado para ligar ideias em conversa informal." },
    ],
    examples: [
      { phrase: "O piá chegou falando uma trend nova.", interpretation: "Um jovem trouxe uma gíria ou tendência recente." },
      { phrase: "Capaz que isso é gíria nova de Curitiba?", interpretation: "Reação de surpresa ou dúvida sobre uma expressão local." },
      { phrase: "Daí a galera começou a usar no grupo.", interpretation: "Uso informal para continuar uma narrativa." },
    ],
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
