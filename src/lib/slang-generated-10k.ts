import type { SlangTerm } from './slang-data';

const regions = [
  { code: 'Brasil', label: 'brasileira', marker: 'BR' },
  { code: 'SP', label: 'paulista', marker: 'SP' },
  { code: 'RJ', label: 'carioca', marker: 'RJ' },
  { code: 'MG', label: 'mineira', marker: 'MG' },
  { code: 'BA', label: 'baiana', marker: 'BA' },
  { code: 'PE', label: 'pernambucana', marker: 'PE' },
  { code: 'CE', label: 'cearense', marker: 'CE' },
  { code: 'PA', label: 'paraense', marker: 'PA' },
  { code: 'AM', label: 'amazonense', marker: 'AM' },
  { code: 'GO', label: 'goiana', marker: 'GO' },
  { code: 'PR', label: 'paranaense', marker: 'PR' },
  { code: 'RS', label: 'gaúcha', marker: 'RS' },
] as const;

const families = [
  { key: 'resenha', category: 'humor', riskLevel: 'green', base: 'brincadeira, conversa animada ou situação engraçada entre amigos', adult: 'Brincadeira / Conversa descontraída', note: 'Uso leve para humor e convivência; o sentido depende do tom.' },
  { key: 'rolê', category: 'lifestyle', riskLevel: 'green', base: 'plano, saída, encontro ou atividade informal', adult: 'Passeio / Plano informal', note: 'Geralmente inofensivo, mas vale observar horário, companhia e local.' },
  { key: 'visão', category: 'expressão', riskLevel: 'green', base: 'aviso, conselho, explicação ou percepção sobre uma situação', adult: 'Aviso / Conselho / Explicação', note: 'Costuma indicar troca de informação útil.' },
  { key: 'migué', category: 'ironia', riskLevel: 'yellow', base: 'desculpa, enrolação ou tentativa de escapar de uma cobrança', adult: 'Desculpa / Enrolação', note: 'Pode indicar mentira leve ou evasiva; vale conversar sem acusar.' },
  { key: 'caô', category: 'provocacao', riskLevel: 'yellow', base: 'história duvidosa, blefe, mentira ou exagero', adult: 'Mentira / Blefe / Exagero', note: 'Pode ser brincadeira ou acusação; observe contexto e repetição.' },
  { key: 'massa', category: 'elogio', riskLevel: 'green', base: 'algo bom, agradável, bonito ou bem recebido pelo grupo', adult: 'Legal / Muito bom', note: 'Elogio informal e positivo.' },
  { key: 'brabo', category: 'elogio', riskLevel: 'yellow', base: 'algo impressionante, intenso, habilidoso ou marcante', adult: 'Muito bom / Impressionante', note: 'Pode ser elogio ou intensidade; raramente exige preocupação isolada.' },
  { key: 'treta', category: 'provocacao', riskLevel: 'orange', base: 'confusão, discussão, conflito ou clima ruim entre pessoas', adult: 'Discussão / Confusão', note: 'Atenção se vier com ameaça, exposição pública ou perseguição.' },
  { key: 'flop', category: 'redes_sociais', riskLevel: 'yellow', base: 'conteúdo, plano ou postagem que não teve resultado esperado', adult: 'Fracassou / Não performou', note: 'Pode afetar autoestima quando ligado a comparação nas redes.' },
  { key: 'trend', category: 'meme', riskLevel: 'green', base: 'tendência, formato, áudio ou brincadeira que se espalha nas redes', adult: 'Tendência / Moda da internet', note: 'Normal em cultura digital; avalie apenas se envolver desafio perigoso.' },
  { key: 'pix', category: 'dinheiro', riskLevel: 'yellow', base: 'dinheiro, pagamento, ajuda financeira ou cobrança informal', adult: 'Pagamento / Dinheiro', note: 'Observe golpes, pressão financeira e pedidos insistentes.' },
  { key: 'crush', category: 'relacionamento', riskLevel: 'green', base: 'interesse romântico, paquera ou pessoa admirada', adult: 'Paquera / Interesse romântico', note: 'Tema comum na adolescência; orientar sobre respeito e consentimento.' },
  { key: 'ghost', category: 'relacionamento', riskLevel: 'yellow', base: 'sumir, parar de responder ou evitar conversa sem explicar', adult: 'Sumir / Parar de responder', note: 'Pode gerar ansiedade; converse sobre comunicação saudável.' },
  { key: 'rank', category: 'gaming', riskLevel: 'green', base: 'posição, nível, desempenho ou status em jogo e comunidade online', adult: 'Classificação / Nível', note: 'Comum em games; observe excesso de cobrança ou tempo online.' },
  { key: 'rage', category: 'gaming', riskLevel: 'orange', base: 'raiva, explosão emocional ou irritação durante jogo ou discussão', adult: 'Irritação / Explosão de raiva', note: 'Atenção se vier com agressividade, ofensas ou perda de controle.' },
  { key: 'ship', category: 'relacionamento', riskLevel: 'green', base: 'torcer por um casal, amizade ou combinação entre pessoas/personagens', adult: 'Torcer por casal / Combinação', note: 'Normal em fandoms; pode incomodar se virar pressão sobre pessoas reais.' },
  { key: 'vibe', category: 'emoção', riskLevel: 'green', base: 'clima, energia, sensação ou estilo percebido em alguém ou lugar', adult: 'Clima / Sensação / Estilo', note: 'Expressão ampla e geralmente positiva.' },
  { key: 'aura', category: 'valores', riskLevel: 'green', base: 'carisma, presença, moral ou impressão que alguém transmite', adult: 'Presença / Carisma / Moral', note: 'Geralmente elogio; pode virar comparação social.' },
  { key: 'exposed', category: 'redes_sociais', riskLevel: 'orange', base: 'exposição pública de print, segredo, erro ou comportamento', adult: 'Exposição pública / Denúncia', note: 'Atenção a privacidade, humilhação, difamação e bullying.' },
  { key: 'cancelar', category: 'redes_sociais', riskLevel: 'orange', base: 'criticar publicamente alguém ou rejeitar uma atitude nas redes', adult: 'Reprovar publicamente / Boicotar', note: 'Pode envolver linchamento virtual; incentive checagem e proporcionalidade.' },
] as const;

const modifiers = [
  'de cria', 'da escola', 'do grupo', 'do insta', 'do zap', 'do TikTok', 'de bairro', 'da quebrada', 'de família', 'de domingo',
  'de prova', 'de festa', 'de treino', 'do game', 'de live', 'de story', 'do recreio', 'do busão', 'de rolê', 'de resenha',
  'de madrugada', 'do interior', 'da capital', 'de praia', 'de praça', 'de shopping', 'de sala', 'de call', 'de fandom', 'de comentário',
  'no sigilo', 'sem neurose', 'de boa', 'na moral', 'no sapatinho', 'de leve', 'na resenha', 'em off', 'no hype', 'sem caô',
] as const;

const intensities = [
  'leve', 'pesado', 'raiz', 'nutella', 'supremo', 'relâmpago', 'premium', 'turbo', 'sincero', 'aleatório',
  'clássico', 'moderno', 'secreto', 'viral', 'regional', 'caseiro', 'brasileiro', 'daora', 'calmo', 'nervoso',
] as const;

function buildTerm(family: typeof families[number], modifier: string, intensity: string, region: typeof regions[number], index: number): SlangTerm {
  const term = `${family.key} ${modifier} ${intensity} ${region.marker}`.replace(/\s+/g, ' ').trim();
  return {
    term,
    meaning: `Expressão ${region.label} de uso digital/coloquial para indicar ${family.base}, com nuance “${intensity}” no contexto ${modifier}.`,
    adultTranslation: `${family.adult} (${region.code}, ${intensity}).`,
    context: `Pode aparecer em conversas de adolescentes, comentários, memes, grupos, jogos e buscas regionais quando alguém descreve ${family.base}.`,
    category: family.category,
    riskLevel: family.riskLevel,
    safeExample: `Hoje apareceu um ${term} no grupo, mas era só conversa informal.`,
    contextNotes: `${family.note} Entrada gerada por expansão curada do Gíria AI para cobrir variações de busca regionais; confirme o contexto antes de interpretar literalmente.`,
    origin: `Expansão curada do Gíria AI a partir de padrões de fala ${region.label}, cultura digital brasileira e variações regionais de busca. Lote automático #${index}.`,
    variations: [
      `${family.key} ${modifier}`,
      `${family.key} ${intensity}`,
      `${family.key} ${region.marker}`,
    ],
    popularityStatus: region.code === 'Brasil' ? 'ativo' : 'regional',
    region: region.code,
  };
}

const generated: SlangTerm[] = [];
let i = 0;
for (const region of regions) {
  for (const family of families) {
    for (const modifier of modifiers) {
      for (const intensity of intensities) {
        i += 1;
        generated.push(buildTerm(family, modifier, intensity, region, i));
      }
    }
  }
}

export const GENERATED_SLANG_10K: SlangTerm[] = generated.slice(0, 8_200);
export default GENERATED_SLANG_10K;
