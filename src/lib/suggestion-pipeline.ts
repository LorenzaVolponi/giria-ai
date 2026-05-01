import { db } from "@/lib/db";
import { sanitizeUserInput } from "@/lib/security";
import nodemailer from "nodemailer";

export type SuggestionInput = {
  term: string;
  meaning: string;
  context?: string;
  name: string;
  contact: string;
};

const memorySuggestions: Array<SuggestionInput & { id: string; createdAt: string; score: number }> = [];

const bannedPatterns = [/^.{0,2}$/i, /(.)\1{5,}/i, /\b(test|asdf|1234|kkkk|lol)\b/i];

export function validateSuggestionPayload(payload: SuggestionInput) {
  const term = sanitizeUserInput(payload.term, 80);
  const meaning = sanitizeUserInput(payload.meaning, 320);
  const context = sanitizeUserInput(payload.context ?? "", 320);
  const name = sanitizeUserInput(payload.name, 120);
  const contact = sanitizeUserInput(payload.contact, 160);

  if (!term || !meaning || !name || !contact) {
    return { ok: false as const, reason: "Campos obrigatórios ausentes." };
  }

  const combined = `${term} ${meaning} ${context}`;
  if (bannedPatterns.some((p) => p.test(combined))) {
    return { ok: false as const, reason: "Conteúdo inválido ou sem contexto útil." };
  }

  if (!/@|\+?\d{8,}/.test(contact)) {
    return { ok: false as const, reason: "Contato inválido. Informe e-mail ou telefone." };
  }

  return { ok: true as const, normalized: { term, meaning, context, name, contact } };
}

export async function webSignalScore(term: string): Promise<number> {
  const q = encodeURIComponent(`gíria ${term}`);
  const res = await fetch(`https://duckduckgo.com/html/?q=${q}`, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return 0;
  const html = (await res.text()).toLowerCase();
  const hits = (html.match(new RegExp(term.toLowerCase(), "g")) || []).length;
  if (hits >= 8) return 1;
  if (hits >= 3) return 0.6;
  if (hits >= 1) return 0.3;
  return 0;
}

export async function saveApprovedSuggestion(input: SuggestionInput & { score: number }) {
  try {
    const saved = await db.slangSuggestion.create({
      data: {
        term: input.term,
        meaning: input.meaning,
        context: input.context || "",
        submitterName: input.name,
        submitterContact: input.contact,
        autoScore: input.score,
        status: "approved",
      },
    });
    return { id: saved.id, createdAt: saved.createdAt.toISOString() };
  } catch {
    const id = `mem_${Date.now()}`;
    const createdAt = new Date().toISOString();
    memorySuggestions.push({ ...input, id, createdAt });
    return { id, createdAt };
  }
}

export async function notifyLeadEmail(input: SuggestionInput & { score: number }) {
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
    subject: "LEAD GÍRIA AI, COM AS INFORMAÇÕES DO CONTATO",
    text: [
      `Nome: ${input.name}`,
      `Contato: ${input.contact}`,
      `Gíria: ${input.term}`,
      `Significado: ${input.meaning}`,
      `Contexto: ${input.context || "(vazio)"}`,
      `Score automação: ${input.score}`,
    ].join("\n"),
  });
}


export async function listApprovedSuggestions(limit = 100) {
  try {
    const rows = await db.slangSuggestion.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        term: true,
        meaning: true,
        context: true,
        submitterName: true,
        autoScore: true,
        createdAt: true,
      },
    });

    return rows.map((r) => ({
      id: r.id,
      term: r.term,
      meaning: r.meaning,
      context: r.context,
      submitterName: r.submitterName,
      score: r.autoScore,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return memorySuggestions
      .slice()
      .reverse()
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        term: r.term,
        meaning: r.meaning,
        context: r.context || "",
        submitterName: r.name,
        score: r.score,
        createdAt: r.createdAt,
      }));
  }
}
