import { NextRequest, NextResponse } from "next/server";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";
import { translateSlang } from "@/lib/translator";
import { getRequestId, logApiEvent } from "@/lib/observability";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

const translateSchema = z.object({
  text: z.string().trim().min(1).max(220).optional(),
  slang: z.string().trim().min(1).max(220).optional(),
});

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  const origin = req.headers.get("origin") || "";
  if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return withSecurityHeaders(res);
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);

  try {
    const ip = getClientIp(request);
    const rate = await isRateLimited(ip, 25, 60);
    if (rate.limited) {
      const limitedResponse = withSecurityHeaders(NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 }));
      limitedResponse.headers.set("Retry-After", "60");
      limitedResponse.headers.set("X-RateLimit-Remaining", String(rate.remaining));
      limitedResponse.headers.set("x-request-id", requestId);
      logApiEvent({ requestId, route: "/api/v1/translate", status: 429, durationMs: Date.now() - startedAt, message: "rate_limited" });
      return limitedResponse;
    }

    const rawBody = await request.json();
    const parsed = translateSchema.safeParse(rawBody);
    const body = parsed.success ? parsed.data : {};
    const text = sanitizeUserInput(body.text ?? body.slang ?? "", 220);
    if (!text) {
      const badRequest = withSecurityHeaders(NextResponse.json({ error: "Envie um texto/gíria válido para tradução." }, { status: 400 }));
      badRequest.headers.set("x-request-id", requestId);
      logApiEvent({ requestId, route: "/api/v1/translate", status: 400, durationMs: Date.now() - startedAt, message: "empty_input" });
      return badRequest;
    }

    const result = translateSlang(text);
    const response = NextResponse.json(result);
    const origin = request.headers.get("origin") || "";
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("x-request-id", requestId);
    response.headers.set("X-RateLimit-Remaining", String(rate.remaining));
    const secured = withSecurityHeaders(response);
    logApiEvent({ requestId, route: "/api/v1/translate", status: 200, durationMs: Date.now() - startedAt, fallbackUsed: result.source !== "local" });
    return secured;
  } catch {
    const errorResponse = withSecurityHeaders(NextResponse.json({ error: "Não foi possível processar a tradução agora." }, { status: 500 }));
    errorResponse.headers.set("x-request-id", requestId);
    logApiEvent({ requestId, route: "/api/v1/translate", status: 500, durationMs: Date.now() - startedAt, message: "internal_error" });
    return errorResponse;
  }
}
