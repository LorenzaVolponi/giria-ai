import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { getSuggestionStatusCounts, listSuggestionsByStatus } from "@/lib/suggestion-pipeline";
import { UserSuggestionForm } from "@/components/product/user-suggestion-form";

export const metadata: Metadata = {
  title: "Comunidade de gírias | Gíria AI",
  description: "Envie gírias brasileiras, acompanhe sugestões aprovadas e ajude o glossário vivo do Gíria AI a crescer.",
};

export default async function UserSubmittedSlangsPage() {
  const [approved, counts] = await Promise.all([
    listSuggestionsByStatus("approved", 200),
    getSuggestionStatusCounts(),
  ]);
  const topApproved = [...approved].sort((a, b) => b.score - a.score).slice(0, 6);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/85 p-6 shadow-xl dark:border-emerald-900 dark:bg-gray-900/80 sm:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_260px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                <Users className="mr-1 h-3 w-3" /> Comunidade Gíria AI
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Ajude a mapear o português vivo da internet.</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                Envie uma gíria, expressão ou meme que você viu por aí. O pipeline valida, pontua e publica o que fizer sentido para o glossário.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{counts.approved}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">aprovadas</p>
              </div>
              <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/30">
                <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">{counts.pending}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">em análise</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                <h2 className="font-black">Enviar nova gíria</h2>
              </div>
              <UserSuggestionForm />
            </div>
            <div className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50/70 p-5 dark:border-cyan-900 dark:bg-cyan-950/20">
              <ShieldCheck className="mb-2 h-6 w-6 text-cyan-700 dark:text-cyan-300" />
              <h2 className="font-black">Como a validação funciona</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                O envio passa por filtros básicos, sinais de confiança e moderação. Quanto melhor o contexto, maior a chance de virar card público.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {topApproved.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                  <h2 className="text-xl font-black">Top validadas</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topApproved.map((item, index) => (
                    <article key={item.id} className="rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white p-4 shadow-sm dark:border-yellow-900/60 dark:from-yellow-950/20 dark:to-gray-900">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200">#{index + 1}</span>
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">score {item.score.toFixed(2)}</span>
                      </div>
                      <h3 className="text-lg font-black">{item.term}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.meaning}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                <h2 className="text-xl font-black">Aprovadas pela comunidade ({approved.length})</h2>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {approved.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black">{item.term}</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.meaning}</p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {item.score.toFixed(2)}
                      </span>
                    </div>
                    {item.context ? <p className="mt-3 rounded-xl bg-gray-50 p-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">Contexto: {item.context}</p> : null}
                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Enviado por: {item.submitterName}</p>
                  </li>
                ))}
              </ul>
              {approved.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                  <p className="font-bold">Ainda não há gírias aprovadas.</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Envie uma sugestão e ajude a comunidade começar.</p>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
