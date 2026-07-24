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
  "gírias adolescentes",
  "dicionário de gírias para pais",
  "gírias geração Alpha",
  "gírias do WhatsApp",
  "gírias do Instagram",
  "gírias de escola",
  "gírias gamer",
  "gírias de funk",
  "gírias do Nordeste",
  "gírias do Sul",
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

  {
    slug: "girias-adolescentes",
    title: "Gírias adolescentes: guia para entender jovens sem julgamento",
    shortTitle: "Gírias adolescentes",
    description:
      "Guia completo sobre gírias adolescentes, com significado, exemplos seguros, variações de busca e contexto de uso em linguagem adolescente, escola, grupos de amigos e redes sociais.",
    primaryKeyword: "gírias adolescentes",
    keywords: [
      "gírias adolescentes",
      "significado de gírias adolescentes",
      "tradutor de gírias adolescentes",
      "exemplos de gírias adolescentes",
      "dicionário de gírias adolescentes",
      "gírias adolescentes brasileiras",
    ],
    intent: "Ajudar pais e educadores interpretarem conversas jovens com contexto e acolhimento.",
    intro:
      "Este guia organiza gírias adolescentes por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em linguagem adolescente, escola, grupos de amigos e redes sociais.",
    quickAnswer:
      "Gírias adolescentes são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias adolescentes", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias adolescentes",
      "gírias adolescentes exemplos",
      "lista de gírias adolescentes",
      "gírias adolescentes para pais",
      "gírias adolescentes na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias adolescentes têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "dicionario-de-girias-para-pais",
    title: "Dicionário de gírias para pais: significado, contexto e sinais de atenção",
    shortTitle: "Dicionário para pais",
    description:
      "Guia completo sobre dicionário de gírias para pais, com significado, exemplos seguros, variações de busca e contexto de uso em conversas familiares, escola, celular e internet.",
    primaryKeyword: "dicionário de gírias para pais",
    keywords: [
      "dicionário de gírias para pais",
      "significado de dicionário de gírias para pais",
      "tradutor de dicionário de gírias para pais",
      "exemplos de dicionário de gírias para pais",
      "dicionário de dicionário de gírias para pais",
      "dicionário de gírias para pais brasileiras",
    ],
    intent: "Ajudar responsáveis entenderem termos sem invadir privacidade nem reagir com pânico.",
    intro:
      "Este guia organiza dicionário de gírias para pais por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em conversas familiares, escola, celular e internet.",
    quickAnswer:
      "Dicionário para pais são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["dicionário de gírias para pais", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa dicionário de gírias para pais",
      "dicionário de gírias para pais exemplos",
      "lista de dicionário de gírias para pais",
      "dicionário de gírias para pais para pais",
      "dicionário de gírias para pais na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Dicionário para pais têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-geracao-z",
    title: "Gírias da geração Z: expressões, memes e códigos sociais",
    shortTitle: "Gírias geração Z",
    description:
      "Guia completo sobre gírias geração Z, com significado, exemplos seguros, variações de busca e contexto de uso em memes, estética digital, humor irônico e pertencimento.",
    primaryKeyword: "gírias geração Z",
    keywords: [
      "gírias geração Z",
      "significado de gírias geração Z",
      "tradutor de gírias geração Z",
      "exemplos de gírias geração Z",
      "dicionário de gírias geração Z",
      "gírias geração Z brasileiras",
    ],
    intent: "Ajudar explicar o vocabulário de jovens adultos e adolescentes nascidos em cultura online.",
    intro:
      "Este guia organiza gírias geração Z por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em memes, estética digital, humor irônico e pertencimento.",
    quickAnswer:
      "Gírias geração Z são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias geração Z", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias geração Z",
      "gírias geração Z exemplos",
      "lista de gírias geração Z",
      "gírias geração Z para pais",
      "gírias geração Z na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias geração Z têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-geracao-alpha",
    title: "Gírias da geração Alpha: linguagem de crianças e pré-adolescentes online",
    shortTitle: "Gírias geração Alpha",
    description:
      "Guia completo sobre gírias geração Alpha, com significado, exemplos seguros, variações de busca e contexto de uso em Roblox, YouTube, shorts, escola e memes de criança.",
    primaryKeyword: "gírias geração Alpha",
    keywords: [
      "gírias geração Alpha",
      "significado de gírias geração Alpha",
      "tradutor de gírias geração Alpha",
      "exemplos de gírias geração Alpha",
      "dicionário de gírias geração Alpha",
      "gírias geração Alpha brasileiras",
    ],
    intent: "Ajudar ajudar adultos a acompanhar expressões de crianças conectadas com segurança.",
    intro:
      "Este guia organiza gírias geração Alpha por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em Roblox, YouTube, shorts, escola e memes de criança.",
    quickAnswer:
      "Gírias geração Alpha são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias geração Alpha", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias geração Alpha",
      "gírias geração Alpha exemplos",
      "lista de gírias geração Alpha",
      "gírias geração Alpha para pais",
      "gírias geração Alpha na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias geração Alpha têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-do-whatsapp",
    title: "Gírias do WhatsApp: abreviações, grupo da escola e mensagens rápidas",
    shortTitle: "Gírias do WhatsApp",
    description:
      "Guia completo sobre gírias do WhatsApp, com significado, exemplos seguros, variações de busca e contexto de uso em mensagens curtas, áudio, grupos, família e escola.",
    primaryKeyword: "gírias do WhatsApp",
    keywords: [
      "gírias do WhatsApp",
      "significado de gírias do WhatsApp",
      "tradutor de gírias do WhatsApp",
      "exemplos de gírias do WhatsApp",
      "dicionário de gírias do WhatsApp",
      "gírias do WhatsApp brasileiras",
    ],
    intent: "Ajudar decifrar abreviações e expressões usadas em grupos e conversas privadas.",
    intro:
      "Este guia organiza gírias do WhatsApp por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em mensagens curtas, áudio, grupos, família e escola.",
    quickAnswer:
      "Gírias do WhatsApp são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias do WhatsApp", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias do WhatsApp",
      "gírias do WhatsApp exemplos",
      "lista de gírias do WhatsApp",
      "gírias do WhatsApp para pais",
      "gírias do WhatsApp na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias do WhatsApp têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-do-instagram",
    title: "Gírias do Instagram: stories, reels, comentários e estética digital",
    shortTitle: "Gírias do Instagram",
    description:
      "Guia completo sobre gírias do Instagram, com significado, exemplos seguros, variações de busca e contexto de uso em stories, reels, directs, comentários e linguagem visual.",
    primaryKeyword: "gírias do Instagram",
    keywords: [
      "gírias do Instagram",
      "significado de gírias do Instagram",
      "tradutor de gírias do Instagram",
      "exemplos de gírias do Instagram",
      "dicionário de gírias do Instagram",
      "gírias do Instagram brasileiras",
    ],
    intent: "Ajudar entender termos de imagem, engajamento, flerte e reputação social.",
    intro:
      "Este guia organiza gírias do Instagram por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em stories, reels, directs, comentários e linguagem visual.",
    quickAnswer:
      "Gírias do Instagram são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias do Instagram", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias do Instagram",
      "gírias do Instagram exemplos",
      "lista de gírias do Instagram",
      "gírias do Instagram para pais",
      "gírias do Instagram na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias do Instagram têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-de-escola",
    title: "Gírias de escola: expressões de sala, prova, recreio e grupos",
    shortTitle: "Gírias de escola",
    description:
      "Guia completo sobre gírias de escola, com significado, exemplos seguros, variações de busca e contexto de uso em sala de aula, prova, recreio, professores e grupos de turma.",
    primaryKeyword: "gírias de escola",
    keywords: [
      "gírias de escola",
      "significado de gírias de escola",
      "tradutor de gírias de escola",
      "exemplos de gírias de escola",
      "dicionário de gírias de escola",
      "gírias de escola brasileiras",
    ],
    intent: "Ajudar mapear linguagem estudantil sem transformar toda brincadeira em alerta.",
    intro:
      "Este guia organiza gírias de escola por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em sala de aula, prova, recreio, professores e grupos de turma.",
    quickAnswer:
      "Gírias de escola são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias de escola", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias de escola",
      "gírias de escola exemplos",
      "lista de gírias de escola",
      "gírias de escola para pais",
      "gírias de escola na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias de escola têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-gamer",
    title: "Gírias gamer: termos de jogos, call, rank e comunidades online",
    shortTitle: "Gírias gamer",
    description:
      "Guia completo sobre gírias gamer, com significado, exemplos seguros, variações de busca e contexto de uso em games, Discord, call, rank, rage e competitivo.",
    primaryKeyword: "gírias gamer",
    keywords: [
      "gírias gamer",
      "significado de gírias gamer",
      "tradutor de gírias gamer",
      "exemplos de gírias gamer",
      "dicionário de gírias gamer",
      "gírias gamer brasileiras",
    ],
    intent: "Ajudar traduzir vocabulário de jogos para pais, educadores e iniciantes.",
    intro:
      "Este guia organiza gírias gamer por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em games, Discord, call, rank, rage e competitivo.",
    quickAnswer:
      "Gírias gamer são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias gamer", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias gamer",
      "gírias gamer exemplos",
      "lista de gírias gamer",
      "gírias gamer para pais",
      "gírias gamer na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias gamer têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-de-funk",
    title: "Gírias de funk: baile, música, estética e linguagem urbana",
    shortTitle: "Gírias de funk",
    description:
      "Guia completo sobre gírias de funk, com significado, exemplos seguros, variações de busca e contexto de uso em música, dança, baile, redes sociais e cultura urbana.",
    primaryKeyword: "gírias de funk",
    keywords: [
      "gírias de funk",
      "significado de gírias de funk",
      "tradutor de gírias de funk",
      "exemplos de gírias de funk",
      "dicionário de gírias de funk",
      "gírias de funk brasileiras",
    ],
    intent: "Ajudar explicar termos musicais e urbanos com cuidado de contexto.",
    intro:
      "Este guia organiza gírias de funk por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em música, dança, baile, redes sociais e cultura urbana.",
    quickAnswer:
      "Gírias de funk são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias de funk", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias de funk",
      "gírias de funk exemplos",
      "lista de gírias de funk",
      "gírias de funk para pais",
      "gírias de funk na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias de funk têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-do-nordeste",
    title: "Gírias do Nordeste: expressões regionais, memes e fala local",
    shortTitle: "Gírias do Nordeste",
    description:
      "Guia completo sobre gírias do Nordeste, com significado, exemplos seguros, variações de busca e contexto de uso em Bahia, Pernambuco, Ceará, Paraíba, memes regionais e fala cotidiana.",
    primaryKeyword: "gírias do Nordeste",
    keywords: [
      "gírias do Nordeste",
      "significado de gírias do Nordeste",
      "tradutor de gírias do Nordeste",
      "exemplos de gírias do Nordeste",
      "dicionário de gírias do Nordeste",
      "gírias do Nordeste brasileiras",
    ],
    intent: "Ajudar fortalecer busca regional ampla com respeito às variações locais.",
    intro:
      "Este guia organiza gírias do Nordeste por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em Bahia, Pernambuco, Ceará, Paraíba, memes regionais e fala cotidiana.",
    quickAnswer:
      "Gírias do Nordeste são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias do Nordeste", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias do Nordeste",
      "gírias do Nordeste exemplos",
      "lista de gírias do Nordeste",
      "gírias do Nordeste para pais",
      "gírias do Nordeste na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias do Nordeste têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },

  {
    slug: "girias-do-sul",
    title: "Gírias do Sul: expressões gaúchas, paranaenses e catarinenses",
    shortTitle: "Gírias do Sul",
    description:
      "Guia completo sobre gírias do Sul, com significado, exemplos seguros, variações de busca e contexto de uso em Rio Grande do Sul, Paraná, Santa Catarina e regionalismos.",
    primaryKeyword: "gírias do Sul",
    keywords: [
      "gírias do Sul",
      "significado de gírias do Sul",
      "tradutor de gírias do Sul",
      "exemplos de gírias do Sul",
      "dicionário de gírias do Sul",
      "gírias do Sul brasileiras",
    ],
    intent: "Ajudar conectar regionalismos do Sul ao glossário nacional de gírias.",
    intro:
      "Este guia organiza gírias do Sul por intenção real de busca: significado rápido, exemplo seguro, tom social, possíveis ambiguidades e relação com cultura digital brasileira. O objetivo é responder de forma direta e útil para pessoas que encontraram uma expressão em Rio Grande do Sul, Paraná, Santa Catarina e regionalismos.",
    quickAnswer:
      "Gírias do Sul são expressões informais que ganham sentido pelo contexto, pela região, pela plataforma e pelo tom da conversa. Antes de interpretar como problema, veja se aparece como piada, elogio, ironia, pertencimento, alerta ou conflito.",
    updatedAt: "2026-07-24",
    audience: ["pais", "educadores", "adolescentes", "curiosos", "criadores de conteúdo"],
    semanticEntities: ["gírias do Sul", "gírias brasileiras", "linguagem jovem", "memes", "redes sociais", "cultura digital", "regionalismos"],
    contentSignals: [
      "Responde a intenção de busca com explicação curta e exemplos.",
      "Inclui variações semânticas para cobrir pesquisas naturais sem keyword stuffing.",
      "Orienta pais e educadores a interpretar contexto antes de reagir.",
      "Conecta a página temática ao glossário principal e a termos relacionados.",
    ],
    queryVariants: [
      "o que significa gírias do Sul",
      "gírias do Sul exemplos",
      "lista de gírias do Sul",
      "gírias do Sul para pais",
      "gírias do Sul na internet",
    ],
    glossary: [
      { term: "contexto", meaning: "Situação em que a gíria aparece; muda o sentido da palavra." },
      { term: "tom", meaning: "Intenção emocional da frase: piada, elogio, ironia, crítica ou alerta." },
      { term: "variação", meaning: "Forma alternativa de escrever ou adaptar a expressão por região ou plataforma." },
      { term: "sinal de atenção", meaning: "Quando a palavra aparece junto de ameaça, humilhação, golpe, pressão ou sofrimento." },
    ],
    examples: [
      { phrase: "Vi essa expressão em uma conversa e não entendi o tom.", interpretation: "A busca pede tradução, mas também contexto social." },
      { phrase: "No grupo parece brincadeira, mas fora dele pode soar diferente.", interpretation: "A mesma gíria muda conforme público e relação." },
      { phrase: "Quero conversar sem parecer que estou acusando.", interpretation: "A resposta deve ajudar diálogo seguro e não confronto." },
    ],
    sections: [
      {
        title: "Como usar este guia de forma prática",
        body:
          "Comece pela resposta rápida, depois veja exemplos e sinais de atenção. Se a gíria envolver conflito, exposição ou risco, prefira perguntar com calma o que a pessoa quis dizer em vez de assumir o pior.",
      },
      {
        title: "Por que este tema ajuda na busca orgânica",
        body:
          "A página atende buscas específicas de significado, lista, exemplos e orientação. Essa estrutura aumenta cobertura semântica e cria conteúdo útil para pessoas, não apenas repetição de palavra-chave.",
      },
    ],
    faqs: [
      { question: "Gírias do Sul têm sempre o mesmo significado?", answer: "Não. O significado muda por região, plataforma, grupo social, tom e momento da conversa." },
      { question: "Como conversar sobre uma gíria que preocupa?", answer: "Pergunte com curiosidade, peça contexto e evite acusação inicial. Se houver risco real, priorize segurança e acolhimento." },
    ],
  },
];

export function getSeoKeywordCluster(slug: string): SeoKeywordCluster | undefined {
  return SEO_KEYWORD_CLUSTERS.find((cluster) => cluster.slug === slug);
}

export function getSeoKeywordClusterSlugs(): string[] {
  return SEO_KEYWORD_CLUSTERS.map((cluster) => cluster.slug);
}
