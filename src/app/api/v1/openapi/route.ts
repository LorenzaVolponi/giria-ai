import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: { title: "Gíria AI Public Intelligence API", version: "1.0.0", description: "Inteligência contextual sobre linguagem informal brasileira." },
    paths: {
      "/api/v1/intelligence": {
        get: {
          summary: "Lista, busca ou consulta termos",
          parameters: [
            { name: "term", in: "query", schema: { type: "string" }, description: "Termo ou variação exata" },
            { name: "q", in: "query", schema: { type: "string" }, description: "Descrição semântica" },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 20 } },
            { name: "cursor", in: "query", schema: { type: "integer", minimum: 0 } },
          ],
          responses: { "200": { description: "Resultado de inteligência" }, "400": { description: "Consulta inválida" }, "404": { description: "Termo não encontrado" } },
        },
      },
    },
  }, { headers: { "cache-control": "public, max-age=300, s-maxage=3600" } });
}
