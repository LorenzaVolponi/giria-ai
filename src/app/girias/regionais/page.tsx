import type { Metadata } from "next";
import Link from "next/link";
import { RISK_CONFIG } from "@/lib/slang-data";
import { REGIONAL_DEEP_EXPANSION_COUNT } from "@/lib/slang-regional-deep-expansion";
import {
  REGION_ORDER,
  getAvailableRegionalStates,
  getRegionalCoverageStats,
  getRegionalTerms,
  groupRegionalEntries,
  groupRegionalTerms,
  parseRiskFilter,
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
  const allStates = getAvailableRegionalStates(allRegionalTerms);
  const activeFilters = [ufFilter ? `UF ${ufFilter}` : null, queryReadable ? `busca “${queryReadable}”` : null, riskFilter ? `risco ${RISK_CONFIG[riskFilter].label}` : null].filter(Boolean);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Glossário regional ampliado</p>
        <h1 className="mt-2 text-3xl font-bold">Gírias regionais do Brasil</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Página dedicada às expressões regionais com macro-regiões, UFs, contexto de uso, nível de risco e variações de canal. O glossário já carrega {fullStats.total.toLocaleString("pt-BR")} entradas regionais, incluindo {REGIONAL_DEEP_EXPANSION_COUNT.toLocaleString("pt-BR")} variações contextuais novas.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white/80 p-3">
            <p className="text-xs text-muted-foreground">Entradas regionais</p>
            <p className="text-2xl font-bold">{fullStats.total.toLocaleString("pt-BR")}</p>
          </div>
          <div className="rounded-xl border bg-white/80 p-3">
            <p className="text-xs text-muted-foreground">Variações novas</p>
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
              {allStates.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
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
            allStates.map((uf) => (
              <Link
                key={uf}
                href={buildRegionaisHref({ uf, q: queryReadable, risk: riskFilter ?? undefined })}
                className={`rounded-full border px-2 py-0.5 text-xs ${ufFilter === uf ? "bg-emerald-50 border-emerald-300" : ""}`}
              >
                {uf}
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
          if (terms.length === 0) return null;
          return (
            <section id={`regiao-${region}`} key={region} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{region}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{entries.length.toLocaleString("pt-BR")} expressões-base · {terms.length.toLocaleString("pt-BR")} variações nesta região</p>
                </div>
                <Link href={buildRegionaisHref({ q: region })} className="text-sm underline">
                  Ver filtro desta região
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.slice(0, 72).map((entry) => (
                  <li key={`${region}-${entry.key}`} className="rounded-lg border p-3 hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/girias/${encodeURIComponent(entry.primary.term)}`} className="font-semibold">
                        {entry.rootTerm}
                      </Link>
                      {entry.totalVariants > 0 ? (
                        <span className="shrink-0 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                          +{entry.totalVariants} variações
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{entry.summary}</p>
                    {entry.variations.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.variations.slice(0, 5).map((variation) => (
                          <Link
                            key={`${entry.key}-${variation.term}`}
                            href={`/girias/${encodeURIComponent(variation.term)}`}
                            className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted"
                          >
                            {variation.term}
                          </Link>
                        ))}
                      </div>
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
