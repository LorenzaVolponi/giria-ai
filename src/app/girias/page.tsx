import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

export const metadata: Metadata = {
  title: "Gírias Populares | Gíria AI",
  description: "Navegue por gírias populares e entenda os significados de forma clara e contextualizada.",
  keywords: ["gírias", "o que significa", "dicionário de gírias", "gíria brasileira", "tradutor de gírias"],
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias` },
};

type RegionKey = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | "Brasil";

const regionOrder: RegionKey[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul", "Brasil"];

const ufToRegion: Record<string, RegionKey> = {
  AC: "Norte",
  AP: "Norte",
  AM: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  TO: "Norte",
  AL: "Nordeste",
  BA: "Nordeste",
  CE: "Nordeste",
  MA: "Nordeste",
  PB: "Nordeste",
  PE: "Nordeste",
  PI: "Nordeste",
  RN: "Nordeste",
  SE: "Nordeste",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  ES: "Sudeste",
  MG: "Sudeste",
  RJ: "Sudeste",
  SP: "Sudeste",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
};

function normalizeRegionLabel(region: string): RegionKey {
  const r = region.toLowerCase();
  const ufMatch = region.toUpperCase().match(/\b([A-Z]{2})\b|\(([A-Z]{2})\)/);
  const uf = ufMatch?.[1] ?? ufMatch?.[2] ?? null;

  if (uf && ufToRegion[uf]) return ufToRegion[uf];
  if (r.includes("norte")) return "Norte";
  if (r.includes("nordeste")) return "Nordeste";
  if (r.includes("centro-oeste") || r.includes("centro oeste")) return "Centro-Oeste";
  if (r.includes("sudeste") || r.includes("minas") || r.includes("sao paulo") || r.includes("rio de janeiro")) return "Sudeste";
  if (r.includes("sul")) return "Sul";
  return "Brasil";
}

export default function GiriasPage() {
  const topTerms = SLANG_DATA.slice(0, 50);
  const regionalTerms = SLANG_DATA.filter((term) => term.category === "regional");
  const groupedRegionals = new Map<RegionKey, typeof regionalTerms>();

  for (const key of regionOrder) groupedRegionals.set(key, []);
  for (const term of regionalTerms) {
    const bucket = normalizeRegionLabel(term.region);
    groupedRegionals.get(bucket)!.push(term);
  }

  const regionalHighlights = regionOrder
    .map((region) => {
      const terms = [...(groupedRegionals.get(region) ?? [])].sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
      return { region, terms: terms.slice(0, 6) };
    })
    .filter((group) => group.terms.length >= 3);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Glossário de gírias populares</h1>
      <p className="mt-3 text-muted-foreground">Clique em uma gíria para abrir a explicação detalhada.</p>
      <p className="mt-2 text-sm">
        Quer focar por localização?{" "}
        <Link href="/girias/regionais" className="underline font-medium">
          Ver página de gírias regionais
        </Link>
      </p>
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Gírias Populares</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {topTerms.map((term) => (
            <li key={term.term} className="rounded-lg border p-4 hover:bg-muted/50">
              <Link href={`/girias/${encodeURIComponent(term.term)}`} className="font-semibold">
                {term.term}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{term.meaning}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Gírias Regionais em destaque</h2>
        {regionalHighlights.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não há gírias regionais suficientes em destaque. Veja a listagem completa na página regional.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {regionalHighlights.map((group) => {
              const uf = group.terms
                .map((term) => term.region.match(/\(([A-Z]{2})\)/)?.[1] ?? null)
                .find(Boolean);

              return (
                <article key={group.region} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{group.region}</h3>
                      <p className="text-xs text-muted-foreground">{group.terms.length} termos em destaque</p>
                    </div>
                    {uf ? (
                      <Link href={`/girias/regionais?uf=${uf}`} className="text-sm underline font-medium">
                        Ver gírias de {uf}
                      </Link>
                    ) : null}
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.terms.slice(0, 6).map((term) => (
                      <li key={`${group.region}-${term.term}`} className="rounded-lg border p-3 hover:bg-muted/50">
                        <Link href={`/girias/${encodeURIComponent(term.term)}`} className="font-semibold">
                          {term.term}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{term.meaning}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{term.region}</p>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
