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
  "gírias do momento",
  "gírias 2026",
  "gírias adolescentes 2026",
  "gírias geração z",
  "gírias do TikTok 2026",
  "dicionário de gírias para pais",
  "significado de gírias de jovens",
  "vocabulário adolescente",
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
    slug: "girias-do-momento-2026",
    title: "Gírias do momento em 2026: significados, exemplos e contexto",
    shortTitle: "Gírias do momento 2026",
    description:
      "Guia atualizado de gírias do momento em 2026 para entender expressões populares entre jovens, TikTok, memes, escola e redes sociais.",
    primaryKeyword: "gírias do momento 2026",
    keywords: [
      "gírias do momento 2026",
      "gírias atuais",
      "gírias novas",
      "gírias populares",
      "gírias adolescentes 2026",
      "gírias internet 2026",
      "significado de gírias atuais",
    ],
    intent: "Responder buscas de atualização rápida sobre expressões em alta, com explicação útil e sem prometer lista definitiva.",
    intro:
      "As gírias do momento mudam rápido porque nascem em vídeos curtos, comentários, grupos de escola, jogos, fandoms e memes. Este guia organiza intenções de busca atuais em uma leitura segura para pais, educadores e curiosos, com foco em significado, tom, contexto e cuidado de interpretação.",
    quickAnswer:
      "Gírias do momento em 2026 são expressões que aparecem com frequência em redes sociais, conversas de adolescentes, memes e comunidades digitais. O mais importante não é decorar uma lista, mas entender contexto, intenção social, ironia e possíveis riscos de interpretação.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "social media", "curiosos"],
    semanticEntities: ["gírias do momento", "2026", "TikTok", "memes", "adolescentes", "redes sociais", "linguagem jovem"],
    contentSignals: [
      "Explica que tendências linguísticas mudam conforme plataforma e comunidade.",
      "Evita afirmar ranking absoluto de termos sem evidência pública verificável.",
      "Conecta busca por novidade com exemplos seguros e contexto social.",
      "Direciona o usuário para o tradutor e para páginas de significado específicas.",
    ],
    queryVariants: [
      "gírias do momento 2026",
      "quais são as gírias atuais",
      "gírias novas dos jovens",
      "gírias populares na internet",
      "significado das gírias de 2026",
    ],
    glossary: [
      { term: "trend", meaning: "Tendência de formato, áudio, meme ou comportamento que se espalha nas redes." },
      { term: "viral", meaning: "Conteúdo que circula muito rápido e alcança muitas pessoas." },
      { term: "cringe", meaning: "Algo percebido como vergonhoso, ultrapassado ou desconfortável." },
      { term: "slay", meaning: "Elogio para atitude, visual ou performance muito marcante." },
    ],
    examples: [
      { phrase: "Essa gíria viralizou na escola depois da trend.", interpretation: "A expressão se espalhou a partir de um conteúdo popular." },
      { phrase: "Não entendi se foi elogio ou ironia.", interpretation: "Muitas gírias dependem do tom e do grupo em que aparecem." },
      { phrase: "Meu filho falou isso no grupo da sala.", interpretation: "A busca pode vir de pais tentando interpretar conversa adolescente." },
    ],
    sections: [
      {
        title: "Como acompanhar gírias sem cair em lista desatualizada",
        body:
          "A melhor estratégia é observar contexto, plataforma e intenção. Uma palavra pode ser elogio no TikTok, ironia em comentário e brincadeira em grupo de escola. Por isso, o Gíria AI prioriza explicação contextual em vez de apenas tradução literal.",
      },
      {
        title: "Por que esse tema é importante para SEO orgânico",
        body:
          "Buscas por gírias do momento costumam ter intenção imediata: a pessoa ouviu um termo e quer entender rápido. Conteúdo claro, atualizado, com resposta direta e exemplos reais tende a satisfazer melhor essa necessidade.",
      },
    ],
    faqs: [
      {
        question: "Como saber se uma gíria ainda está em alta?",
        answer:
          "Observe se ela aparece em vídeos recentes, comentários, grupos de conversa e variações de meme. Mesmo assim, popularidade muda por região e comunidade.",
      },
      {
        question: "Gíria do momento pode ter mais de um significado?",
        answer:
          "Sim. Muitas expressões dependem de ironia, plataforma, região, idade e relação entre as pessoas. O contexto deve vir antes da conclusão.",
      },
    ],
  },
  {
    slug: "girias-do-tiktok",
    title: "Gírias do TikTok: termos, trends e linguagem dos vídeos curtos",
    shortTitle: "Gírias do TikTok",
    description:
      "Entenda gírias do TikTok, trends, comentários, memes e expressões que aparecem em vídeos curtos e conversas de adolescentes.",
    primaryKeyword: "gírias do TikTok",
    keywords: ["gírias do TikTok", "gírias TikTok", "trend TikTok", "significado no TikTok", "memes do TikTok", "linguagem TikTok"],
    intent: "Ajudar quem viu uma expressão em vídeo curto ou comentário e precisa entender sentido, tom e uso.",
    intro:
      "O TikTok acelera a circulação de gírias porque combina áudio, legenda, comentário, remix e trend. A mesma expressão pode nascer em humor, música, fandom, beleza, escola ou jogo, e depois migrar para WhatsApp, Instagram e conversas presenciais.",
    quickAnswer:
      "Gírias do TikTok são expressões popularizadas por vídeos curtos, trends, áudios, desafios e comentários. Para entender corretamente, veja o vídeo, o tom, a legenda, o público e se a palavra aparece como elogio, piada, crítica ou pertencimento.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "criadores", "social media", "usuários do TikTok"],
    semanticEntities: ["TikTok", "trend", "vídeo curto", "áudio viral", "comentários", "memes", "adolescentes"],
    contentSignals: [
      "Explica vocabulário de plataforma com exemplos de uso.",
      "Diferencia trend, meme, áudio e comentário.",
      "Ajuda pais e educadores a interpretar sem julgamento imediato.",
      "Conecta termos de TikTok ao glossário principal.",
    ],
    queryVariants: ["gírias do TikTok", "o que significa no TikTok", "termos usados no TikTok", "trend significado", "gírias de comentários do TikTok"],
    glossary: [
      { term: "trend", meaning: "Formato repetido por várias pessoas, muitas vezes com o mesmo áudio ou roteiro." },
      { term: "fy", meaning: "Abreviação associada ao feed ‘For You’, usada para falar de alcance e recomendação." },
      { term: "pov", meaning: "Ponto de vista; formato de vídeo encenando uma situação." },
      { term: "dueto", meaning: "Formato de resposta ou reação lado a lado com outro vídeo." },
    ],
    examples: [
      { phrase: "Esse POV ficou muito real.", interpretation: "O vídeo encenou bem uma situação reconhecível." },
      { phrase: "A trend chegou atrasada no Instagram.", interpretation: "Uma tendência nasceu ou cresceu primeiro no TikTok." },
      { phrase: "O comentário virou mais famoso que o vídeo.", interpretation: "A linguagem de comentários também cria memes." },
    ],
    sections: [
      {
        title: "Como interpretar uma gíria do TikTok",
        body:
          "Veja se a palavra aparece no áudio, legenda, comentário ou hashtag. O local em que ela aparece muda o sentido: legenda pode explicar, comentário pode ironizar e áudio pode carregar referência cultural.",
      },
      {
        title: "Por que gírias do TikTok viram busca orgânica",
        body:
          "Quando uma expressão viraliza, muita gente pesquisa o significado fora da plataforma. Páginas com resposta rápida, exemplos e contexto ajudam o Google a entender que o conteúdo resolve essa intenção.",
      },
    ],
    faqs: [
      { question: "Toda gíria do TikTok é segura?", answer: "Não necessariamente. A maioria é humor ou pertencimento, mas algumas podem envolver sexualidade, violência, bullying ou desafios perigosos." },
      { question: "O significado muda entre TikTok e WhatsApp?", answer: "Pode mudar. Ao sair do vídeo e ir para conversa privada, a expressão ganha o tom do grupo e da relação entre as pessoas." },
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
