"use client";

import Link from "next/link";
import { Check, Copy, HeartHandshake, KeyRound, Server, Shield, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IMPACT_METRICS, PIX_KEY, PIX_RECEIVER_NAME, SUPPORT_AMOUNTS, SUPPORT_MURAL, SUPPORT_TIERS, getSupportProgress } from "@/lib/support";
const IMPACT_ITEMS = [
  {
    title: "Servidor e banco de dados",
    description: "Ajuda a manter a busca, o glossário e as páginas públicas disponíveis.",
    icon: Server,
  },
  {
    title: "Glossário sempre vivo",
    description: "Permite revisar novas gírias, variações regionais e termos que surgem nas redes.",
    icon: Sparkles,
  },
  {
    title: "Segurança e privacidade",
    description: "Financia melhorias para manter a experiência educativa, responsável e sem vigilância.",
    icon: Shield,
  },
];

export function ApoieClient() {
  const progress = getSupportProgress();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const track = useCallback((path: string) => {
    void fetch("/api/v1/visits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => null);
  }, []);

  const copyPix = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setFeedback("Chave PIX copiada. Obrigado por fortalecer o projeto 💚");
      track("/sponsor/apoie-pix-copy");
      setTimeout(() => setCopied(false), 1800);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setCopied(false);
      setFeedback("Não foi possível copiar automaticamente. Copie a chave exibida abaixo.");
      setTimeout(() => setFeedback(null), 3000);
    }
  }, [track]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/85 p-6 text-center shadow-xl dark:border-emerald-900 dark:bg-gray-900/80 sm:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <Badge className="mb-4 border-0 bg-emerald-600 text-white hover:bg-emerald-700">
              <HeartHandshake className="mr-1 h-3 w-3" /> Apoie o projeto
            </Badge>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Ajude o Gíria AI a continuar gratuito.</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              Sua contribuição mantém o tradutor online, atualiza o glossário de gírias brasileiras e apoia uma ferramenta educativa feita no Brasil.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUPPORT_AMOUNTS.map((amount) => (
                <span key={amount} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                  R$ {amount}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-yellow-200 bg-white shadow-xl dark:border-yellow-900 dark:bg-gray-900">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 sm:p-8">
              <Badge className="mb-4 border-0 bg-yellow-400 text-yellow-950 hover:bg-yellow-300">
                <Trophy className="mr-1 h-3 w-3" /> Campanha do mês
              </Badge>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{progress.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{progress.description}</p>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>R$ {progress.current} arrecadados</span>
                  <span>{progress.percent}% da meta</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-yellow-100 dark:bg-yellow-950/50">
                  <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-emerald-400 to-teal-500" style={{ width: `${progress.percent}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Faltam R$ {progress.remaining} para bater a meta de R$ {progress.goal} em {progress.period}.</p>
              </div>
            </div>
            <div className="grid gap-3 bg-gradient-to-br from-emerald-900 to-teal-800 p-6 text-white sm:grid-cols-3 lg:grid-cols-1">
              {IMPACT_METRICS.map((metric) => (
                <div key={metric.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                  <p className="text-2xl font-black text-yellow-200">{metric.value}</p>
                  <p className="text-sm font-bold">{metric.label}</p>
                  <p className="text-xs text-emerald-50/80">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT_TIERS.map((tier) => (
            <button
              key={tier.name}
              type="button"
              onClick={copyPix}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">R$ {tier.amount}</span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
              <h2 className="font-black">{tier.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{tier.description}</p>
            </button>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {IMPACT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-emerald-100 bg-white/90 dark:border-gray-800 dark:bg-gray-900">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <Card className="h-fit overflow-hidden border-emerald-200 bg-white shadow-xl dark:border-emerald-900 dark:bg-gray-900">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-4 text-white">
              <h2 className="text-xl font-black">PIX do projeto</h2>
              <p className="text-sm text-emerald-50">Sem QR Code: copie a chave e cole no app do banco.</p>
            </div>
            <CardContent className="space-y-4 p-5 text-center">
              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-yellow-50 p-5 text-left shadow-sm dark:border-emerald-900 dark:from-emerald-950/40 dark:to-yellow-950/10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-300">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Chave PIX</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Copie, cole no banco e escolha o valor.</p>
                  </div>
                </div>
                <p className="break-all rounded-2xl bg-white p-3 text-sm font-black text-gray-950 ring-1 ring-emerald-100 dark:bg-gray-950 dark:text-gray-50 dark:ring-emerald-900">{PIX_KEY}</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Recebedora: {PIX_RECEIVER_NAME}</p>
              </div>
              <div className="grid gap-2 text-left text-xs text-gray-600 dark:text-gray-400">
                <p className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800"><strong>1.</strong> Clique em copiar chave PIX.</p>
                <p className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800"><strong>2.</strong> Abra seu app do banco e cole em PIX copia e cola.</p>
                <p className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-800"><strong>3.</strong> Qualquer valor fortalece servidor, glossário e radar.</p>
              </div>
              <Button onClick={copyPix} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar chave PIX"}
              </Button>
              {feedback ? <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{feedback}</p> : null}
            </CardContent>
          </Card>
        </div>

        <section className="rounded-[2rem] border border-emerald-100 bg-white/90 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Mural de quem fortalece</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Espaço simbólico para mostrar que o projeto cresce com a comunidade.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT_MURAL.map((supporter) => (
              <article key={supporter.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{supporter.badge}</p>
                <h3 className="mt-2 font-black">{supporter.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">“{supporter.message}”</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
