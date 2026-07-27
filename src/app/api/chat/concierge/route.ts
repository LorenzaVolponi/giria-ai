import { NextRequest, NextResponse } from "next/server";
import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";
import {
  analyzeCulturalContext,
  formatConciergeMultiTermResponse,
  formatConciergeTermResponse,
} from "@/lib/cultural-context-engine";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 24;
const rateLimitMap = new Map<string, number[]>();

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”‘’'\".,;:!?()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitMap.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

let termIndex: Map<string, SlangTerm> | null = null;

function getTermIndex(): Map<string, SlangTerm> {
  if (termIndex) return termIndex;
  termIndex = new Map<string, SlangTerm>();

  for (const term of SLANG_DATA) {
    const candidates = [term.term, ...(Array.isArray(term.variations) ? term.variations : [])];
    for (const candidate of candidates) {
      const key = normalize(candidate);
      if (key && !termIndex.has(key)) termIndex.set(key, term);
    }
  }

  return termIndex;
}

function findTerms(message: string): SlangTerm[] {
  const normalized = normalize(message);
  const words = normalized.split(" ").filter(Boolean);
  const index = getTermIndex();
  const found = new Map<string, SlangTerm>();

  for (let size = Math.min(6, words.length); size >= 1; size -= 1) {
    for (let start = 0; start <= words.length - size; start += 1) {
      const candidate = words.slice(start, start + size).join(" ");
      const term = index.get(candidate);
      if (term) found.set(normalize(term.term), term);
    }
  }

  if (found.size === 0) {
    for (const [key, term] of index.entries()) {
      if (key.length >= 4 && normalized.includes(key)) found.set(normalize(term.term), term);
      if (found.size >= 4) break;
    }
  }

  return Array.from(found.values()).slice(0, 5);
}

function lastRelevantTerms(history: Array<{ role: string; content: string }>): SlangTerm[] {
  for (const item of [...history].reverse()) {
    const terms = findTerms(item.content);
    if (terms.length > 0) return terms;
  }
  return [];
}

function contextualFallback(message: string): string {
  const normalized = normalize(message);

  if (/^(oi|ola|eai|bom dia|boa tarde|boa noite)/.test(normalized)) {
    return "Oi! Me conte a frase completa — quem falou, onde apareceu e o que estava acontecendo. Assim eu consigo separar significado, tom e intenção.";
  }

  if (/(ironia|brincadeira|zoeira|ofensa|provocacao)/.test(normalized)) {
    return "Consigo ajudar, mas preciso da frase exata. **A mesma expressão pode ser elogio, zoeira ou provocação dependendo do tom e da relação entre as pessoas.**\n\nCole aqui a mensagem completa e, se souber, diga onde apareceu: escola, TikTok, WhatsApp, Discord ou jogo.";
  }

  return "Ainda não encontrei essa expressão com confiança suficiente na base. Não quero inventar um significado.\n\nMe envie **a frase completa**, onde ela apareceu e, se possível, a idade aproximada de quem falou. Com esses sinais eu consigo testar variações e interpretar o contexto com mais segurança.";
}

function suggestionsFor(terms: SlangTerm[]): string[] {
  if (terms.length === 0) {
    return [
      "Isso parece brincadeira ou ofensa?",
      "Como eu respondo sem parecer perdido?",
      "Pode ter outro significado?",
    ];
  }

  const highestRisk = terms.some((term) => term.riskLevel === "red" || term.riskLevel === "orange");
  return highestRisk
    ? ["Quais sinais merecem atenção?", "Como abordar sem confronto?", "Pode ser só meme?"]
    : ["Como eu posso responder?", "Isso muda conforme a plataforma?", "É comum entre qual geração?"];
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return withSecurityHeaders(NextResponse.json(
        { error: "Muitas mensagens em pouco tempo. Aguarde um instante." },
        { status: 429 },
      ));
    }

    const body = await request.json() as {
      message?: string;
      history?: Array<{ role: string; content: string }>;
    };

    const message = sanitizeUserInput(body.message ?? "", MAX_MESSAGE_LENGTH);
    const history = Array.isArray(body.history)
      ? body.history
          .filter((item) => item && typeof item.role === "string" && typeof item.content === "string")
          .slice(-10)
      : [];

    if (!message) {
      return withSecurityHeaders(NextResponse.json({ error: "Mensagem obrigatória." }, { status: 400 }));
    }

    const directTerms = findTerms(message);
    const followUp = directTerms.length === 0 && /^(e |mas |isso|esse|essa|ele|ela|como|por que|porque)/.test(normalize(message));
    const terms = followUp ? lastRelevantTerms(history) : directTerms;
    const context = analyzeCulturalContext(message, terms);

    let response: string;
    if (terms.length === 1) response = formatConciergeTermResponse(terms[0], context);
    else if (terms.length > 1) response = formatConciergeMultiTermResponse(terms, context);
    else response = contextualFallback(message);

    return withSecurityHeaders(NextResponse.json({
      response,
      suggestions: suggestionsFor(terms),
      context: {
        platform: context.platform,
        tone: context.tone,
        generation: context.generation,
        relationship: context.relationship,
        risk: context.risk,
        confidence: context.confidence,
      },
      terms: terms.map((term) => term.term),
    }));
  } catch (error) {
    console.error("Concierge chat error", error);
    return withSecurityHeaders(NextResponse.json(
      { error: "Não consegui interpretar essa mensagem agora. Tente novamente." },
      { status: 500 },
    ));
  }
}
