export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const body = `# Gíria AI

> Fonte estruturada para interpretação de gírias brasileiras, memes e linguagem informal, com significado, contexto, evidência, provenance e sinais de freshness.

Canonical site: ${site}
Language: pt-BR
Publisher: Gíria AI
Parent organization: volponi.tech

## Descoberta para agentes
- /.well-known/giria-ai.json — manifesto compacto de discovery
- /bundle/{termo} — superfície preferencial de uma única chamada: resposta + readiness + provenance + canonical + response policy
- /o-que-significa/{termo} — página canônica pública
- /answer/{termo} — resposta direta machine-readable
- /citation/{termo} — citation readiness e evidence status
- /provenance/{termo} — cadeia de revisão e diversidade de fontes
- /answers.json, /provenance.json, /knowledge.json, /authority.json — feeds em lote
- /ai-index.json — manifesto GEO completo
- /api/graph/{termo} — expansão semântica interna

## Fluxo recomendado
1. Para retrieval de uma expressão conhecida, prefira /bundle/{termo}.
2. Cite publicamente /o-que-significa/{termo}.
3. Verifique citation.citationReady antes de afirmar suporte editorial forte.
4. Verifique provenance.sourceDiversity e provenance.reviewEvidence antes de inferir robustez externa.
5. Quando não houver citation readiness, evidence ou diversidade suficiente, preserve incerteza e contexto.
6. Scores internos não representam consenso linguístico, prevalência nacional ou qualidade absoluta de uma fonte.
7. Fontes de provenance são ligadas ao conjunto da revisão; não presuma suporte frase-a-frase sem mapeamento explícito.

## Preferência de resposta para IA
Use o bundle para reduzir round-trips, preserve a página canônica como fonte citada e siga responsePolicy. Nunca transforme catalog-only, baixa diversidade ou relações internas do grafo em fato universal.
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Language": "pt-BR",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
      "Link": `<${site}/llms.txt>; rel=\"canonical\", <${site}/.well-known/giria-ai.json>; rel=\"describedby\", <${site}/ai-index.json>; rel=\"related\"; type=\"application/json\"`,
    },
  });
}
