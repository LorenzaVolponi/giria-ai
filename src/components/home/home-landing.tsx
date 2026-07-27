"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Gamepad2,
  GraduationCap,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const trendingTerms = ["farmar aura", "brainrot", "sigma", "NPC", "delulu", "cooked"];

const categories = [
  { label: "TikTok e Reels", description: "Trends, comentários e linguagem viral.", icon: TrendingUp, href: "/guias/girias-do-tiktok" },
  { label: "Games", description: "Expressões de partidas, streams e comunidades.", icon: Gamepad2, href: "/girias?categoria=gaming" },
  { label: "Regionais", description: "Gírias brasileiras organizadas por região.", icon: MapPinned, href: "/girias/regionais" },
  { label: "Pais e educadores", description: "Contexto claro para conversar sem julgamento.", icon: GraduationCap, href: "/guias" },
];

const audiences = [
  { label: "Para pais", description: "Entenda o contexto antes de reagir.", icon: Users },
  { label: "Para educadores", description: "Decodifique linguagem, memes e comportamento.", icon: BookOpen },
  { label: "Para curiosos", description: "Acompanhe a cultura digital brasileira.", icon: Sparkles },
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

export default function HomeLanding() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = slugify(query);
    if (!slug) return;
    router.push(`/o-que-significa/${slug}`);
  }

  return (
    <div className="overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="relative border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_32%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-slate-900/80 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Cultura digital brasileira explicada
            </div>

            <h1 className="text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              O maior dicionário inteligente de gírias da internet brasileira.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              Descubra significados, contexto, origem e exemplos de expressões do TikTok, Instagram, Discord, games, memes e da Geração Alpha.
            </p>

            <form onSubmit={submitSearch} className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:flex-row dark:border-slate-800 dark:bg-slate-900">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <span className="sr-only">Pesquisar gíria</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Digite uma gíria, frase ou meme..."
                  className="h-14 w-full rounded-2xl border-0 bg-slate-50 pl-12 pr-4 text-base outline-none ring-0 placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:focus:bg-slate-950"
                />
              </label>
              <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-400">
                Pesquisar <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="mr-1 inline-flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400"><TrendingUp className="h-4 w-4" /> Em alta:</span>
              {trendingTerms.map((term) => (
                <button key={term} type="button" onClick={() => router.push(`/o-que-significa/${slugify(term)}`)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[['10 mil+', 'gírias e expressões'], ['53', 'recortes regionais'], ['16', 'guias especializados'], ['100%', 'acesso gratuito']].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                <strong className="block text-2xl font-black sm:text-3xl">{value}</strong>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Explore por contexto</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Encontre o caminho certo sem adivinhar.</h2>
          </div>
          <Link href="/girias" className="inline-flex items-center gap-2 font-bold text-slate-700 hover:text-emerald-600 dark:text-slate-200">Ver todas as gírias <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.label} href={category.href} className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-slate-950 dark:text-emerald-400"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-6 text-xl font-black">{category.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{category.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">Explorar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white dark:border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><Bot className="h-4 w-4" /> Especialista com IA</div>
            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">Pergunte como você falaria com uma pessoa.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Explique a situação completa — “meu filho falou farmar aura” — e receba uma resposta com significado, intenção e contexto social.</p>
            <a href="#tradutor" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950 transition hover:bg-emerald-400">Conversar com o Gíria AI <MessageCircle className="h-5 w-5" /></a>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-3xl bg-white p-5 text-slate-950">
              <p className="text-sm font-semibold text-slate-500">Você</p>
              <p className="mt-2 font-bold">“Ela disse que eu estou cozinhando. Isso é bom?”</p>
            </div>
            <div className="mt-4 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-sm font-semibold text-emerald-300">Gíria AI</p>
              <p className="mt-2 leading-7 text-slate-100">Provavelmente sim. “Está cozinhando” pode significar que você está mandando bem, criando algo forte ou dominando uma situação — mas o tom da conversa importa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">Confiança e contexto</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Mais do que traduzir palavras.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">O Gíria AI explica intenção, tom, possíveis riscos de interpretação e o contexto cultural por trás de cada expressão.</p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><ShieldCheck className="h-5 w-5" /> Conteúdo educativo, organizado e acessível.</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return <div key={audience.label} className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800"><Icon className="h-6 w-6 text-emerald-600" /><h3 className="mt-5 text-lg font-black">{audience.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{audience.description}</p></div>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
