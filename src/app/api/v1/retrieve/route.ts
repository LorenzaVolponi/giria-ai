import { NextResponse } from "next/server";
import { z } from "zod";
import { retrieveSlang } from "@/lib/retrieval-v2";

const schema = z.object({ query: z.string().trim().min(2).max(300), limit: z.number().int().min(1).max(10).optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Consulta inválida." }, { status: 400 });
  const results = retrieveSlang(parsed.data.query, parsed.data.limit || 5);
  return NextResponse.json({ query: parsed.data.query, results, retrievalVersion: "2" }, { headers: { "cache-control": "no-store" } });
}
