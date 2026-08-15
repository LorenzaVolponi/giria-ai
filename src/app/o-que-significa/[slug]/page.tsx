import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) return { title: "Termo não encontrado" };

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const url = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  const evidence = getEditorialEvidence(term.term);

  return {
    title: `O que significa ${term.term}?`,
    description: `${term.term}: ${term.meaning} Entenda contexto, exemplo de uso, variações e região dessa expressão.`,
    alternates: { canonical: url },
    openGraph: {
      title: `O que significa ${term.term}?`,
      description: term.meaning,
      url,
      type: "article",
      ...(evidence ? { modifiedTime: `${evidence.reviewedAt}T12:00:00Z` } : {}),
    },
    twitter: {
      card: "summary",
      title: `O que significa ${term.term}?`,
      description: term.meaning,
    },
    robots: { index: true, follow: true },
  };
}

export default async function SignificadoTermoPage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonical = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  const evidence = getEditorialEvidence(term.term);

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.meaning,
    url: canonical,
    inDefinedTermSet: `${site}/girias`,
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `O que significa ${term.term}?`,
    description: term.meaning,
    url: canonical,
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: "Gíria AI", url: site },
    ...(evidence
      ? {
          dateModified: evidence.reviewedAt,
          citation: evidence.sources.map((source) => source.url),
        }
      : {}),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `O que significa ${term.term}?`,
        acceptedAnswer: { "@type": "Answer", text: term.meaning },
      },
      {
        "@type": "Question",
        name: `Como usar ${term.term} em uma frase?`,
        acceptedAnswer: { "@type": "Answer", text: term.safeExample || `${term.term} é usado no contexto: ${term.context}` },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "O que significa", item: `${site}/o-que-significa` },
              { "@type": "ListItem", position: 3, name: term.term, item: canonical },
            ],
          }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="text-sm text-muted-foreground" aria-label="Navegação estrutural">
        <Link className="underline" href="/girias">Dicionário de gírias</Link>
        {" · "}
        <Link className="underline" href="/girias/regionais">Gírias regionais</Link>
        {" · "}
        <Link className="underline" href="/guias">Guias</Link>
      </nav>

      <h1 className="text-3xl font-bold">O que significa {term.term}?</h1>
      <p className="text-lg text-muted-foreground">{term.meaning}</p>

      <section className="rounded-lg border p-5 space-y-2">
        <h2 className="font-semibold">Como essa expressão é usada</h2>
        <p>{term.context}</p>
        <p className="text-sm text-muted-foreground"><strong>Exemplo:</strong> {term.safeExample || "Sem exemplo registrado."}</p>
      </section>

      <section className="rounded-lg border p-5 space-y-2">
        <h2 className="font-semibold">Contexto e variações</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Variações:</strong> {term.variations?.join(", ") || "Não informado"}</li>
          <li><strong>Popularidade:</strong> {term.popularityStatus || "Não informado"}</li>
          <li><strong>Região:</strong> {term.region || "Brasil"}</li>
          <li><strong>Origem:</strong> {term.origin || "Não informada"}</li>
        </ul>
      </section>

      {evidence && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Revisão editorial</p>
            <h2 className="mt-1 text-xl font-semibold">Uso recente e referências</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{evidence.context}</p>
            <p className="mt-2 text-xs text-muted-foreground">Revisado em {formatReviewDate(evidence.reviewedAt)}.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Fontes consultadas</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {evidence.sources.map((source) => (
                <li key={source.url}>
                  <a
                    className="font-medium underline underline-offset-4"
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.publisher}: {source.title}
                  </a>
                  <span className="text-muted-foreground"> · {formatReviewDate(source.publishedAt)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              As referências ajudam a confirmar circulação, contexto e evolução do termo. Gírias mudam rapidamente e o sentido final depende da comunidade, da plataforma e do tom da conversa.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Termos relacionados</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {evidence.relatedTerms.map((related) => (
                <Link
                  key={related}
                  href={`/o-que-significa/${encodeURIComponent(related)}`}
                  className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium hover:border-emerald-400"
                >
                  {related}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-muted/30 p-5">
        <h2 className="font-semibold">Quer entender outra gíria?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore o <Link className="underline font-medium" href="/girias">dicionário completo</Link> ou veja nossos{" "}
          <Link className="underline font-medium" href="/guias">guias de cultura digital</Link>.
        </p>
      </section>
    </main>
  );
}
