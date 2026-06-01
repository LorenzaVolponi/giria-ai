import { CATEGORIES, RISK_CONFIG, SLANG_DATA, type RiskLevel, type SlangTerm } from "@/lib/slang-data";

const RISK_WEIGHT: Record<RiskLevel, number> = {
  green: 1,
  yellow: 2,
  orange: 3,
  red: 4,
};

export type RadarItem = {
  title: string;
  description: string;
  emoji: string;
  terms: SlangTerm[];
};

export function getRankingTerms(limit = 50): SlangTerm[] {
  return [...SLANG_DATA]
    .sort((a, b) => {
      const popularityScore = String(b.popularityStatus || "").localeCompare(String(a.popularityStatus || ""));
      if (popularityScore !== 0) return popularityScore;
      return RISK_WEIGHT[b.riskLevel] - RISK_WEIGHT[a.riskLevel] || a.term.localeCompare(b.term);
    })
    .slice(0, limit);
}

export function getRadarItems(): RadarItem[] {
  const byCategory = (category: string, limit = 8) => SLANG_DATA.filter((term) => term.category === category).slice(0, limit);
  const popular = getRankingTerms(10);
  const regional = SLANG_DATA.filter((term) => term.category === "regional" || /brasil|nordeste|sul|sudeste|norte|centro/i.test(term.region)).slice(0, 8);
  const attention = SLANG_DATA.filter((term) => term.riskLevel === "orange" || term.riskLevel === "red").slice(0, 8);

  return [
    {
      title: "Bombando no glossário",
      description: "Termos com maior potencial de busca orgânica e curiosidade.",
      emoji: "🔥",
      terms: popular,
    },
    {
      title: "TikTok, Reels e memes",
      description: "Expressões que ajudam pais e jovens a entender comentários e trends.",
      emoji: "📱",
      terms: [...byCategory("internet", 5), ...byCategory("humor", 5)].slice(0, 8),
    },
    {
      title: "Games e chats",
      description: "Vocabulário de partidas, Discord, stream e comunidades gamer.",
      emoji: "🎮",
      terms: byCategory("gaming", 8),
    },
    {
      title: "Atenção no contexto",
      description: "Gírias que pedem leitura cuidadosa antes de concluir qualquer coisa.",
      emoji: "⚠️",
      terms: attention,
    },
    {
      title: "Brasil regional",
      description: "Termos que reforçam o diferencial brasileiro e regional do projeto.",
      emoji: "🗺️",
      terms: regional,
    },
  ].filter((item) => item.terms.length > 0);
}

export function getRelatedTerms(term: SlangTerm, limit = 8): SlangTerm[] {
  const variations = new Set((term.variations || []).map((item) => item.toLowerCase()));
  return SLANG_DATA
    .filter((candidate) => candidate.term !== term.term)
    .map((candidate) => {
      let score = 0;
      if (candidate.category === term.category) score += 4;
      if (candidate.region === term.region) score += 2;
      if (candidate.riskLevel === term.riskLevel) score += 1;
      if (variations.has(candidate.term.toLowerCase())) score += 5;
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.term.localeCompare(b.candidate.term))
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function getCategoryLabel(category: string) {
  return CATEGORIES.find((item) => item.name === category)?.label || category;
}

export function getRiskLabel(risk: RiskLevel) {
  return RISK_CONFIG[risk].label;
}
