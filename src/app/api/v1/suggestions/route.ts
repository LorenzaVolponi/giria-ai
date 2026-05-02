import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";
import { isRateLimited } from "@/lib/rate-limit";
import { evaluateSuggestion, notifySuggestionByEmail, saveSuggestion, validateSuggestionInput } from "@/lib/suggestions";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rate = await isRateLimited(ip, 8, 60);
    if (rate.limited) {
      return withSecurityHeaders(NextResponse.json({ error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 }));
    }

    const body = await req.json();
    const validation = validateSuggestionInput(body);

    if (!validation.ok) {
      return withSecurityHeaders(NextResponse.json({ error: validation.error }, { status: 400 }));
    }

    const result = evaluateSuggestion(validation.value);
    const saved = await saveSuggestion(req, validation.value, result.decision, result.score, result.reason);

    await notifySuggestionByEmail(saved);

    if (result.decision === "rejected") {
      return withSecurityHeaders(NextResponse.json({
        accepted: false,
        decision: result.decision,
        reason: "Sugestão rejeitada por baixa qualidade ou conteúdo inválido.",
      }, { status: 422 }));
    }

    return withSecurityHeaders(NextResponse.json({
      accepted: true,
      decision: result.decision,
      score: result.score,
      message: result.decision === "approved_auto"
        ? "Sugestão recebida e aprovada automaticamente. Obrigado!"
        : "Sugestão recebida. Vamos validar e publicar se fizer sentido.",
    }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Erro ao processar sugestão." }, { status: 500 }));
  }
}
