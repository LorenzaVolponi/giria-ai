import { NextResponse } from "next/server";
import { buildGeoAuditPlan } from "@/lib/geo-audit";

export async function GET() {
  return NextResponse.json({
    methodology: "Conjunto estável de perguntas sobre verbetes indexáveis para auditar menção de marca, citação canônica e aderência do significado em motores generativos.",
    engines: ["chatgpt", "gemini", "perplexity", "google_ai_overviews", "copilot"],
    prompts: buildGeoAuditPlan(25),
  }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
