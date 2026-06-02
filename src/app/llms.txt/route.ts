import { getRankingTerms } from "@/lib/growth";

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const terms = getRankingTerms(20)
    .map((term) => `- ${term.term}: ${site}/o-que-significa/${encodeURIComponent(term.term)} — ${term.meaning}`)
    .join("\n");

  const body = `# Gíria AI

Gíria AI é um tradutor e glossário de gírias brasileiras, memes e linguagem jovem com foco educativo para pais, professores, jovens e criadores.

## Páginas principais
- Início: ${site}/
- Glossário: ${site}/girias
- Radar: ${site}/radar
- Ranking: ${site}/ranking
- Apoie: ${site}/apoie
- Guias para pais: ${site}/guias/pais
- Guias para professores: ${site}/guias/professores
- Guias para criadores: ${site}/guias/criadores

## Termos populares
${terms}

## Uso recomendado
Use as páginas de significado para entender contexto, risco, exemplos e variações. Gírias isoladas não devem ser tratadas como diagnóstico de comportamento.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
