import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, HeartHandshake, MessageCircle, Shield, Sparkles, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre o Gíria AI",
  description:
    "Conheça a missão do Gíria AI: traduzir gírias brasileiras, memes e linguagem jovem com contexto, segurança e respeito.",
};

const pillars = [
  {
    title: "Contexto antes de julgamento",
    description: "Cada gíria é explicada com significado, uso social, risco e orientação prática.",
    icon: MessageCircle,
  },
  {
    title: "Privacidade e segurança",
    description: "O projeto não monitora conversas privadas e não incentiva vigilância de adolescentes.",
    icon: Shield,
  },
  {
    title: "Dicionário vivo",
    description: "A linguagem muda rápido; por isso, comunidade e revisão contínua ajudam o glossário crescer.",
    icon: Sparkles,
  },
];

const audiences = [
  "Pais e responsáveis que querem conversar melhor, sem abordagem policialesca.",
  "Professores, orientadores e psicólogos que precisam traduzir contexto cultural.",
  "Jovens que querem entender nuances, riscos e variações das expressões que usam.",
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/85 p-6 text-center shadow-xl dark:border-emerald-900 dark:bg-gray-900/80 sm:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Uma ponte entre gerações e a linguagem da internet.</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              O Gíria AI traduz gírias brasileiras, memes e expressões jovens para uma linguagem clara,
              adulta e contextualizada — sem invadir privacidade, sem pânico moral e sem julgamento.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{pillar.description}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <h2 className="text-xl font-black">Para quem o projeto existe</h2>
            </div>
            <ul className="space-y-3">
              {audiences.map((item) => (
                <li key={item} className="rounded-2xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-900 to-teal-800 p-6 text-white shadow-xl dark:border-emerald-800">
            <HeartHandshake className="mb-3 h-8 w-8 text-yellow-200" />
            <h2 className="text-xl font-black">Apoie para manter gratuito</h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
              Sua ajuda mantém servidor, revisão de gírias e melhorias de segurança do Gíria AI.
            </p>
            <Link
              href="/apoie"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-800 transition hover:bg-emerald-50"
            >
              Apoiar via PIX
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
