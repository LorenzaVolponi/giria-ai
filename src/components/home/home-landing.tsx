"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  Gamepad2,
  GraduationCap,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const trendingTerms = ["farmar aura", "brainrot", "sigma", "NPC", "delulu", "cooked"];

const categories = [
  {
    label: "TikTok e Reels",
    description: "Trends, comentários e linguagem viral traduzidos sem enrolação.",
    icon: TrendingUp,
    href: "/guias/girias-do-tiktok",
    accent: "from-fuchsia-500/20 to-pink-500/5",
  },
  {
    label: "Games e streams",
    description: "Expressões de partidas, Discord, Twitch e comunidades online.",
    icon: Gamepad2,
    href: "/girias?categoria=gaming",
    accent: "from-cyan-500/20 to-blue-500/5",
  },
  {
    label: "Brasil regional",
    description: "Gírias brasileiras organizadas por região, estado e contexto.",
    icon: MapPinned,
    href: "/girias/regionais",
    accent: "from-amber-500/20 to-orange-500/5",
  },
  {
    label: "Pais e educadores",
    description: "Clareza para entender conversas sem julgamento ou constrangimento.",
    icon: GraduationCap,
    href: "/guias",
    accent: "from-emerald-500/20 to-teal-500/5",
  },
];

const audiences = [
  { label: "Para pais", description: "Entenda o contexto antes de reagir.", icon: Users },
  { label: "Para educadores", description: "Decodifique linguagem, memes e comportamento.", icon: BookOpen },
  { label: "Para curiosos", description: "Acompanhe a cultura digital brasileira.", icon: Sparkles },
];

const trustPoints = [
  "Significado em linguagem clara",
  "Contexto social e emocional",
  "Exemplos reais de uso",
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
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 -z-30 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_58%,#020617_100%)]" />
        <div className="absolute left-1/2 top-0 -z-20 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -left-32 top-1/3 -z-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute -right-32 top-1/4 -z-20 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute inset-0 -z-10 opacity-[0.035] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:44px_44px] dark:opacity-[0.06]" />

        <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-800/70 dark:bg-slate-900/70 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              O Brasil fala. O Gíria AI explica.
            </div>

            <h1 className="mt-7 max-w-4xl text-balance text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Entenda qualquer gíria.
              <span className="mt-2 block bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
                Sem pagar de perdido.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
              Significado, intenção, origem e contexto cultural de expressões do TikTok, Instagram, Discord, games, memes e da Geração Alpha.
            </p>

            <form onSubmit={submitSearch} className="mt-9 max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white/90 p-2.5 shadow-[0_30px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <span className="sr-only">Pesquisar gíria</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Digite uma gíria, frase ou meme..."
                    autoComplete="off"
                    className="h-16 w-full rounded-2xl border-0 bg-slate-50 pl-14 pr-4 text-base font-medium outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950 dark:focus:bg-slate-950"
                  />
                </label>
                <button type="submit" className="group inline-flex h-16 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 font-black text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/20 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-400">
                  Descobrir significado
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 inline-flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Em alta agora
              </span>
              {trendingTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => router.push(`/o-que-significa/${slugify(term)}`)}
                  className="rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {trustPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {point}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-4 -z-10 rounded-[2.75rem] bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-violet-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-slate-950 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.28)] dark:border-white/10">
              <div className="flex items-center justify-between px-2 pb-4 pt-1 text-white">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black">Gíria AI</p>
                    <p className="text-xs text-slate-400">Contexto em tempo real</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online
                </span>
              </div>

              <div className="rounded-[2rem] bg-white p-5 text-slate-950 sm:p-7">
                <div className="ml-auto max-w-[88%] rounded-3xl rounded-br-md bg-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Você</p>
                  <p className="mt-2 font-bold">“Meu filho falou que eu estou farmando aura. Isso é elogio?”</p>
                </div>

                <div className="mt-4 max-w-[94%] rounded-3xl rounded-bl-md border border-emerald-100 bg-emerald-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-black text-emerald-700">
                    <Sparkles className="h-4 w-4" /> Tradução inteligente
                  </div>
                  <p className="mt-3 leading-7 text-slate-700">
                    Sim. Significa que você está acumulando presença, respeito ou carisma — normalmente por fazer algo admirável ou marcante.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600">Tom: positivo</span>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600">Origem: internet</span>
                  </div>
                </div>

                <a href="#tradutor" className="group mt-6 flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-emerald-600">
                  Pergunte qualquer expressão
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10">
                  <Zap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Resposta</p>
                  <p className="font-black">Clara e contextual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white dark:border-slate-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[["10 mil+", "gírias e expressões"], ["53", "recortes regionais"], ["16", "guias especializados"], ["100%", "acesso gratuito"]].map(([value, label]) => (
            <div key={label} className="px-3 py-8 text-center sm:px-6 sm:py-10">
              <strong className="block text-3xl font-black tracking-tight sm:text-4xl">{value}</strong>
              <span className="mt-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">Explore seu universo</p>
            <h2 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Cada comunidade fala de um jeito.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Entre pela porta certa e descubra o significado sem perder o contexto.</p>
          </div>
          <Link href="/girias" className="group inline-flex items-center gap-2 font-black text-slate-700 transition hover:text-emerald-600 dark:text-slate-200">
            Ver dicionário completo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.label} href={category.href} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-slate-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                <div className={`absolute inset-0 -z-0 bg-gradient-to-br ${category.accent} opacity-0 transition duration-300 group-hover:opacity-100`} />
                <div className="relative z-10">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 dark:bg-white dark:text-slate-950">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-8 text-2xl font-black tracking-tight">{category.label}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-7 text-slate-600 dark:text-slate-400">{category.description}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-400">
                    Explorar agora <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-slate-200 bg-slate-950 text-white dark:border-slate-800">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              <Bot className="h-4 w-4" /> Especialista com IA
            </div>
            <h2 className="mt-7 max-w-3xl text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Não traduzimos apenas a palavra. Traduzimos a situação.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Conte o que aconteceu e receba uma explicação com significado, intenção, tom e contexto social.</p>
            <a href="#tradutor" className="group mt-9 inline-flex items-center gap-3 rounded-2xl bg-emerald-400 px-7 py-4 font-black text-slate-950 shadow-xl shadow-emerald-500/10 transition hover:-translate-y-1 hover:bg-emerald-300">
              Conversar com o Gíria AI <MessageCircle className="h-5 w-5 transition group-hover:rotate-6" />
            </a>
          </div>

          <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="flex items-center gap-1 text-amber-300">
              {[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}
            </div>
            <blockquote className="mt-6 text-balance text-2xl font-bold leading-10 text-white">“Finalmente uma ferramenta que explica o que foi dito sem fazer o adulto se sentir ultrapassado.”</blockquote>
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="font-black">Clareza antes da reação</p>
              <p className="mt-1 text-sm text-slate-400">Uma experiência desenhada para aproximar gerações.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">Confiança e contexto</p>
            <h2 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Feito para entender. Não para julgar.</h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">O Gíria AI explica intenção, tom, possíveis riscos de interpretação e o contexto cultural por trás de cada expressão.</p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" /> Conteúdo educativo, organizado e acessível.
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <div key={audience.label} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-900">
                  <Icon className="h-7 w-7 text-emerald-600" />
                  <h3 className="mt-7 text-xl font-black">{audience.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{audience.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
