import { getTerm } from "@/lib/slang-data";
import { db } from "@/lib/db";
import { sanitizeUserInput } from "@/lib/security";
import nodemailer from "nodemailer";

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

const bannedPatterns = [/^.{0,2}$/i, /(.)\1{5,}/i, /\b(test|asdf|1234|kkkk|lol)\b/i, /[^\p{L}\p{N}\s.,!?@+\-_/()]/giu];
const blockedTerms = /\b(idiota|otario|otário|racista|nazista|fdp|vsf|caralho|porra)\b/i;

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

  const combined = `${term} ${meaning} ${context}`;
  if (bannedPatterns.some((p) => p.test(combined)) || blockedTerms.test(combined)) {
    return { ok: false as const, reason: "Conteúdo inválido ou ofensivo detectado." };
  }

  if (!/^\+?[1-9]\d{9,14}$/.test(submitterWhatsapp.replace(/\D/g, ""))) {
    return { ok: false as const, reason: "WhatsApp inválido. Use DDI + DDD + número." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
    return { ok: false as const, reason: "Email inválido." };
  }

  return { ok: true as const, normalized: { term, meaning, context, submitterName, submitterWhatsapp, submitterEmail } };
}

export async function webSignalScore(term: string): Promise<number> {
  const q = encodeURIComponent(`gíria brasileira ${term} significado`);
  const res = await fetch(`https://duckduckgo.com/html/?q=${q}`, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return 0;
  const html = (await res.text()).toLowerCase();

  const termHits = (html.match(new RegExp(term.toLowerCase(), "g")) || []).length;
  const socialHits = (html.match(/tiktok|instagram|x.com|twitter|youtube|funk/gi) || []).length;

  let score = 0;
  if (termHits >= 3) score += 0.5;
  else if (termHits >= 1) score += 0.25;
  if (socialHits >= 2) score += 0.3;
  if (/gíria|dicionário|significado/.test(html)) score += 0.2;

  return Math.min(1, score);
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
  await transporter.sendMail({
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
  });
}

export async function listApprovedSuggestions(limit = 100) {
  try {
    const rows = await db.validatedSlang.findMany({ where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: limit });
    return rows.map((r) => ({ ...r, evidence: JSON.parse(r.evidence || "[]"), createdAt: r.createdAt.toISOString() }));
  } catch {
    return memorySuggestions.filter((x) => x.status === "approved").slice().reverse().slice(0, limit);
  }
}

export async function processSuggestion(input: SuggestionInput) {
  const webScore = await webSignalScore(input.term);
  const llmEval = await localLlmEvaluate(input);
  const adjustedMeaning = llmEval.adjustedMeaning || input.meaning;
  const totalScore = Math.min(1, webScore + 0.2 + llmEval.confidenceBoost);
  const status: ValidationStatus = totalScore >= 0.7 ? "approved" : "pending";

  return { adjustedMeaning, totalScore, status, evidence: [`web:${webScore.toFixed(2)}`, `llm:${llmEval.confidenceBoost.toFixed(2)}`] };
}

export async function isSuggestionEligible(termRaw: string) {
  const term = sanitizeUserInput(termRaw.toLowerCase(), 80);
  if (!term) return { ok: false as const, reason: "Gíria inválida." };
  if (getTerm(term)) return { ok: false as const, reason: "Essa gíria já existe no glossário principal." };

  const vowels = (term.match(/[aeiouáàâãéêíóôõú]/gi) || []).length;
  if (term.length > 3 && vowels === 0) return { ok: false as const, reason: "Termo suspeito: sem estrutura linguística válida." };

  try {
    const existing = await db.validatedSlang.findFirst({ where: { term: { equals: term, mode: "insensitive" }, status: { in: ["approved", "pending"] } }, select: { id: true } });
    if (existing) return { ok: false as const, reason: "Essa gíria já foi enviada." };
  } catch {}

  return { ok: true as const, term };
}
