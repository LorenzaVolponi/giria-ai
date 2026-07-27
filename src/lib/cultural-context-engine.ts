import type { RiskLevel, SlangTerm } from "./slang-data";

export type PlatformSignal =
  | "tiktok"
  | "instagram"
  | "discord"
  | "whatsapp"
  | "gaming"
  | "school"
  | "general";

export type ToneSignal =
  | "positive"
  | "playful"
  | "ironic"
  | "provocative"
  | "concerned"
  | "neutral";

export type GenerationSignal = "gen_alpha" | "gen_z" | "mixed" | "unknown";

export type RelationshipSignal =
  | "parent_child"
  | "educator_student"
  | "peer"
  | "partner"
  | "unknown";

export type CulturalContext = {
  platform: PlatformSignal;
  tone: ToneSignal;
  generation: GenerationSignal;
  relationship: RelationshipSignal;
  risk: RiskLevel;
  confidence: number;
  signals: string[];
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function inferPlatform(text: string): PlatformSignal {
  if (hasAny(text, ["tiktok", "for you", "fyp", "trend", "video curto"])) return "tiktok";
  if (hasAny(text, ["instagram", "reels", "story", "direct", "dm"])) return "instagram";
  if (hasAny(text, ["discord", "servidor", "call", "voice chat"])) return "discord";
  if (hasAny(text, ["whatsapp", "grupo da familia", "zap", "status"])) return "whatsapp";
  if (hasAny(text, ["roblox", "fortnite", "valorant", "minecraft", "partida", "ranked", "game", "jogo"])) return "gaming";
  if (hasAny(text, ["escola", "sala", "professor", "colega", "recreio", "aluno"])) return "school";
  return "general";
}

function inferTone(text: string): ToneSignal {
  if (hasAny(text, ["kkkk", "kkk", "rsrs", "zoeira", "brincadeira", "meme"])) return "playful";
  if (hasAny(text, ["ironia", "sarcasmo", "jantou", "deboche"])) return "ironic";
  if (hasAny(text, ["ofensa", "humilhou", "bullying", "ameaça", "ameaca", "xingou", "provocou"])) return "provocative";
  if (hasAny(text, ["preocupado", "preocupada", "devo me preocupar", "risco", "perigoso", "estranho"])) return "concerned";
  if (hasAny(text, ["elogio", "bom", "positivo", "admiravel", "admiração", "admiracao"])) return "positive";
  return "neutral";
}

function inferGeneration(text: string): GenerationSignal {
  if (hasAny(text, ["gen alpha", "geracao alpha", "six seven", "67", "sigma", "skibidi", "brainrot"])) return "gen_alpha";
  if (hasAny(text, ["gen z", "geracao z", "cringe", "delulu", "rizz", "aura", "cooked"])) return "gen_z";
  if (hasAny(text, ["adolescente", "jovem", "internet", "meme"])) return "mixed";
  return "unknown";
}

function inferRelationship(text: string): RelationshipSignal {
  if (hasAny(text, ["meu filho", "minha filha", "meus filhos", "minhas filhas", "pai", "mae", "mãe"])) return "parent_child";
  if (hasAny(text, ["meu aluno", "minha aluna", "professor", "educador", "escola"])) return "educator_student";
  if (hasAny(text, ["namorado", "namorada", "marido", "esposa", "parceiro", "parceira"])) return "partner";
  if (hasAny(text, ["amigo", "amiga", "colega", "grupo"])) return "peer";
  return "unknown";
}

function maxRisk(terms: SlangTerm[]): RiskLevel {
  const order: Record<RiskLevel, number> = { green: 0, yellow: 1, orange: 2, red: 3 };
  return terms.reduce<RiskLevel>((highest, term) =>
    order[term.riskLevel] > order[highest] ? term.riskLevel : highest,
  "green");
}

export function analyzeCulturalContext(message: string, terms: SlangTerm[]): CulturalContext {
  const text = normalize(message);
  const platform = inferPlatform(text);
  const tone = inferTone(text);
  const generation = inferGeneration(text);
  const relationship = inferRelationship(text);
  const risk = maxRisk(terms);

  const signals = [
    platform !== "general" ? `plataforma:${platform}` : null,
    tone !== "neutral" ? `tom:${tone}` : null,
    generation !== "unknown" ? `geracao:${generation}` : null,
    relationship !== "unknown" ? `relacao:${relationship}` : null,
    terms.length > 0 ? `termos:${terms.length}` : null,
  ].filter((signal): signal is string => Boolean(signal));

  const confidence = Math.min(0.96, 0.46 + signals.length * 0.1 + Math.min(terms.length, 3) * 0.08);

  return {
    platform,
    tone,
    generation,
    relationship,
    risk,
    confidence: Number(confidence.toFixed(2)),
    signals,
  };
}

function contextLead(context: CulturalContext): string {
  if (context.tone === "concerned") return "Entendo por que isso chamou sua atenção.";
  if (context.tone === "playful") return "Pelo jeito, isso veio em tom de brincadeira.";
  if (context.tone === "ironic") return "Aqui o tom parece mais irônico do que literal.";
  if (context.tone === "provocative") return "Isso pode ser provocação, então o contexto importa bastante.";
  if (context.tone === "positive") return "A leitura mais provável é positiva.";
  return "A leitura mais provável é esta:";
}

function audienceTip(context: CulturalContext): string {
  if (context.relationship === "parent_child") {
    return "Uma boa resposta seria perguntar com leveza: _“Vocês usam isso como elogio ou zoeira?”_";
  }
  if (context.relationship === "educator_student") {
    return "Em sala, vale perguntar como o grupo usa a expressão antes de corrigir ou repreender.";
  }
  if (context.relationship === "partner") {
    return "Entre parceiros, confirme o tom antes de interpretar como crítica ou ofensa.";
  }
  return "Para ter certeza, vale perguntar onde a expressão apareceu e com que tom foi dita.";
}

function platformLabel(platform: PlatformSignal): string | null {
  const labels: Record<PlatformSignal, string> = {
    tiktok: "TikTok",
    instagram: "Instagram",
    discord: "Discord",
    whatsapp: "WhatsApp",
    gaming: "jogos e comunidades gamer",
    school: "ambiente escolar",
    general: "",
  };
  return labels[platform] || null;
}

export function formatConciergeTermResponse(term: SlangTerm, context: CulturalContext): string {
  const platform = platformLabel(context.platform);
  const riskCopy: Record<RiskLevel, string> = {
    green: "Não vejo sinal de alerta por padrão.",
    yellow: "O tom pode mudar a interpretação, então vale confirmar o contexto.",
    orange: "Há espaço para provocação, humilhação ou conflito; observe como foi usado.",
    red: "O conteúdo merece atenção cuidadosa e conversa direta, sem confronto.",
  };

  const originLine = term.origin ? `\n\n**De onde vem:** ${term.origin}` : "";
  const platformLine = platform ? `\n\nÉ comum em **${platform}** e conversas online.` : "";
  const exampleLine = term.safeExample ? `\n\n**Exemplo:** _“${term.safeExample}”_` : "";

  return `${contextLead(context)}

**“${term.term}”** quer dizer, em português direto: **${term.adultTranslation}**

${term.meaning}

**Nesse contexto:** ${term.context}${platformLine}

**Nível de atenção:** ${riskCopy[term.riskLevel]}${exampleLine}${originLine}

**Como lidar:** ${audienceTip(context)}`;
}

export function formatConciergeMultiTermResponse(terms: SlangTerm[], context: CulturalContext): string {
  const summary = terms
    .slice(0, 4)
    .map((term) => `- **${term.term}** — ${term.adultTranslation}`)
    .join("\n");

  return `${contextLead(context)}

Encontrei **${terms.length} expressões** relevantes na frase:

${summary}

No conjunto, a mensagem parece ter tom **${context.tone === "playful" ? "de brincadeira" : context.tone === "ironic" ? "irônico" : context.tone === "provocative" ? "provocativo" : "informal"}**.

**Como responder:** ${audienceTip(context)}`;
}
