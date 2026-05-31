import type { Metadata } from "next";
import Link from "next/link";
import { RISK_CONFIG } from "@/lib/slang-data";
import { REGIONAL_DEEP_EXPANSION_COUNT } from "@/lib/slang-regional-deep-expansion";
import {
  REGION_CONTENT,
  REGION_ORDER,
  getAvailableRegionalStates,
  getRegionalCoverageStats,
  getRegionalOverviewCards,
  getRegionalStateCounts,
  getRegionalTerms,
  groupRegionalEntries,
  groupRegionalTerms,
  parseRiskFilter,
  regionalExpressionPath,
} from "@/lib/regional-glossary";

export const metadata: Metadata = {
  title: "Gírias Regionais do Brasil | Gíria AI",
  description: "Explore gírias regionais separadas por região do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste e Sul).",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias/regionais` },
};

interface Props {
  searchParams?: Promise<{ uf?: string; q?: string; risk?: string }>;
}

const CURATED_QUERY_CHIPS = [
  "São João",
  "zap",
  "TikTok",
  "comida",
  "interior",
  "rolê",
  "chimarrão",
  "cerrado",
];

function buildRegionaisHref(params: { uf?: string; q?: string; risk?: string }) {
  const search = new URLSearchParams();
  if (params.uf) search.set("uf", params.uf);
  if (params.q) search.set("q", params.q);
  if (params.risk) search.set("risk", params.risk);
  const qs = search.toString();
  return qs ? `/girias/regionais?${qs}` : "/girias/regionais";
}

export default async function GiriasRegionaisPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ufFilter = (sp?.uf || "").toUpperCase().trim();
  const queryReadable = (sp?.q || "").trim();
  const riskFilter = parseRiskFilter(sp?.risk);
  const allRegionalTerms = getRegionalTerms();
  const regionalTerms = getRegionalTerms({ uf: ufFilter, q: queryReadable, risk: riskFilter });
  const grouped = groupRegionalTerms(regionalTerms);
  const groupedEntries = groupRegionalEntries(regionalTerms);
  const fullStats = getRegionalCoverageStats(allRegionalTerms);
  const filteredStats = getRegionalCoverageStats(regionalTerms);
  const filteredCount = filteredStats.total;
  const stateCounts = getRegionalStateCounts(allRegionalTerms);
  const allStates = stateCounts.map((item) => item.state);
  const regionalOverview = getRegionalOverviewCards(regionalTerms);
  const activeFilters = [ufFilter ? `UF ${ufFilter}` : null, queryReadable ? `busca “${queryReadable}”` : null, riskFilter ? `risco ${RISK_CONFIG[riskFilter].label}` : null].filter(Boolean);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const featuredRegionalEntries = REGION_ORDER.flatMap((region) =>
    (groupedEntries.get(region) ?? []).slice(0, 5).map((entry) => ({ region, entry })),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Gírias regionais do Brasil",
            description: "Glossário regional com expressões brasileiras agrupadas por macro-região, UF e contexto de uso.",
            url: `${site}/girias/regionais`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: featuredRegionalEntries.map(({ region, entry }, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: entry.rootTerm,
                url: `${site}${regionalExpressionPath(entry.rootTerm, region)}`,
              })),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "Gírias", item: `${site}/girias` },
              { "@type": "ListItem", position: 3, name: "Regionais", item: `${site}/girias/regionais` },
            ],
          }),
        }}
      />
      <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Glossário regional ampliado</p>
        <h1 className="mt-2 text-3xl font-bold">Gírias regionais do Brasil</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Página dedicada às expressões regionais com macro-regiões, UFs, contexto de uso, nível de risco e exemplos de aplicação por canal. O glossário já carrega {fullStats.total.toLocaleString("pt-BR")} entradas regionais, incluindo {REGIONAL_DEEP_EXPANSION_COUNT.toLocaleString("pt-BR")} contextos de uso novos.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white/80 p-3">
            <p className="text-xs text-muted-foreground">Entradas regionais</p>
            <p className="text-2xl font-bold">{fullStats.total.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-xl border bg-white/80 p-3">
            <p className="text-xs text-muted-foreground">Contextos novos</p>
            <p className="text-2xl font-bold">{REGIONAL_DEEP_EXPANSION_COUNT.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-xl border bg-white/80 p-3">
            <p className="text-xs text-muted-foreground">UFs mapeadas</p>
            <p className="text-2xl font-bold">{fullStats.states.length}</p>
          </div>
          <div className="rounded-xl border bg-white/80 p-3">
            <p className="text-xs text-muted-foreground">Em alta</p>
            <p className="text-2xl font-bold">{fullStats.trending.toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Navegação por região">
        {REGION_ORDER.map((region) => (
          <a
            key={`nav-${region}`}
            href={`#regiao-${encodeURIComponent(region)}`}
            className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
          >
            {region}
          </a>
        ))}
      </nav>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Resumo por macro-região">
        {regionalOverview.map((item) => (
          <a key={`overview-${item.region}`} href={`#regiao-${encodeURIComponent(item.region)}`} className="rounded-xl border p-4 hover:bg-muted/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{item.title}</p>
                <h2 className="text-lg font-semibold">{item.region}</h2>
              </div>
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {item.count.toLocaleString("pt-BR")}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {item.highlights.slice(0, 3).map((highlight) => (
                <span key={`${item.region}-${highlight}`} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {highlight}
                </span>
              ))}
            </div>
          </a>
        ))}
      </section>

      <section className="mt-4 rounded-lg border p-4">
        <form action="/girias/regionais" className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="text-sm">
            <span className="font-medium">Buscar por termo, contexto ou região</span>
            <input
              name="q"
              defaultValue={queryReadable}
              placeholder="Ex.: São João, chimarrão, zap, cerrado..."
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">UF</span>
            <select name="uf" defaultValue={ufFilter} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Todas</option>
              {stateCounts.map(({ state, count }) => (
                <option key={state} value={state}>{state} · {count.toLocaleString("pt-BR")}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Risco</span>
            <select name="risk" defaultValue={riskFilter ?? ""} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="">Todos</option>
              {Object.entries(RISK_CONFIG).map(([risk, config]) => (
                <option key={risk} value={risk}>{config.label}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Filtrar regionais
            </button>
            {activeFilters.length > 0 ? (
              <Link href="/girias/regionais" className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
                Limpar filtros
              </Link>
            ) : null}
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {CURATED_QUERY_CHIPS.map((chip) => (
            <Link key={chip} href={buildRegionaisHref({ q: chip, uf: ufFilter, risk: riskFilter ?? undefined })} className="rounded-full border px-2 py-0.5 text-xs hover:bg-muted">
              {chip}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {allStates.length === 0 ? (
            <span className="text-xs text-muted-foreground">Sem UFs mapeadas ainda no dataset regional.</span>
          ) : (
            stateCounts.map(({ state, count }) => (
              <Link
                key={state}
                href={buildRegionaisHref({ uf: state, q: queryReadable, risk: riskFilter ?? undefined })}
                className={`rounded-full border px-2 py-0.5 text-xs ${ufFilter === state ? "bg-emerald-50 border-emerald-300" : ""}`}
              >
                {state} <span className="text-muted-foreground">{count.toLocaleString("pt-BR")}</span>
              </Link>
            ))
          )}
        </div>

        {activeFilters.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Filtros ativos: <strong>{activeFilters.join(" · ")}</strong> — {filteredCount.toLocaleString("pt-BR")} resultado(s).
          </p>
        ) : null}
      </section>

      <div className="mt-8 space-y-8">
        <section className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Resumo de cobertura regional</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStats.byRegion.map((item) => (
              <div key={`count-${item.region}`} className="rounded-lg border p-2">
                <p className="text-xs text-muted-foreground">{item.region}</p>
                <p className="text-xl font-bold">{item.count.toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(filteredStats.byRisk).map(([risk, count]) => (
              <Link key={risk} href={buildRegionaisHref({ uf: ufFilter, q: queryReadable, risk })} className="rounded-lg border p-2 hover:bg-muted">
                <p className="text-xs text-muted-foreground">{RISK_CONFIG[risk as keyof typeof RISK_CONFIG].label}</p>
                <p className="text-lg font-semibold">{count.toLocaleString("pt-BR")}</p>
              </Link>
            ))}
          </div>
        </section>

        {filteredCount === 0 ? (
          <section className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">
              Nenhuma gíria regional encontrada para esse filtro.
            </p>
            <Link href="/girias/regionais" className="mt-2 inline-block text-sm underline">
              Ver todas as regiões
            </Link>
          </section>
        ) : null}

        {REGION_ORDER.map((region) => {
          const terms = grouped.get(region) ?? [];
          const entries = groupedEntries.get(region) ?? [];
          const regionContent = REGION_CONTENT[region];
          if (terms.length === 0) return null;
          return (
            <section id={`regiao-${region}`} key={region} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{regionContent.title}</p>
                  <h2 className="text-xl font-semibold">{region}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{regionContent.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {regionContent.highlights.map((highlight) => (
                      <Link key={`${region}-${highlight}`} href={buildRegionaisHref({ q: highlight })} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted">
                        {highlight}
                      </Link>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{entries.length.toLocaleString("pt-BR")} expressões principais · {terms.length.toLocaleString("pt-BR")} contextos de uso nesta região</p>
                </div>
                <Link href={buildRegionaisHref({ q: region })} className="text-sm underline">
                  Ver filtro desta região
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.slice(0, 72).map((entry) => (
                  <li key={`${region}-${entry.key}`} className="rounded-lg border p-3 hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={regionalExpressionPath(entry.rootTerm, region)} className="font-semibold">
                        {entry.rootTerm}
                      </Link>
                      {entry.totalVariants > 0 ? (
                        <span className="shrink-0 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                          +{entry.totalVariants} contextos
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{entry.summary}</p>
                    {entry.featuredVariations.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.featuredVariations.map((variation) => (
                          <Link
                            key={`${entry.key}-featured-${variation.term}`}
                            href={`/girias/${encodeURIComponent(variation.term)}`}
                            className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
                          >
                            {variation.term}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {entry.totalVariants > entry.featuredVariations.length ? (
                      <details className="mt-2 rounded-lg border bg-muted/20 p-2 text-[11px] text-muted-foreground">
                        <summary className="cursor-pointer font-medium text-foreground/80">
                          Ver contextos agrupados ({entry.totalVariants.toLocaleString("pt-BR")})
                        </summary>
                        <div className="mt-2 space-y-2">
                          {entry.variationGroups.map((group) => (
                            <div key={`${entry.key}-${group.key}`}>
                              <p className="mb-1 font-medium text-foreground/70">{group.label}</p>
                              <div className="flex flex-wrap gap-1">
                                {group.variations.slice(0, 6).map((variation) => (
                                  <Link
                                    key={`${entry.key}-${group.key}-${variation.term}`}
                                    href={`/girias/${encodeURIComponent(variation.term)}`}
                                    className="rounded-full border bg-background px-2 py-0.5 hover:bg-muted"
                                  >
                                    {variation.term}
                                  </Link>
                                ))}
                                {group.variations.length > 6 ? (
                                  <span className="rounded-full border bg-background px-2 py-0.5">
                                    +{(group.variations.length - 6).toLocaleString("pt-BR")}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                      <span className="rounded-full border px-2 py-0.5">{entry.primary.region}</span>
                      <span className="rounded-full border px-2 py-0.5">{RISK_CONFIG[entry.primary.riskLevel].label}</span>
                      <span className="rounded-full border px-2 py-0.5">{entry.primary.popularityStatus}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
