"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Copy, HeartHandshake, Server, Shield, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PIX_KEY = "007aibr@gmail.com";
const PIX_RECEIVER_NAME = "Lorenza Volponi";
const SUPPORT_AMOUNTS = [5, 10, 25, 50];
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
              <p className="text-sm text-emerald-50">Escaneie ou copie a chave.</p>
            </div>
            <CardContent className="space-y-4 p-5 text-center">
              <div className="mx-auto w-fit rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
                <Image src="/pix-qr.svg" alt="QR Code PIX para apoiar o Gíria AI" width={220} height={220} priority />
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Chave PIX</p>
                <p className="mt-1 break-all font-black text-gray-950 dark:text-gray-50">{PIX_KEY}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{PIX_RECEIVER_NAME}</p>
              </div>
              <Button onClick={copyPix} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar chave PIX"}
              </Button>
              {feedback ? <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{feedback}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
