"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, MapPinned, Search, ShieldCheck, TrendingUp } from "lucide-react";

const popularTerms = ["farmar aura", "sigma", "brainrot", "delulu", "cooked"];

const paths = [
  {
    title: "Em alta agora",
    description: "Expressões que estão circulando em vídeos, comentários e grupos.",
    href: "/guias/girias-do-tiktok",
    icon: TrendingUp,
    links: ["amassou", "plot twist", "de milhões"],
  },
  {
    title: "Por região",
    description: "Descubra como cada parte do Brasil fala e interpreta suas expressões.",
    href: "/girias/regionais",
    icon: MapPinned,
    links: ["Paraná", "Minas Gerais", "Nordeste"],
  },
  {
    title: "Para pais e educadores",
    description: "Leitura clara para entender contexto, tom e nível de atenção.",
    href: "/guias",
    icon: ShieldCheck,
    links: ["linguagem adolescente", "memes", "internet"],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EliteHomeLanding() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = slugify(query);
    if (!slug) return;
    router.push(`/o-que-significa/${slug}`);
  }

  return (
    <main className="bg-[#f7f7f5] text-[#111111] dark:bg-slate-950 dark:text-white">
      <section className="border-b border-black/5 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 border-b border-black/20 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/60 dark:border-white/20 dark:text-white/60">
              Dicionário brasileiro de cultura digital
            </div>

            <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-[5.2rem]">
              Entenda qualquer gíria.
              <span className="mt-2 block text-[#00a978]">Sem perder o contexto.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60 dark:text-white/60">
              Significado, intenção, origem e uso real de expressões do TikTok, Instagram, Discord, games e conversas do dia a dia.
            </p>

            <form onSubmit={submitSearch} className="mt-10 max-w-3xl rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_60px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-slate-900">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/35 dark:text-white/35" />
                  <span className="sr-only">Pesquisar gíria</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Digite uma gíria, frase ou meme..."
                    className="h-14 w-full rounded-xl border-0 bg-[#f4f4f2] pl-12 pr-4 text-base outline-none placeholder:text-black/35 focus:bg-white focus:ring-1 focus:ring-[#00a978] dark:bg-slate-950 dark:placeholder:text-white/35"
                  />
                </label>
                <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#111111] px-7 font-semibold text-white transition hover:bg-[#00a978]">
                  Entender agora <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 text-black/45 dark:text-white/45">Mais buscadas:</span>
              {popularTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => router.push(`/o-que-significa/${slugify(term)}`)}
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 font-medium text-black/65 transition hover:border-[#00a978] hover:text-[#007f5d] dark:border-white/10 dark:bg-slate-900 dark:text-white/70"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-black/10 bg-[#111111] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:border-white/10">
              <div className="flex items-center justify-between px-3 py-2 text-white">
                <div>
                  <p className="text-sm font-semibold">Gíria AI</p>
                  <p className="text-xs text-white/45">Interpretação com contexto</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Online</span>
              </div>

              <div className="mt-3 rounded-[1.5rem] bg-white p-6 text-black sm:p-8">
                <div className="ml-auto max-w-[88%] rounded-2xl bg-[#f2f2f0] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">Você</p>
                  <p className="mt-2 font-semibold leading-7">“Meu filho falou que eu estou farmando aura. Isso é elogio?”</p>
                </div>

                <div className="mt-5 border-l-2 border-[#00a978] pl-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#007f5d]">Resposta</p>
                  <p className="mt-3 leading-7 text-black/70">Sim. A expressão indica que você ganhou presença, respeito ou carisma por fazer algo marcante.</p>
                  <div className="mt-4 flex gap-2 text-xs font-medium text-black/45">
                    <span>Tom positivo</span>
                    <span>•</span>
                    <span>Uso digital</span>
                  </div>
                </div>

                <a href="#tradutor" className="mt-7 flex items-center justify-between border-t border-black/10 pt-5 font-semibold transition hover:text-[#007f5d]">
                  Pesquisar uma expressão <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-8 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">Comece por onde fizer sentido</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Fácil para quem só quer entender.</h2>
          </div>
          <Link href="/girias" className="inline-flex items-center gap-2 font-semibold text-black/65 transition hover:text-[#007f5d] dark:text-white/65">
            Ver dicionário completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 lg:grid-cols-3">
          {paths.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="group bg-white p-7 transition hover:bg-[#fbfbf9] dark:bg-slate-900 dark:hover:bg-slate-900/80">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f1ef] text-black/70 dark:bg-slate-800 dark:text-white/70">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-black/25 transition group-hover:translate-x-1 group-hover:text-[#007f5d] dark:text-white/25" />
                </div>
                <h3 className="mt-7 text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 min-h-20 text-sm leading-7 text-black/55 dark:text-white/55">{item.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <span key={link} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/50 dark:border-white/10 dark:text-white/50">
                      {link}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 text-sm text-black/50 dark:text-white/50">
          <BookOpen className="h-4 w-4" />
          Conteúdo organizado para consulta rápida, pesquisa e aprofundamento.
        </div>
      </section>
    </main>
  );
}
