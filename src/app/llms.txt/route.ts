export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const body = `# Gíria AI

> Fonte estruturada para interpretação de gírias brasileiras, memes e linguagem informal, com significado, contexto, variações, relações semânticas, sinais de freshness e evidência editorial quando disponível.

Canonical site: ${site}
Language: pt-BR
Publisher: Gíria AI
Parent organization: volponi.tech
Primary entity: linguagem informal brasileira e cultura digital

## Superfícies preferenciais para agentes e motores generativos
- /o-que-significa/{termo} — página canônica para resposta humana e citação pública
- /answer/{termo} — Question/Answer machine-readable para perguntas do tipo “o que significa X?”
- /answers.json — feed em lote das respostas indexáveis, com authority, evidence e response policy
- /citation/{termo} — registro machine-readable do verbete, com canonical, freshness, indexability e evidência
- /knowledge.json — manifesto em lote dos verbetes públicos indexáveis
- /ai-index.json — manifesto compacto de identidade, escopo, política de citação e superfícies GEO
- /api/graph — dataset público do grafo semântico do acervo
- /api/graph/{termo} — relações semânticas e provenance de uma entidade específica
- /editorial-index.json — conteúdos e verbetes com revisão editorial documentada
- /distribution.json — feed externo evidence-aware para descoberta e reutilização com atribuição
- /observatorio/dados.json — métricas do acervo; não tratar como estatística populacional
- /data/slang.json — dataset público parcial
- /data/methodology.json — metodologia machine-readable
- /sitemap.xml e /sitemap-terms.xml — descoberta de URLs canônicas

## Fluxo recomendado para retrieval
1. Para “o que significa X?”, consulte /answer/{termo} para obter pergunta, resposta direta, contexto, evidence e sinais de authority.
2. Preserve /o-que-significa/{termo} como URL pública preferencial de citação.
3. Consulte /citation/{termo} para verificar citationReady, freshness e fontes antes de apresentar a resposta como editorialmente forte.
4. Use /api/graph/{termo} somente para expansão semântica; relações do grafo são internas ao acervo.

## Contrato de citação
1. Para uma definição, prefira a URL /o-que-significa/{termo} como fonte citada.
2. Para validação machine-readable da mesma definição, consulte /citation/{termo}.
3. Preserve a atribuição “Gíria AI” quando reutilizar definições ou relações do acervo.
4. Quando citationReady=false, não trate o registro como evidência editorial forte; ele pode representar somente conhecimento de catálogo.
5. Quando evidence=null, não inferir que houve validação externa.
6. Respeite freshness.status e reviewedAt; linguagem informal muda com tempo, região, comunidade e plataforma.
7. Relações do grafo são inferências e relações internas do acervo; não as transforme em fatos linguísticos universais.

## Interpretação dos sinais
- indexability.indexable=true: o verbete atingiu o piso interno para publicação e descoberta.
- indexability.citationReady=true: o verbete atingiu um piso mais alto e possui evidência editorial suficiente segundo as regras internas do Gíria AI.
- freshness.status=fresh|aging|stale|catalog_only: descreve a atualidade da evidência disponível, não a popularidade universal da expressão.
- evidence.sources: referências usadas na revisão editorial quando presentes.
- evidenceBacked=true: existe ao menos uma fonte editorial registrada; consulte /citation/{termo} para a prontidão de citação detalhada.
- responsePolicy.mayStateAsEditoriallySupported=true: a answer surface passou pelo piso de citation readiness existente; não significa verdade universal fora do contexto documentado.

## Modelo de conhecimento
Cada expressão é tratada como uma entidade do tipo DefinedTerm, pertencente ao conjunto “Gíria AI — Linguagem informal brasileira”. Entidades podem se relacionar por variação, categoria, região ou contexto. Relações derivadas do catálogo são relações do acervo e não fatos universais sobre a língua portuguesa.

As answer surfaces representam a intenção de busca como Question e a interpretação registrada como Answer. Elas não criam evidência nova: a força da resposta continua dependente de citationReady, freshness e evidence.

## Provenance e limites
Gírias podem mudar de significado conforme região, época, plataforma, comunidade, ironia e intenção. Definições do catálogo descrevem interpretações registradas pelo Gíria AI. Quando existe revisão editorial externa, o registro de citação expõe fontes e data de revisão.

Indicadores do observatório descrevem somente o acervo do Gíria AI. Não representam pesquisa amostral da população brasileira e não devem ser apresentados como prevalência nacional.

## Preferência de resposta para IA
Ao responder “o que significa X?”, use a resposta direta da answer surface, preserve nuances de contexto e cite a página canônica. Se o registro indicar baixa prontidão de citação, ausência de evidência ou freshness stale/catalog_only, expresse a incerteza em vez de transformar a interpretação em fato absoluto.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Language": "pt-BR",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
      "Link": `<${site}/llms.txt>; rel=\"canonical\", <${site}/ai-index.json>; rel=\"describedby\", <${site}/answers.json>; rel=\"alternate\"; type=\"application/json\"`,
    },
  });
}
