"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const popularTerms = ["six seven", "farmar aura", "brainrot", "delulu", "cooked"];

const paths = [
  {
    title: "Em alta agora",
    description: "Expressões que estão circulando em vídeos, comentários e grupos.",
    href: "/guias/girias-do-tiktok",
    icon: TrendingUp,
    links: ["six seven", "aura farming", "cooked"],
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

const demoConversation = [
  {
    question: "Meu filho falou que eu estou farmando aura. Isso é elogio?",
    lead: "A leitura mais provável é positiva.",
    answer: "“Farmar aura” é ganhar presença, respeito ou carisma por fazer algo marcante — às vezes com um toque de ironia.",
    tags: ["Tom: positivo", "Contexto: internet"],
  },
  {
    question: "O que significa six seven?",
    lead: "Pelo jeito, isso veio em tom de brincadeira.",
    answer: "“Six seven” é um meme nonsense. Normalmente não há tradução literal: a graça está em repetir a referência e mostrar que você entendeu a piada do grupo.",
    tags: ["Gen Alpha", "Meme sem sentido fixo"],
  },
  {
    question: "Ele disse que está cooked depois da prova.",
    lead: "Aqui parece exagero cômico, não um alerta por padrão.",
    answer: "“Cooked” quer dizer “estou ferrado” ou “não tem mais jeito”. Em contexto de prova, geralmente significa que a pessoa acha que foi mal.",
    tags: ["Tom: dramático", "Atenção: baixa"],
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
  const [demoIndex, setDemoIndex] = useState(0);
  const [demoStep, setDemoStep] = useState<"reading" | "answer">("answer");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDemoStep("reading");
      window.setTimeout(() => {
        setDemoIndex((current) => (current + 1) % demoConversation.length);
        setDemoStep("answer");
      }, 900);
    }, 6200);

    return () => window.clearInterval(timer);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    window.dispatchEvent(new CustomEvent("giria-ai:open", { detail: { message: value } }));
  }

  function openChat(message?: string) {
    window.dispatchEvent(new CustomEvent("giria-ai:open", { detail: { message } }));
  }

  const demo = demoConversation[demoIndex];

  return (
    <main className="bg-[#f7f7f5] text-[#111111] dark:bg-slate-950 dark:text-white">
      <section className="relative isolate overflow-hidden border-b border-black/5 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)] dark:opacity-20" />
        <div className="pointer-events-none absolute left-[18%] top-12 -z-10 h-72 w-72 rounded-full bg-emerald-200/50 blur-[110px]" />
        <div className="pointer-events-none absolute right-[2%] top-28 -z-10 h-80 w-80 rounded-full bg-sky-200/40 blur-[120px] dark:bg-sky-500/10" />

        <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.93fr_1.07fr] lg:gap-10 lg:px-10 lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-900/80 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> O Brasil fala. O Gíria AI explica.
            </div>

            <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.058em] sm:text-6xl lg:text-[5.15rem]">
              Entenda o que realmente quiseram dizer.
              <span className="mt-2 block bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                Sem pagar de perdido.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-black/60 dark:text-white/60">
              Não traduzimos apenas palavras. Interpretamos intenção, tom, contexto cultural e nível de atenção em expressões do TikTok, Instagram, Discord, games e conversas reais.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-9 max-w-2xl rounded-[1.4rem] border border-black/10 bg-white/90 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.11)] backdrop-blur transition focus-within:border-emerald-300 focus-within:shadow-[0_28px_90px_rgba(16,185,129,0.13)] dark:border-white/10 dark:bg-slate-900/90"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/30 dark:text-white/35" />
                  <span className="sr-only">Conversar sobre uma gíria</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder='Ex.: Meu filho disse “six seven”...'
                    className="h-14 w-full rounded-xl border-0 bg-[#f5f6f4] pl-12 pr-4 text-base outline-none placeholder:text-black/35 focus:bg-white dark:bg-slate-950 dark:placeholder:text-white/35"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Conversar com a IA <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 text-black/45 dark:text-white/45">As pessoas estão perguntando:</span>
              {popularTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => openChat(`O que significa ${term}?`)}
                  className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 font-medium text-black/65 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-white/70"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="relative lg:-mr-8">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-emerald-200/45 via-cyan-100/20 to-violet-200/35 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/40 bg-slate-950 p-3 shadow-[0_38px_120px_rgba(2,6,23,0.30)] sm:p-4">
              <div className="flex items-center justify-between px-3 py-2.5 text-white">
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                    <Bot className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Gíria AI</p>
                    <p className="text-xs text-white/45">Especialista em cultura digital brasileira</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
                </span>
              </div>

              <div className="mt-3 min-h-[520px] rounded-[1.7rem] bg-[#fbfcfb] p-5 text-black sm:p-7">
                <div className="ml-auto max-w-[88%] rounded-[1.4rem] rounded-br-md bg-slate-100 px-5 py-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">Você</p>
                  <p className="mt-2 font-semibold leading-7">“{demo.question}”</p>
                </div>

                <div className="mt-5 flex gap-3">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="min-h-52 flex-1 rounded-[1.4rem] rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                    {demoStep === "reading" ? (
                      <div className="flex h-40 items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.24s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.12s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                        </span>
                        Entendendo o contexto...
                      </div>
                    ) : (
                      <div className="animate-[fadeIn_0.45s_ease-out]">
                        <p className="text-sm font-semibold text-emerald-700">{demo.lead}</p>
                        <p className="mt-3 text-[15px] leading-7 text-slate-700">{demo.answer}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {demo.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Contexto interpretado com base cultural
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openChat(demo.question)}
                  className="mt-6 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-left font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
                >
                  Pergunte qualquer expressão <ArrowRight className="h-4 w-4" />
                </button>
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
