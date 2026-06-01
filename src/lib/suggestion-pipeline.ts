import { getTerm } from "@/lib/slang-data";
import { db } from "@/lib/db";
import { sanitizeUserInput } from "@/lib/security";
import nodemailer from "nodemailer";
import { analyzeSuggestionQuality } from "@/lib/suggestion-quality";

export type SuggestionInput = {
  term: string;
  meaning: string;
  context?: string;
  submitterName: string;
  submitterWhatsapp: string;
  submitterEmail: string;
};

type ValidationStatus = "pending" | "approved" | "rejected";

const memorySuggestions: Array<SuggestionInput & { id: string; createdAt: string; score: number; status: ValidationStatus }> = [];

const bannedPatterns = [/^.{0,2}$/i, /(.)\1{5,}/i, /\b(test|asdf|1234|kkkk|lol)\b/i, /[\u0000-\u001F\u007F]/g];
const blockedTerms = /\b(idiota|otario|otário|racista|nazista|fdp|vsf|caralho|porra)\b/i;
const webScoreCache = new Map<string, { score: number; expiresAt: number }>();
const revalidateCooldown = new Map<string, number>();
const ingressByIp = new Map<string, { total: number; approved: number; rejected: number; pending: number; lastAt: number }>();

async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 150): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("retry_failed");
}

export function validateSuggestionPayload(payload: SuggestionInput) {
  const term = sanitizeUserInput(payload.term, 80).toLowerCase();
  const meaning = sanitizeUserInput(payload.meaning, 320);
  const context = sanitizeUserInput(payload.context ?? "", 320);
  const submitterName = sanitizeUserInput(payload.submitterName, 120);
  const submitterWhatsapp = sanitizeUserInput(payload.submitterWhatsapp, 40);
  const submitterEmail = sanitizeUserInput(payload.submitterEmail, 120).toLowerCase();

  if (!term || !meaning || !submitterName || !submitterWhatsapp || !submitterEmail) {
    return { ok: false as const, reason: "Campos obrigatórios ausentes." };
  }
  const lettersInTerm = (term.match(/\p{L}/gu) || []).length;
  if (lettersInTerm < 2) {
    return { ok: false as const, reason: "Gíria inválida: informe ao menos 2 letras." };
  }

  const combined = `${term} ${meaning} ${context}`;
  if (bannedPatterns.some((p) => p.test(combined)) || blockedTerms.test(combined)) {
    return { ok: false as const, reason: "Conteúdo inválido ou ofensivo detectado." };
  }

  if (!/^\d{8,15}$/.test(submitterWhatsapp.replace(/\D/g, ""))) {
    return { ok: false as const, reason: "WhatsApp inválido. Informe DDD+número (com ou sem DDI)." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
    return { ok: false as const, reason: "Email inválido." };
  }
  if (term.length > 40 || meaning.length > 280 || context.length > 280) {
    return { ok: false as const, reason: "Texto muito longo para validação automática." };
  }

  return { ok: true as const, normalized: { term, meaning, context, submitterName, submitterWhatsapp, submitterEmail } };
}

export async function webSignalScore(term: string): Promise<number> {
  const cacheKey = term.toLowerCase().trim();
  const cached = webScoreCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.score;

  const encoded = encodeURIComponent(term);
  const encodedGlossary = encodeURIComponent(`gíria brasileira ${term} significado`);
  const sources = [
    `https://duckduckgo.com/html/?q=${encodedGlossary}`,
    `https://duckduckgo.com/html/?q=${encodeURIComponent(`${term} tiktok gíria`)}`,
    `https://lite.duckduckgo.com/lite/?q=${encodedGlossary}`,
    `https://www.bing.com/search?q=${encodedGlossary}`,
    `https://www.bing.com/search?q=${encodeURIComponent(`${term} significado`)}`,
    `https://search.brave.com/search?q=${encodedGlossary}`,
    `https://www.google.com/search?q=${encodeURIComponent(`o que significa ${term}`)}`,
    `https://www.youtube.com/results?search_query=${encoded}`,
    `https://www.tiktok.com/search?q=${encoded}`,
  ];
  const requestHeaders = {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
  };
  const htmlBlocks = await Promise.all(
    sources.map(async (url) => {
      const res = await retry(async () => fetch(url, { cache: "no-store", headers: requestHeaders }), 2, 120).catch(() => null);
      if (!res?.ok) return "";
      return (await res.text()).toLowerCase();
    }),
  );
  const html = htmlBlocks.join("\n");
  if (!html.trim()) return 0;

  const escapedTerm = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const termHits = (html.match(new RegExp(escapedTerm, "g")) || []).length;
  const socialHits = (html.match(/tiktok|instagram|x.com|twitter|youtube|funk|kwai|threads|discord|reddit/gi) || []).length;
  const glossaryHits = (html.match(/gíria|giria|dicionário|dicionario|significado|expressão|explicação|definição|definicao/gi) || []).length;
  const qaHits = (html.match(/o que significa|what does|meaning of|como usar|exemplo/gi) || []).length;
  const ptBrHits = (html.match(/pt-br|brasil|brasileir|português|portugues/gi) || []).length;
  const resultsDiversity = htmlBlocks.filter((b) => b.includes(term.toLowerCase())).length;

  let score = 0;
  if (termHits >= 3) score += 0.35; // encontrado na internet
  if (socialHits >= 2) score += 0.2; // contexto social
  if (glossaryHits >= 2) score += 0.2; // padrão linguístico
  if (qaHits >= 2) score += 0.15; // presença em páginas explicativas
  if (ptBrHits >= 2) score += 0.05; // aderência BR/PT
  if (resultsDiversity >= 3) score += 0.05; // diversidade de origem
  const finalScore = Math.min(1, score);
  webScoreCache.set(cacheKey, { score: finalScore, expiresAt: Date.now() + 6 * 60 * 60_000 });
  return finalScore;
}

async function localLlmEvaluate(input: SuggestionInput): Promise<{ adjustedMeaning: string; confidenceBoost: number }> {
  const endpoint = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";
  const model = process.env.OLLAMA_MODEL || "mistral";

  const prompt = `Avalie a gíria brasileira e melhore o significado de forma objetiva. Responda JSON com keys adjustedMeaning e confidenceBoost (0-0.2). Gíria: ${input.term}; Significado: ${input.meaning}; Contexto: ${input.context ?? ""}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, format: "json" }),
  }).catch(() => null);

  if (!res?.ok) return { adjustedMeaning: input.meaning, confidenceBoost: 0 };
  const data = (await res.json().catch(() => ({}))) as { response?: string };
  const parsed = (() => {
    try {
      return JSON.parse(data.response || "{}");
    } catch {
      return {};
    }
  })() as { adjustedMeaning?: string; confidenceBoost?: number };
  const adjustedMeaning = sanitizeUserInput(parsed.adjustedMeaning || input.meaning, 320);
  const confidenceBoost = Math.max(0, Math.min(0.2, Number(parsed.confidenceBoost) || 0));
  return { adjustedMeaning, confidenceBoost };
}

export async function saveValidatedSlang(input: SuggestionInput & { score: number; status: ValidationStatus; evidence: string[] }) {
  try {
    const saved = await db.validatedSlang.create({
      data: { ...input, evidence: JSON.stringify(input.evidence) },
    });
    return { id: saved.id, createdAt: saved.createdAt.toISOString() };
  } catch {
    const id = `mem_${Date.now()}`;
    const createdAt = new Date().toISOString();
    memorySuggestions.push({ ...input, id, createdAt });
    return { id, createdAt };
  }
}

export async function notifyLeadEmail(input: SuggestionInput & { score: number; status: ValidationStatus; contextCategory: string }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  if (!host || !user || !pass || !from) return;

  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  await retry(
    async () =>
      transporter.sendMail({
        from,
        to: "007aibr@gmail.com",
        subject: "📨 Novo Lead - Sugestão de Gíria",
        text: [
          "📨 Novo Lead - Sugestão de Gíria",
          "",
          `Gíria: ${input.term}`,
          `Significado: ${input.meaning}`,
          `Contexto: ${input.contextCategory}`,
          "",
          "👤 Submitter Info:",
          `Nome: ${input.submitterName}`,
          `WhatsApp: ${input.submitterWhatsapp}`,
          `Email: ${input.submitterEmail}`,
          "",
          `Status de Validação: ${input.status}`,
          `Confiança: ${Math.round(input.score * 100)}%`,
        ].join("\n"),
      }),
    2,
    200,
  );
}

export async function listApprovedSuggestions(limit = 100) {
  try {
    const rows = await db.validatedSlang.findMany({ where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: limit });
    return rows.map((r) => ({ ...r, evidence: JSON.parse(r.evidence || "[]"), createdAt: r.createdAt.toISOString() }));
  } catch {
    return memorySuggestions.filter((x) => x.status === "approved").slice().reverse().slice(0, limit);
  }
}


export async function listSuggestionsByStatus(status: ValidationStatus | "all" = "all", limit = 100) {
  try {
    const rows = await db.validatedSlang.findMany({
      where: status === "all" ? undefined : { status },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r) => ({ ...r, evidence: JSON.parse(r.evidence || "[]"), createdAt: r.createdAt.toISOString() }));
  } catch {
    const base = status === "all" ? memorySuggestions : memorySuggestions.filter((x) => x.status === status);
    return base.slice().reverse().slice(0, limit);
  }
}

export async function getSuggestionStatusCounts() {
  try {
    const [pending, approved, rejected] = await Promise.all([
      db.validatedSlang.count({ where: { status: "pending" } }),
      db.validatedSlang.count({ where: { status: "approved" } }),
      db.validatedSlang.count({ where: { status: "rejected" } }),
    ]);
    return { pending, approved, rejected, all: pending + approved + rejected };
  } catch {
    const pending = memorySuggestions.filter((x) => x.status === "pending").length;
    const approved = memorySuggestions.filter((x) => x.status === "approved").length;
    const rejected = memorySuggestions.filter((x) => x.status === "rejected").length;
    return { pending, approved, rejected, all: pending + approved + rejected };
  }
}


export async function getSuggestionWindowCounts() {
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  try {
    const [dApproved, dRejected, wApproved, wRejected] = await Promise.all([
      db.validatedSlang.count({ where: { status: "approved", createdAt: { gte: dayAgo } } }),
      db.validatedSlang.count({ where: { status: "rejected", createdAt: { gte: dayAgo } } }),
      db.validatedSlang.count({ where: { status: "approved", createdAt: { gte: weekAgo } } }),
      db.validatedSlang.count({ where: { status: "rejected", createdAt: { gte: weekAgo } } }),
    ]);
    return { dApproved, dRejected, wApproved, wRejected };
  } catch {
    const daily = memorySuggestions.filter((x) => Date.parse(x.createdAt) >= dayAgo.getTime());
    const weekly = memorySuggestions.filter((x) => Date.parse(x.createdAt) >= weekAgo.getTime());
    return {
      dApproved: daily.filter((x) => x.status === "approved").length,
      dRejected: daily.filter((x) => x.status === "rejected").length,
      wApproved: weekly.filter((x) => x.status === "approved").length,
      wRejected: weekly.filter((x) => x.status === "rejected").length,
    };
  }
}

export async function getSuggestionById(id: string) {
  const safeId = sanitizeUserInput(id, 80);
  if (!safeId) return null;
  try {
    const row = await db.validatedSlang.findUnique({ where: { id: safeId } });
    if (!row) return null;
    return { ...row, evidence: JSON.parse(row.evidence || "[]"), createdAt: row.createdAt.toISOString() };
  } catch {
    return memorySuggestions.find((x) => x.id === safeId) || null;
  }
}

export function parseModerationEvidence(evidence: string[]) {
  return evidence
    .filter((x) => x.startsWith("mod:"))
    .map((entry) => {
      const parts = entry.split(":");
      const status = parts[1] || "";
      const actor = parts[2] || "admin";
      const at = parts[3] || "";
      const reason = parts.slice(4).join(":");
      return { status, actor, at, reason };
    })
    .filter((x) => x.status && x.at);
}

export function trackSuggestionIngress(ip: string, status: "approved" | "rejected" | "pending") {
  const key = sanitizeUserInput(ip, 80) || "unknown";
  const current = ingressByIp.get(key) || { total: 0, approved: 0, rejected: 0, pending: 0, lastAt: 0 };
  current.total += 1;
  current[status] += 1;
  current.lastAt = Date.now();
  ingressByIp.set(key, current);
}

export function listIngressIpMetrics(limit = 15) {
  return Array.from(ingressByIp.entries())
    .map(([ip, stats]) => ({ ip, ...stats }))
    .sort((a, b) => b.total - a.total || b.lastAt - a.lastAt)
    .slice(0, limit);
}

export async function moderateSuggestionStatus(
  id: string,
  status: Exclude<ValidationStatus, "pending">,
  moderation?: { actor?: string; reason?: string },
) {
  const safeId = sanitizeUserInput(id, 80);
  if (!safeId) throw new Error("ID inválido");
  const actor = sanitizeUserInput(moderation?.actor || "admin", 80);
  const reason = sanitizeUserInput(moderation?.reason || "", 180);
  const event = `mod:${status}:${actor}:${new Date().toISOString()}${reason ? `:${reason}` : ""}`;
  try {
    const current = await db.validatedSlang.findUnique({ where: { id: safeId }, select: { evidence: true } });
    const evidence = JSON.stringify([...(JSON.parse(current?.evidence || "[]") as string[]), event].slice(-30));
    const updated = await db.validatedSlang.update({ where: { id: safeId }, data: { status, evidence } });
    if (status === "approved") {
      await autoPromoteApprovedSlang({
        term: updated.term,
        meaning: updated.meaning,
        context: updated.context,
        submitterName: updated.submitterName,
        submitterWhatsapp: updated.submitterWhatsapp,
        submitterEmail: updated.submitterEmail,
        status: "approved",
      });
    }
    return updated;
  } catch {
    const idx = memorySuggestions.findIndex((x) => x.id === safeId);
    if (idx === -1) throw new Error("Sugestão não encontrada");
    memorySuggestions[idx] = { ...memorySuggestions[idx], status };
    return memorySuggestions[idx];
  }
}

export async function autoPromoteApprovedSlang(input: SuggestionInput & { meaning: string; status: ValidationStatus }) {
  if (input.status !== "approved") return { promoted: false as const };
  try {
    const existing = await db.translation.findFirst({
      where: { slang: { equals: input.term, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) return { promoted: false as const, reason: "already_exists" as const };

    await db.translation.create({
      data: {
        slang: input.term,
        translation: input.meaning,
        context: input.context || "geral",
        category: "user-validated",
        example: `Sugestão validada enviada por ${input.submitterName}`,
      },
    });
    return { promoted: true as const };
  } catch {
    return { promoted: false as const, reason: "db_unavailable" as const };
  }
}

export async function processSuggestion(input: SuggestionInput) {
  const webScore = await webSignalScore(input.term);
  const llmEval = await localLlmEvaluate(input);
  const adjustedMeaning = llmEval.adjustedMeaning || input.meaning;
  const totalScore = Math.min(1, webScore + 0.45 + llmEval.confidenceBoost);
  const quality = analyzeSuggestionQuality({ ...input, meaning: adjustedMeaning }, totalScore);
  const status: ValidationStatus = quality.recommendation === "approve" ? "approved" : quality.recommendation === "reject" ? "rejected" : "pending";

  return {
    adjustedMeaning,
    totalScore,
    status,
    evidence: [
      `web:${webScore.toFixed(2)}`,
      `llm:${llmEval.confidenceBoost.toFixed(2)}`,
      `quality:${quality.recommendation}:${quality.confidence.toFixed(2)}`,
      ...quality.blockers.map((item) => `blocker:${item}`),
    ].slice(0, 12),
  };
}

export async function revalidatePendingSuggestions(limit = 40) {
  const rows = await db.validatedSlang.findMany({ where: { status: "pending" }, take: limit, orderBy: { createdAt: "desc" } });
  const prioritized = rows
    .filter((row) => (revalidateCooldown.get(row.id) || 0) < Date.now())
    .sort((a, b) => Math.abs(0.72 - a.score) - Math.abs(0.72 - b.score));
  let updated = 0;
  for (const row of prioritized) {
    const webScore = await webSignalScore(row.term);
    const nextScore = Math.min(1, 0.45 + webScore);
    const nextStatus: ValidationStatus = nextScore >= 0.72 ? "approved" : nextScore < 0.25 ? "rejected" : "pending";
    if (nextStatus !== row.status || Math.abs(nextScore - row.score) >= 0.05) {
      await db.validatedSlang.update({ where: { id: row.id }, data: { score: nextScore, status: nextStatus } });
      if (nextStatus === "approved") {
        await autoPromoteApprovedSlang({
          term: row.term,
          meaning: row.meaning,
          context: row.context,
          submitterName: row.submitterName,
          submitterWhatsapp: row.submitterWhatsapp,
          submitterEmail: row.submitterEmail,
          status: "approved",
        });
      }
      updated += 1;
    }
    revalidateCooldown.set(row.id, Date.now() + 10 * 60_000);
  }
  return { scanned: prioritized.length, updated };
}

export async function isSuggestionEligible(termRaw: string) {
  const term = sanitizeUserInput(termRaw.toLowerCase(), 80);
  if (!term) return { ok: false as const, reason: "Gíria inválida." };
  if (getTerm(term)) return { ok: false as const, reason: "Essa gíria já existe no glossário principal." };

  const vowels = (term.match(/[aeiouáàâãéêíóôõú]/gi) || []).length;
  const consonants = (term.match(/[bcdfghjklmnpqrstvwxyzç]/gi) || []).length;
  if (term.length > 3 && vowels === 0) return { ok: false as const, reason: "Termo suspeito: sem estrutura linguística válida." };
  if (term.length >= 6 && consonants > vowels * 4) return { ok: false as const, reason: "Termo suspeito: padrão de escrita artificial." };

  try {
    const existing = await db.validatedSlang.findFirst({ where: { term: { equals: term, mode: "insensitive" }, status: { in: ["approved", "pending"] } }, select: { id: true } });
    if (existing) return { ok: false as const, reason: "Essa gíria já foi enviada." };
  } catch {}

  return { ok: true as const, term };
}
