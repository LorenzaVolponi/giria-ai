import { NextRequest, NextResponse } from "next/server";
import { sanitizeUserInput, withSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { slang?: string };
    if (!body?.slang || typeof body.slang !== "string") {
      return withSecurityHeaders(
        NextResponse.json({ error: 'O campo "slang" é obrigatório.' }, { status: 400 }),
      );
    }

    const input = sanitizeUserInput(body.slang.toLowerCase(), 200);
    if (!input) {
      return withSecurityHeaders(
        NextResponse.json({ error: "O termo não pode estar vazio." }, { status: 400 }),
      );
    }

    return withSecurityHeaders(
      NextResponse.json({
        term: input,
        meaning: "Use a busca da página principal para traduzir gírias.",
        context: "Todas as traduções são feitas localmente no navegador.",
        category: "outros",
      }),
    );
  } catch {
    return withSecurityHeaders(
      NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 }),
    );
  }
}
