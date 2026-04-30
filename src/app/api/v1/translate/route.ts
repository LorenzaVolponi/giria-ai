import { NextRequest, NextResponse } from "next/server";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";
import { translateSlang } from "@/lib/translator";

const rateMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQ = 25;

function limited(ip: string) {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter((v) => now - v < WINDOW_MS);
  arr.push(now);
  rateMap.set(ip, arr);
  return arr.length > MAX_REQ;
}

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
  try {
    const ip = getClientIp(request);
    if (limited(ip)) {
      return withSecurityHeaders(NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 }));
    }

    const body = (await request.json()) as { text?: string; slang?: string };
    const text = sanitizeUserInput(body.text ?? body.slang ?? "", 220);
    if (!text) {
      return withSecurityHeaders(NextResponse.json({ error: "Envie um texto/gíria para tradução." }, { status: 400 }));
    }

    const result = translateSlang(text);
    const response = NextResponse.json(result);
    const origin = request.headers.get("origin") || "";
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) response.headers.set("Access-Control-Allow-Origin", origin);
    return withSecurityHeaders(response);
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Não foi possível processar a tradução agora." }, { status: 500 }));
  }
}
