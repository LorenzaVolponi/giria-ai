export const PIX_KEY = "007aibr@gmail.com";
export const PIX_RECEIVER_NAME = "Lorenza Volponi";

export const SUPPORT_AMOUNTS = [5, 10, 25, 50];

export const SUPPORT_CAMPAIGN = {
  title: "Mutirão Gíria AI livre",
  period: "Junho/2026",
  goal: 1200,
  current: 365,
  supporters: 41,
  description: "Meta simbólica para manter servidor, revisão editorial, páginas SEO e monitoramento de novas gírias no ar.",
};

export const SUPPORT_TIERS = [
  {
    amount: 5,
    name: "Café do deploy",
    description: "Ajuda a manter uma rodada de revisão e pequenas correções no ar.",
  },
  {
    amount: 10,
    name: "Radar ligado",
    description: "Fortalece o radar semanal de gírias, memes e termos regionais.",
  },
  {
    amount: 25,
    name: "Guardião do glossário",
    description: "Ajuda a revisar páginas de significado e melhorar contexto para pais e educadores.",
  },
  {
    amount: 50,
    name: "Patrono raiz",
    description: "Mantém infraestrutura, SEO programático e conteúdo gratuito para a comunidade.",
  },
];

export const SUPPORT_MURAL = [
  { name: "Comunidade do corre", badge: "Fundadores", message: "Mantendo o glossário vivo." },
  { name: "Pais curiosos", badge: "Educação", message: "Pra entender antes de julgar." },
  { name: "Professores aliados", badge: "Sala de aula", message: "Linguagem jovem com contexto." },
  { name: "Anônimos brabos", badge: "PIX ninja", message: "Pequenos apoios, impacto gigante." },
];

export const IMPACT_METRICS = [
  { label: "páginas indexáveis", value: "+2.000", detail: "significados, ranking e radar" },
  { label: "apoios este mês", value: `${SUPPORT_CAMPAIGN.supporters}`, detail: "meta pública e transparente" },
  { label: "uso gratuito", value: "100%", detail: "sem paywall para consultar" },
];

export function getSupportProgress() {
  const percent = Math.min(100, Math.round((SUPPORT_CAMPAIGN.current / SUPPORT_CAMPAIGN.goal) * 100));
  return {
    ...SUPPORT_CAMPAIGN,
    percent,
    remaining: Math.max(0, SUPPORT_CAMPAIGN.goal - SUPPORT_CAMPAIGN.current),
  };
}
