import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Imprensa, pesquisa e citações",
  description:
    "Fact sheet do Gíria AI para imprensa, pesquisadores e criadores: descrição do projeto, metodologia, dados do acervo e links oficiais para citação.",
  alternates: { canonical: `${site}/imprensa` },
  openGraph: {
    title: "Imprensa, pesquisa e citações | Gíria AI",
    description:
      "Informações oficiais, metodologia e dados citáveis do Gíria AI para matérias, pesquisas e conteúdos sobre gírias e cultura digital brasileira.",
    url: `${site}/imprensa`,
    type: "website",
  },
};

export default function ImprensaPage() {
  const totalTerms = SLANG_DATA.length;
  const categories = new Set(SLANG_DATA.map((term) => term.category).filter(Boolean)).size;
  const regions = new Set(SLANG_DATA.map((term) => term.region).filter(Boolean)).size;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Imprensa, pesquisa e citações — Gíria AI",
    url: `${site}/imprensa`,
    inLanguage: "pt-BR",
    isPartOf: { "@type": "WebSite", name: "Gíria AI", url: site },
    about: { "@type": "Organization", name: "Gíria AI", url: site },
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7f8fb_100%)] px-4 py-10 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-10">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Press room
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">Imprensa, pesquisa e citações.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            Informações oficiais para quem está produzindo matéria, pesquisa, aula, relatório ou conteúdo sobre gírias,
            linguagem jovem, memes, regionalismos e cultura digital brasileira.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Descrição curta</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">O que é o Gíria AI</h2>
            <p className="mt-3 leading-7 text-slate-600">
              O Gíria AI é um dicionário inteligente de gírias e cultura digital brasileira. O projeto organiza significado,
              contexto, exemplos, origem, variações e regionalismos para ajudar pessoas a interpretar expressões encontradas
              em conversas, memes, redes sociais, jogos, escolas e comunidades online.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Acervo atual</p>
            <dl className="mt-4 space-y-4">
              <div><dt className="text-sm text-slate-400">Termos catalogados</dt><dd className="text-3xl font-semibold">{totalTerms.toLocaleString("pt-BR")}</dd></div>
              <div><dt className="text-sm text-slate-400">Categorias presentes</dt><dd className="text-3xl font-semibold">{categories.toLocaleString("pt-BR")}</dd></div>
              <div><dt className="text-sm text-slate-400">Rótulos regionais</dt><dd className="text-3xl font-semibold">{regions.toLocaleString("pt-BR")}</dd></div>
            </dl>
            <p className="mt-5 text-xs leading-6 text-slate-400">Indicadores do acervo, não estimativas da população brasileira.</p>
          </article>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-semibold tracking-tight">Links oficiais para referência</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/observatorio" className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300">
              <strong className="block">Observatório</strong>
              <span className="mt-1 block text-sm leading-6 text-slate-600">Indicadores agregados e escopo de uso dos dados.</span>
            </Link>
            <Link href="/observatorio/dados.json" className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300">
              <strong className="block">Dados em JSON</strong>
              <span className="mt-1 block text-sm leading-6 text-slate-600">Resumo estruturado para análise, agentes e integrações.</span>
            </Link>
            <Link href="/sobre" className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300">
              <strong className="block">Metodologia editorial</strong>
              <span className="mt-1 block text-sm leading-6 text-slate-600">Como o projeto trata significado, contexto e limitações.</span>
            </Link>
            <Link href="/guias" className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300">
              <strong className="block">Guias temáticos</strong>
              <span className="mt-1 block text-sm leading-6 text-slate-600">Conteúdo aprofundado sobre linguagem e cultura digital.</span>
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-xl font-semibold">Para citar uma definição</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Prefira a URL canônica em <strong>/o-que-significa/termo</strong>. Ela concentra a definição, o contexto e os
              dados estruturados do verbete.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-xl font-semibold">Para citar um número</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Identifique como “dados do acervo do Gíria AI” e mantenha o escopo. O observatório não é apresentado como
              pesquisa amostral ou ranking nacional de frequência.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Ativos oficiais</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/logo.svg" className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-emerald-300 hover:text-emerald-700">Logo SVG</Link>
            <Link href="/llms.txt" className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-emerald-300 hover:text-emerald-700">llms.txt</Link>
            <Link href="/sitemap.xml" className="rounded-full border border-slate-200 px-4 py-2 transition hover:border-emerald-300 hover:text-emerald-700">Sitemap</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
