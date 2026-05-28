import type { Metadata } from "next";
import Link from "next/link";
import { RISK_CONFIG, SLANG_DATA, type RiskLevel } from "@/lib/slang-data";

export const metadata: Metadata = {
  title: "Gírias Regionais do Brasil | Gíria AI",
  description: "Explore gírias regionais separadas por região do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste e Sul).",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias/regionais` },
};

type RegionKey = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | "Brasil";

const regionOrder: RegionKey[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul", "Brasil"];

function normalizeRegionLabel(region: string): RegionKey {
  const r = region.toLowerCase();
  if (r.includes("norte")) return "Norte";
  if (r.includes("nordeste")) return "Nordeste";
  if (r.includes("centro-oeste") || r.includes("centro oeste")) return "Centro-Oeste";
  if (r.includes("sudeste") || r.includes("minas") || r.includes("sao paulo") || r.includes("rio de janeiro")) return "Sudeste";
  if (r.includes("sul")) return "Sul";
  return "Brasil";
}

interface Props {
  searchParams?: Promise<{ uf?: string; q?: string; risk?: string }>;
}

function parseRiskFilter(value?: string): RiskLevel | null {
  if (!value) return null;
  return value in RISK_CONFIG ? (value as RiskLevel) : null;
}

export default async function GiriasRegionaisPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ufFilter = (sp?.uf || "").toUpperCase().trim();
  const query = (sp?.q || "").trim().toLowerCase();
  const queryReadable = (sp?.q || "").trim();
  const riskFilter = parseRiskFilter(sp?.risk);
  const regionalTerms = SLANG_DATA
    .filter((term) => term.category === "regional")
    .filter((term) => !riskFilter || term.riskLevel === riskFilter)
    .filter((term) => {
      if (!query) return true;
      return `${term.term} ${term.meaning} ${term.context} ${term.region}`.toLowerCase().includes(query);
    });
  const grouped = new Map<RegionKey, typeof regionalTerms>();

  for (const key of regionOrder) grouped.set(key, []);
  for (const term of regionalTerms) {
    if (ufFilter) {
      const m = term.region.match(/\(([A-Z]{2})\)/);
      if (!m || m[1] !== ufFilter) continue;
    }
    const bucket = normalizeRegionLabel(term.region);
    grouped.get(bucket)!.push(term);
  }
  const filteredCount = Array.from(grouped.values()).reduce((acc, list) => acc + list.length, 0);
  const regionCounts = regionOrder.map((region) => ({
    region,
    count: (grouped.get(region) ?? []).length,
  }));

  const allStates = Array.from(
    new Set(
      SLANG_DATA.filter((term) => term.category === "regional")
        .map((t) => {
          const m = t.region.match(/\(([A-Z]{2})\)/);
          return m?.[1] ?? null;
        })
        .filter(Boolean) as string[]
    )
  ).sort();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Gírias regionais do Brasil</h1>
      <p className="mt-3 text-muted-foreground">
        Página dedicada às expressões regionais. Clique em uma gíria para ver significado, contexto e orientação.
      </p>
      <nav className="mt-4 flex flex-wrap gap-2">
        {regionOrder.map((region) => (
          <a
            key={`nav-${region}`}
            href={`#regiao-${encodeURIComponent(region)}`}
            className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
          >
            {region}
          </a>
        ))}
      </nav>
      <section className="mt-4 rounded-lg border p-3">
        <p className="text-xs font-medium text-muted-foreground">Filtro rápido por UF (em expansão):</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allStates.length === 0 ? (
            <span className="text-xs text-muted-foreground">Sem UFs mapeadas ainda no dataset regional.</span>
          ) : (
            allStates.map((uf) => (
              <Link
                key={uf}
                href={`/girias/regionais?uf=${uf}`}
                className={`rounded-full border px-2 py-0.5 text-xs ${ufFilter === uf ? "bg-emerald-50 border-emerald-300" : ""}`}
              >
                {uf}
              </Link>
            ))
          )}
          {ufFilter ? (
            <Link href="/girias/regionais" className="rounded-full border px-2 py-0.5 text-xs">
              Limpar filtro
            </Link>
          ) : null}
        </div>
        {ufFilter ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Exibindo somente termos mapeados para <strong>{ufFilter}</strong>.
          </p>
        ) : null}
        {query ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Busca ativa por <strong>&ldquo;{queryReadable}&rdquo;</strong>.
          </p>
        ) : null}
        {riskFilter ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Filtro de risco ativo: <strong>{riskFilter}</strong>.
          </p>
        ) : null}
      </section>

      <div className="mt-8 space-y-8">
        <section className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Resumo de cobertura regional</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {regionCounts.map((item) => (
              <div key={`count-${item.region}`} className="rounded-lg border p-2">
                <p className="text-xs text-muted-foreground">{item.region}</p>
                <p className="text-xl font-bold">{item.count}</p>
              </div>
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
        {regionOrder.map((region) => {
          const terms = grouped.get(region) ?? [];
          if (terms.length === 0) return null;
          return (
            <section id={`regiao-${region}`} key={region} className="rounded-xl border p-4">
              <h2 className="text-xl font-semibold">{region}</h2>
              <p className="text-xs text-muted-foreground mt-1">{terms.length} gírias nesta região</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...terms].sort((a, b) => a.term.localeCompare(b.term, "pt-BR")).slice(0, 60).map((term) => (
                  <li key={`${region}-${term.term}`} className="rounded-lg border p-3 hover:bg-muted/50">
                    <Link href={`/girias/${encodeURIComponent(term.term)}`} className="font-semibold">
                      {term.term}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{term.meaning}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{term.region}</p>
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
