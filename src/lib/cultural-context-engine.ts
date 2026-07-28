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

function intentLabel(context: CulturalContext): string {
  if (context.tone === "positive") return "elogio";
  if (context.tone === "playful") return "brincadeira ou zoeira leve";
  if (context.tone === "ironic") return "ironia ou deboche";
  if (context.tone === "provocative") return "provocação";
  if (context.tone === "concerned") return "uso ambíguo que merece confirmação";
  return "linguagem informal; o contexto define a intenção";
}

function audienceTip(context: CulturalContext): string {
  if (context.relationship === "parent_child") {
    return "Pergunte com leveza: _“Vocês usam isso como elogio, brincadeira ou crítica?”_";
  }
  if (context.relationship === "educator_student") {
    return "Pergunte como a turma usa a expressão antes de corrigir ou repreender.";
  }
  if (context.relationship === "partner") {
    return "Confirme o tom antes de interpretar como crítica ou ofensa.";
  }
  if (context.relationship === "peer") {
    return "Responda no mesmo nível de leveza e peça contexto se a intenção não estiver clara.";
  }
  return "Pergunte onde apareceu e com que tom foi dita antes de concluir.";
}

function naturalReply(context: CulturalContext): string {
  if (context.tone === "positive") return "_“Boa, então foi elogio 😄”_";
  if (context.tone === "playful") return "_“Tá, mas foi zoeira boa ou vocês estão me tirando?”_";
  if (context.tone === "ironic") return "_“Entendi a ironia. Só confirma o que você quis dizer.”_";
  if (context.tone === "provocative") return "_“Não entendi se foi brincadeira ou provocação. Explica melhor.”_";
  return "_“Me explica como vocês usam isso?”_";
}

function platformLabel(platform: PlatformSignal): string {
  const labels: Record<PlatformSignal, string> = {
    tiktok: "TikTok",
    instagram: "Instagram/Reels",
    discord: "Discord",
    whatsapp: "WhatsApp",
    gaming: "jogos e comunidades gamer",
    school: "ambiente escolar",
    general: "internet e conversas informais",
  };
  return labels[platform];
}

function generationLabel(generation: GenerationSignal): string {
  const labels: Record<GenerationSignal, string> = {
    gen_alpha: "Geração Alpha",
    gen_z: "Geração Z",
    mixed: "Geração Z e Alpha",
    unknown: "uso digital amplo",
  };
  return labels[generation];
}

function riskSection(level: RiskLevel): { emoji: string; label: string; explanation: string } {
  const map: Record<RiskLevel, { emoji: string; label: string; explanation: string }> = {
    green: { emoji: "🟢", label: "Baixo", explanation: "Não há sinal de alerta por padrão." },
    yellow: { emoji: "🟡", label: "Atenção ao contexto", explanation: "O tom pode mudar bastante a interpretação." },
    orange: { emoji: "🟠", label: "Cautela", explanation: "Pode envolver provocação, humilhação ou conflito." },
    red: { emoji: "🔴", label: "Sensível", explanation: "Vale conversar diretamente, com calma e sem confronto." },
  };
  return map[level];
}

function compactVariations(term: SlangTerm): string {
  const variations = Array.isArray(term.variations) ? term.variations.filter(Boolean).slice(0, 5) : [];
  return variations.length > 0 ? variations.map((variation) => `\`${variation}\``).join(" · ") : "Sem variações relevantes na base.";
}

export function formatConciergeTermResponse(term: SlangTerm, context: CulturalContext): string {
  const risk = riskSection(term.riskLevel);

  return `## ${risk.emoji} Resposta rápida

**“${term.term}”** significa: **${term.adultTranslation}**

## 🎯 O que provavelmente quiseram dizer

A leitura mais provável é **${intentLabel(context)}**.

${term.meaning}

## 🧠 Tradução para um adulto

> ${term.adultTranslation}

## 👀 Como um adolescente entende

${term.context}

## ⚠️ Existe risco?

**${risk.label}.** ${risk.explanation}

## 💬 Como responder naturalmente

${naturalReply(context)}

${audienceTip(context)}

## 📱 Onde essa expressão aparece

Mais comum em **${platformLabel(context.platform)}**, com uso associado a **${generationLabel(context.generation)}**.

${term.safeExample ? `**Exemplo realista:** _“${term.safeExample}”_` : ""}

## 🔎 Variações parecidas

${compactVariations(term)}

${term.origin ? `## 🧭 Origem

${term.origin}` : ""}`.trim();
}

export function formatConciergeMultiTermResponse(terms: SlangTerm[], context: CulturalContext): string {
  const risk = riskSection(context.risk);
  const items = terms
    .slice(0, 5)
    .map((term) => `- **${term.term}** — ${term.adultTranslation}`)
    .join("\n");

  const primary = terms[0];

  return `## ${risk.emoji} Resposta rápida

Encontrei **${terms.length} expressões**. No conjunto, a mensagem parece ter tom de **${intentLabel(context)}**.

## 🧩 Tradução por partes

${items}

## 🎯 Leitura do conjunto

A combinação sugere uma mensagem **${context.tone === "playful" ? "leve e brincalhona" : context.tone === "ironic" ? "irônica" : context.tone === "provocative" ? "provocativa" : context.tone === "positive" ? "positiva" : "informal e dependente de contexto"}**.

## ⚠️ Existe risco?

**${risk.label}.** ${risk.explanation}

## 💬 Como responder naturalmente

${naturalReply(context)}

${audienceTip(context)}

## 📱 Onde isso costuma aparecer

Em **${platformLabel(context.platform)}**, especialmente entre pessoas de **${generationLabel(context.generation)}**.

${primary?.safeExample ? `**Exemplo relacionado:** _“${primary.safeExample}”_` : ""}`.trim();
}
