import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Apoie o Gíria AI",
  description:
    "Ajude a manter o Gíria AI gratuito e o glossário atualizado com novas gírias brasileiras.",
  alternates: {
    canonical: "/apoie",
  },
};

const impactMessages = [
  "Ajude a manter o Gíria AI gratuito.",
  "Sua contribuição mantém o glossário atualizado com novas gírias brasileiras.",
  "Apoie uma ferramenta educativa feita no Brasil.",
  "Com R$ 5 você ajuda a manter o projeto online.",
];

const fundedItems = [
  "Servidor e banco de dados.",
  "Revisão de novas gírias.",
  "Melhorias de segurança e privacidade.",
  "Novos recursos para pais e educadores.",
];

export default function ApoiePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-10 text-gray-900 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:border-emerald-900 dark:bg-gray-900/80 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Gíria AI
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900 dark:bg-gray-900">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 text-white sm:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Apoie o Gíria AI
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Ajude uma ferramenta educativa brasileira a continuar traduzindo a linguagem jovem com contexto, cuidado e responsabilidade.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {impactMessages.map((message) => (
                <div
                  key={message}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"
                >
                  <p className="text-sm font-semibold leading-6 text-emerald-800 dark:text-emerald-200">
                    {message}
                  </p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                O que sua ajuda financia
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {fundedItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-gray-50 p-4 text-center dark:bg-gray-950/60">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Contribua via PIX
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                🔑 <strong>007aibr@gmail.com</strong> · Lorenza Volponi
              </p>
              <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-xl border border-emerald-200 bg-white text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-gray-900 dark:text-emerald-300">
                QR PIX
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
