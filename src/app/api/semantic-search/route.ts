import { NextResponse } from "next/server";
import { semanticSearchSlang } from "@/lib/semantic-search";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (query.length < 3) return NextResponse.json({ error: "Descreva um pouco melhor o que você quer entender." }, { status: 400 });
  if (query.length > 500) return NextResponse.json({ error: "Consulta longa demais." }, { status: 400 });

  const results = semanticSearchSlang(query, 5).map(({ term, score, matchedSignals }) => ({
    term: term.term,
    meaning: term.meaning,
    adultTranslation: term.adultTranslation,
    context: term.context,
    score: Number(score.toFixed(3)),
    matchedSignals,
  }));

  return NextResponse.json({
    query,
    matchType: results.length ? "semantic" : "none",
    results,
    clarificationQuestion: results.length ? null : "Você consegue descrever onde apareceu e o que a pessoa parecia querer dizer?",
  });
}
