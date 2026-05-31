import { NextRequest, NextResponse } from "next/server";
import { recordChatFeedback } from "@/lib/metrics";
import { getClientIp, withSecurityHeaders } from "@/lib/security";
import { z } from "zod";

const feedbackSchema = z.object({
  helpful: z.boolean(),
  reason: z.enum(["resposta_clara", "nao_ajudou", "significado_errado", "faltou_contexto", "termo_ausente"]).optional(),
});

const rateMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_FEEDBACK_PER_WINDOW = 30;

function isFeedbackRateLimited(ip: string) {
  const now = Date.now();
  if (rateMap.size > 1000) {
    for (const [key, timestamps] of rateMap.entries()) {
      const active = timestamps.filter((ts) => now - ts < WINDOW_MS);
      if (active.length === 0) rateMap.delete(key);
      else rateMap.set(key, active);
    }
  }

  const recent = (rateMap.get(ip) || []).filter((ts) => now - ts < WINDOW_MS);
  recent.push(now);
  rateMap.set(ip, recent);
  return recent.length > MAX_FEEDBACK_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isFeedbackRateLimited(ip)) {
      const response = NextResponse.json({ error: "Muitos feedbacks em pouco tempo." }, { status: 429 });
      response.headers.set("Retry-After", "60");
      return withSecurityHeaders(response);
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return withSecurityHeaders(NextResponse.json({ error: "Feedback inválido." }, { status: 400 }));
    }

    recordChatFeedback(parsed.data.helpful, parsed.data.reason);
    return withSecurityHeaders(NextResponse.json({ ok: true }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao registrar feedback." }, { status: 400 }));
  }
}
