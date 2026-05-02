import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, sanitizeUserInput } from "@/lib/security";

export type SuggestionInput = {
  term: string;
  meaning?: string;
  context?: string;
  name: string;
  contact: string;
  source?: string;
};

export type SuggestionDecision = "approved_auto" | "needs_review" | "rejected";

type MemorySuggestion = SuggestionInput & {
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

  const value: SuggestionInput = { term, meaning, context, name, contact, source };
  return { ok: true, value };
}

export function evaluateSuggestion(input: SuggestionInput): { decision: SuggestionDecision; score: number; reason: string } {
  const normalized = normalizeTerm(input.term);

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

export async function notifySuggestionByEmail(suggestion: MemorySuggestion) {
  const to = process.env.GITHUB_OWNER_EMAIL;
  if (!to) return { sent: false, reason: "missing_recipient" };

  // Placeholder for provider integration (Resend/SES/SendGrid).
  console.info("[suggestion-email]", {
    to,
    subject: `Nova sugestão: ${suggestion.term}`,
    suggestion,
  });

  return { sent: true };
}
