import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { getRadarItems, getRiskLabel } from "@/lib/growth";

export const metadata: Metadata = {
  title: "Radar de Gírias da Semana | Gíria AI",
  description: "Veja gírias brasileiras em alta, termos de TikTok, games, memes, regiões e alertas de contexto para pais e educadores.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/radar` },
};

export default function RadarPage() {
  const radarItems = getRadarItems();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Radar de Gírias da Semana",
            description: "Gírias brasileiras em destaque por contexto de uso.",
            url: `${site}/radar`,
          }),
        }}
      />
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/85 p-6 shadow-xl dark:border-emerald-900 dark:bg-gray-900/80 sm:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
              <TrendingUp className="mr-1 h-3 w-3" /> Radar vivo
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Radar de gírias para entender o que está circulando.</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              Um painel editorial para descobrir gírias por bolha, contexto e risco — pronto para SEO, pais, educadores e comunidade.
            </p>
          </div>
        </section>

        <div className="grid gap-5">
          {radarItems.map((section) => (
            <section key={section.title} className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">{section.emoji}</span>
                <div>
                  <h2 className="text-xl font-black">{section.title}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {section.terms.map((term) => (
                  <Link
                    key={`${section.title}-${term.term}`}
                    href={`/o-que-significa/${encodeURIComponent(term.term)}`}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-black">{term.term}</h3>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                        {getRiskLabel(term.riskLevel)}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{term.meaning}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-900 p-6 text-white shadow-xl dark:border-emerald-800">
          <Sparkles className="mb-3 h-6 w-6 text-yellow-200" />
          <h2 className="text-xl font-black">Quer manter o radar gratuito?</h2>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">Apoios via PIX ajudam a manter o glossário atualizado, monitorar novas expressões e publicar guias para pais e educadores.</p>
          <Link href="/apoie" className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-50">
            Apoiar o Gíria AI
          </Link>
        </section>
      </div>
    </main>
  );
}
