import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, sanitizeUserInput } from "@/lib/security";
import { getTerm } from "@/lib/slang-data";

export type SuggestionInput = {
  term: string;
  meaning?: string;
  context?: string;
  name: string;
  contact: string;
  source?: string;
};

export type SuggestionDecision = "approved_auto" | "needs_review" | "rejected";

export type MemorySuggestion = SuggestionInput & {
  id: string;
  decision: SuggestionDecision;
  score: number;
  reason: string;
  createdAt: string;
  ipHash: string;
};

const memoryStore: MemorySuggestion[] = [];
const MAX_MEMORY_SUGGESTIONS = 2000;

const blockedPatterns = [/^test+$/i, /asdf/i, /kkkk+/i, /(.)\1{5,}/, /https?:\/\//i];

function normalizeTerm(term: string): string {
  return term.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

export function validateSuggestionInput(payload: unknown): { ok: true; value: SuggestionInput } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Payload inválido." };
  }

  const body = payload as Record<string, unknown>;
  const term = sanitizeUserInput(String(body.term ?? ""), 80).trim();
  const meaning = sanitizeUserInput(String(body.meaning ?? ""), 300).trim();
  const context = sanitizeUserInput(String(body.context ?? ""), 300).trim();
  const name = sanitizeUserInput(String(body.name ?? ""), 80).trim();
  const contact = sanitizeUserInput(String(body.contact ?? ""), 120).trim();
  const source = sanitizeUserInput(String(body.source ?? ""), 160).trim();

  if (term.length < 2) return { ok: false, error: "Informe uma gíria válida." };
  if (name.length < 2) return { ok: false, error: "Informe seu nome." };
  if (contact.length < 5) return { ok: false, error: "Informe um contato válido." };
  const contactOk = /@/.test(contact) || /\d{8,}/.test(contact.replace(/\D/g, ""));
  if (!contactOk) return { ok: false, error: "Contato deve ser e-mail ou telefone válido." };

  const value: SuggestionInput = { term, meaning, context, name, contact, source };
  return { ok: true, value };
}

export function evaluateSuggestion(input: SuggestionInput): { decision: SuggestionDecision; score: number; reason: string } {
  const normalized = normalizeTerm(input.term);

  if (getTerm(input.term)) {
    return { decision: "rejected", score: 0, reason: "Termo já existe no glossário." };
  }

  if (blockedPatterns.some((re) => re.test(input.term) || re.test(input.meaning ?? ""))) {
    return { decision: "rejected", score: 5, reason: "Conteúdo detectado como spam/inválido." };
  }

  let score = 50;
  if (input.term.includes(" ")) score += 8;
  if (input.meaning && input.meaning.length >= 12) score += 12;
  if (input.context && input.context.length >= 12) score += 10;
  if (/^[a-z0-9\sãõçáéíóúâêîôûà-]+$/i.test(normalized)) score += 10;

  if (score >= 75) return { decision: "approved_auto", score, reason: "Alta confiança automática." };
  if (score >= 55) return { decision: "needs_review", score, reason: "Requer revisão humana opcional." };
  return { decision: "rejected", score, reason: "Baixa qualidade semântica." };
}

export async function saveSuggestion(req: NextRequest, input: SuggestionInput, decision: SuggestionDecision, score: number, reason: string) {
  const createdAt = new Date().toISOString();
  const ipHash = createHash("sha256").update(getClientIp(req)).digest("hex");

  const mem: MemorySuggestion = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    decision,
    score,
    reason,
    createdAt,
    ipHash,
  };

  memoryStore.unshift(mem);
  if (memoryStore.length > MAX_MEMORY_SUGGESTIONS) memoryStore.length = MAX_MEMORY_SUGGESTIONS;

  try {
    await (db as any).suggestionEvent.create({
      data: {
        term: input.term,
        meaning: input.meaning ?? "",
        context: input.context ?? "",
        name: input.name,
        contact: input.contact,
        source: input.source ?? "",
        decision,
        score,
        reason,
        ipHash,
      },
    });
  } catch {
    // keep memory fallback
  }

  return mem;
}

export async function getRecentSuggestions(limit = 30, decision?: string) {
  try {
    const where = decision ? { decision } : undefined;
    return await (db as any).suggestionEvent.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
  } catch {
    return memoryStore
      .filter((item) => (decision ? item.decision === decision : true))
      .slice(0, limit);
  }
}

export async function notifySuggestionByEmail(suggestion: MemorySuggestion) {
  const to = process.env.GITHUB_OWNER_EMAIL;
  if (!to) return { sent: false, reason: "missing_recipient" };

  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!resendApiKey) {
    console.info("[suggestion-email:dry-run]", { to, suggestion });
    return { sent: false, reason: "missing_resend_api_key" };
  }

  const html = `
    <h2>Nova sugestão recebida</h2>
    <p><b>Termo:</b> ${suggestion.term}</p>
    <p><b>Significado:</b> ${suggestion.meaning ?? "-"}</p>
    <p><b>Contexto:</b> ${suggestion.context ?? "-"}</p>
    <p><b>Nome:</b> ${suggestion.name}</p>
    <p><b>Contato:</b> ${suggestion.contact}</p>
    <p><b>Decisão:</b> ${suggestion.decision} (score: ${suggestion.score})</p>
    <p><b>Motivo:</b> ${suggestion.reason}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Nova sugestão: ${suggestion.term}`,
      html,
    }),
  });

  if (!res.ok) {
    const payload = await res.text();
    console.error("[suggestion-email:error]", payload);
    return { sent: false, reason: "provider_error" };
  }

  return { sent: true };
}


export async function updateSuggestionDecision(id: string, decision: SuggestionDecision, reason?: string) {
  const safeReason = sanitizeUserInput(reason ?? "Decisão manual via painel admin.", 240);

  try {
    return await (db as any).suggestionEvent.update({
      where: { id },
      data: { decision, reason: safeReason },
    });
  } catch {
    const idx = memoryStore.findIndex((item) => item.id === id);
    if (idx >= 0) {
      memoryStore[idx] = {
        ...memoryStore[idx],
        decision,
        reason: safeReason,
      };
      return memoryStore[idx];
    }

    return null;
  }
}


export async function findApprovedSuggestion(term: string) {
  const normalized = normalizeTerm(term);

  try {
    const row = await (db as any).suggestionEvent.findFirst({
      where: {
        decision: "approved_auto",
        term: {
          equals: term,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (row) return row;
  } catch {
    // fallback below
  }

  return memoryStore.find((item) => item.decision === "approved_auto" && normalizeTerm(item.term) === normalized) ?? null;
}
