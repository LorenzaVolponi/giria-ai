import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

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

export default function GiriasRegionaisPage() {
  const regionalTerms = SLANG_DATA.filter((t) => t.category === "regional");
  const grouped = new Map<RegionKey, typeof regionalTerms>();

  for (const key of regionOrder) grouped.set(key, []);
  for (const term of regionalTerms) {
    const bucket = normalizeRegionLabel(term.region);
    grouped.get(bucket)!.push(term);
  }

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

      <div className="mt-8 space-y-8">
        {regionOrder.map((region) => {
          const terms = grouped.get(region) ?? [];
          if (terms.length === 0) return null;
          return (
            <section id={`regiao-${region}`} key={region} className="rounded-xl border p-4">
              <h2 className="text-xl font-semibold">{region}</h2>
              <p className="text-xs text-muted-foreground mt-1">{terms.length} gírias nesta região</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {terms.slice(0, 60).map((term) => (
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
