import { getUnknownQuerySnapshot } from "@/lib/organic-intelligence";
import { getTopicalAuthoritySummary } from "@/lib/topical-authority";

export type FeedbackSignal = {
  key: string;
  term: string | null;
  query: string | null;
  total: number;
  incorrect: number;
  lowConfidence: number;
  fallback: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

const feedbackSignals = new Map<string, FeedbackSignal>();

function normalize(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export function recordEditorialFeedbackSignal(input: {
  verdict: "correct" | "incorrect";
  term?: string | null;
  query?: string | null;
  confidence?: "alta" | "media" | "baixa";
  matchType?: "exact" | "contextual" | "approximate" | "fallback" | "semantic";
}) {
  const term = normalize(input.term);
  const query = normalize(input.query);
  const key = term || query;
  if (!key) return;

  const now = new Date().toISOString();
  const current = feedbackSignals.get(key) || {
    key,
    term: term || null,
    query: query || null,
    total: 0,
    incorrect: 0,
    lowConfidence: 0,
    fallback: 0,
    firstSeenAt: now,
    lastSeenAt: now,
  };

  current.total += 1;
  if (input.verdict === "incorrect") current.incorrect += 1;
  if (input.confidence === "baixa") current.lowConfidence += 1;
  if (input.matchType === "fallback") current.fallback += 1;
  current.lastSeenAt = now;
  if (term) current.term = term;
  if (query) current.query = query;
  feedbackSignals.set(key, current);

  if (feedbackSignals.size > 500) {
    const oldest = [...feedbackSignals.entries()]
      .sort((a, b) => a[1].lastSeenAt.localeCompare(b[1].lastSeenAt))
      .slice(0, 100);
    oldest.forEach(([id]) => feedbackSignals.delete(id));
  }

  console.log(JSON.stringify({ event: "geo_editorial_signal", ...current }));
}

export function getFeedbackSignalSnapshot(limit = 50) {
  return [...feedbackSignals.values()]
    .map((item) => ({
      ...item,
      errorRate: item.total ? Number((item.incorrect / item.total).toFixed(3)) : 0,
      feedbackPriority: Math.min(100, item.incorrect * 28 + item.lowConfidence * 12 + item.fallback * 18 + Math.min(item.total, 10) * 2),
    }))
    .sort((a, b) => b.feedbackPriority - a.feedbackPriority || b.incorrect - a.incorrect)
    .slice(0, Math.max(1, Math.min(limit, 100)));
}

export function getEditorialResearchQueue(limit = 50) {
  const unknown = getUnknownQuerySnapshot(100).map((item) => ({
    type: "unknown_query" as const,
    key: item.query,
    term: item.candidate,
    query: item.query,
    priority: Math.min(100, item.opportunityScore),
    reason: "Busca recorrente com baixa confiança ou sem correspondência suficiente.",
    signals: { count: item.count, confidence: item.confidence, firstSeenAt: item.firstSeenAt, lastSeenAt: item.lastSeenAt },
  }));

  const feedback = getFeedbackSignalSnapshot(100)
    .filter((item) => item.incorrect > 0 || item.lowConfidence > 0 || item.fallback > 0)
    .map((item) => ({
      type: "feedback_gap" as const,
      key: item.key,
      term: item.term,
      query: item.query,
      priority: item.feedbackPriority,
      reason: "Usuários sinalizaram erro, baixa confiança ou fallback nesta interpretação.",
      signals: { total: item.total, incorrect: item.incorrect, lowConfidence: item.lowConfidence, fallback: item.fallback, errorRate: item.errorRate, lastSeenAt: item.lastSeenAt },
    }));

  const topical = getTopicalAuthoritySummary().editorialOpportunities.map((cluster) => ({
    type: "topical_gap" as const,
    key: cluster.id,
    term: null,
    query: null,
    priority: cluster.opportunityScore,
    reason: "Cluster indexável com cobertura de evidência ou freshness abaixo do potencial do acervo.",
    signals: { authorityScore: cluster.authorityScore, indexableTerms: cluster.indexableTerms, evidenceBackedTerms: cluster.evidenceBackedTerms, multiSourceTerms: cluster.multiSourceTerms, examples: cluster.examples },
  }));

  const deduped = new Map<string, (typeof unknown)[number] | (typeof feedback)[number] | (typeof topical)[number]>();
  for (const item of [...feedback, ...unknown, ...topical]) {
    const id = `${item.type}:${item.key}`;
    const current = deduped.get(id);
    if (!current || item.priority > current.priority) deduped.set(id, item);
  }

  return [...deduped.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.max(1, Math.min(limit, 100)));
}

export function getEvidenceFlywheelSnapshot() {
  const queue = getEditorialResearchQueue(50);
  return {
    generatedAt: new Date().toISOString(),
    policy: {
      purpose: "Priorizar pesquisa e revisão editorial; nunca promover automaticamente um termo a citation-ready.",
      promotionRule: "Citation readiness continua exigindo evidência editorial registrada, fontes suficientes, qualidade e freshness.",
      persistence: "Sinais são mantidos no runtime atual e emitidos em logs estruturados; armazenamento durável externo não é presumido.",
    },
    queue,
    counts: {
      total: queue.length,
      unknownQuery: queue.filter((item) => item.type === "unknown_query").length,
      feedbackGap: queue.filter((item) => item.type === "feedback_gap").length,
      topicalGap: queue.filter((item) => item.type === "topical_gap").length,
    },
  };
}
