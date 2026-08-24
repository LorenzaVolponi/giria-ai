import { NextRequest, NextResponse } from "next/server";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";
import { getTerm, RISK_CONFIG, searchTerms } from "@/lib/slang-data";
import { translateSlang } from "@/lib/translator";
import { analyzeContext } from "@/lib/context-intelligence";
import { getRequestId, logApiEvent } from "@/lib/observability";
import { isRateLimited } from "@/lib/rate-limit";
import { z } from "zod";

const translateSchema = z.object({
  text: z.string().trim().min(1).max(220).optional(),
  slang: z.string().trim().min(1).max(220).optional(),
});

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const TRANSLATE_RATE_LIMIT_MAX = 25;
const TRANSLATE_RATE_LIMIT_WINDOW_SEC = 60;

export function buildCorsPreflight(req: NextRequest): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return withSecurityHeaders(res);
}

export async function handleTranslatePost(request: NextRequest, route = "/api/translate") {
  const startedAt = Date.now();
  const requestId = getRequestId(request);

  try {
    const ip = getClientIp(request);
    const rate = await isRateLimited(`translate:${ip}`, TRANSLATE_RATE_LIMIT_MAX, TRANSLATE_RATE_LIMIT_WINDOW_SEC);
    if (rate.limited) {
      const limitedResponse = withSecurityHeaders(NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 }));
      limitedResponse.headers.set("Retry-After", String(TRANSLATE_RATE_LIMIT_WINDOW_SEC));
      limitedResponse.headers.set("X-RateLimit-Remaining", String(rate.remaining));
      limitedResponse.headers.set("x-request-id", requestId);
      logApiEvent({ requestId, route, status: 429, durationMs: Date.now() - startedAt, message: "rate_limited" });
      return limitedResponse;
    }

    const rawBody = await request.json().catch(() => ({}));
    const parsed = translateSchema.safeParse(rawBody);
    const body = parsed.success ? parsed.data : {};
    const text = sanitizeUserInput(body.text ?? body.slang ?? "", 220);
    if (!text) {
      const badRequest = withSecurityHeaders(NextResponse.json({ error: "Envie um texto/gíria válido para tradução." }, { status: 400 }));
      badRequest.headers.set("x-request-id", requestId);
      logApiEvent({ requestId, route, status: 400, durationMs: Date.now() - startedAt, message: "empty_input" });
      return badRequest;
    }

    const result = translateSlang(text);
    const exactTerm = getTerm(result.normalized);
    const searchedTerm = searchTerms(result.normalized)[0] ?? null;
    const intelligence = analyzeContext(text, exactTerm ?? searchedTerm);
    const nearestTerm = intelligence.detectedTerm;
    const riskLevel = nearestTerm?.riskLevel ?? "green";
    const matchType = exactTerm ? "exact" : nearestTerm ? (intelligence.confidence === "alta" ? "contextual" : "approximate") : "fallback";

    const response = NextResponse.json({
      ...result,
      term: nearestTerm?.term ?? result.normalized,
      meaning: nearestTerm?.meaning ?? result.traducaoFormal,
      adultTranslation: nearestTerm?.adultTranslation ?? result.traducaoFormal,
      contextualMeaning: intelligence.contextualMeaning,
      context: nearestTerm?.context ?? result.explicacaoContextual,
      contextNotes: nearestTerm?.contextNotes ?? result.intencaoSocialEmocional,
      category: nearestTerm?.category ?? "outros",
      riskLevel,
      riskLabel: RISK_CONFIG[riskLevel].label,
      safeExample: nearestTerm?.safeExample ?? "",
      origin: nearestTerm?.origin ?? "Cultura digital brasileira",
      region: nearestTerm?.region ?? "Brasil / internet",
      variations: nearestTerm?.variations ?? [],
      popularityStatus: nearestTerm?.popularityStatus ?? "em_queda",
      relatedTerms: nearestTerm
        ? searchTerms(nearestTerm.term)
            .filter((item) => item.term !== nearestTerm.term)
            .slice(0, 5)
            .map((item) => ({ term: item.term, meaning: item.meaning, category: item.category }))
        : [],
      matchType,
      intelligence: {
        confidence: intelligence.confidence,
        confidenceScore: intelligence.confidenceScore,
        tone: intelligence.tone,
        intent: intelligence.intent,
        platform: intelligence.platform,
        ambiguity: intelligence.ambiguity,
        clarificationQuestion: intelligence.clarificationQuestion,
      },
    });
    const origin = request.headers.get("origin") || "";
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("x-request-id", requestId);
    response.headers.set("X-RateLimit-Remaining", String(rate.remaining));
    const secured = withSecurityHeaders(response);
    logApiEvent({
      requestId,
      route,
      status: 200,
      durationMs: Date.now() - startedAt,
      fallbackUsed: !nearestTerm || intelligence.confidence === "baixa",
      message: `confidence:${intelligence.confidence};match:${matchType}`,
    });
    return secured;
  } catch {
    const errorResponse = withSecurityHeaders(NextResponse.json({ error: "Não foi possível processar a tradução agora." }, { status: 500 }));
    errorResponse.headers.set("x-request-id", requestId);
    logApiEvent({ requestId, route, status: 500, durationMs: Date.now() - startedAt, message: "internal_error" });
    return errorResponse;
  }
}
