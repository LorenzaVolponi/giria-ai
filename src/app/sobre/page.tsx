import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  Home,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sobre o Gíria AI",
  description:
    "Conheça o Gíria AI: uma ponte afetiva e segura entre gerações para traduzir gírias, aproximar conversas e fortalecer o diálogo com jovens.",
};

const audiences = [
  {
    title: "Pais e responsáveis",
    description:
      "Para entender melhor o que filhos e adolescentes comunicam, sem transformar curiosidade em vigilância.",
    icon: Users,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    title: "Professores",
    description:
      "Para contextualizar expressões usadas em sala, mediar conflitos e criar conversas educativas com respeito.",
    icon: GraduationCap,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    title: "Jovens",
    description:
      "Para refletir sobre nuances, riscos e sentidos culturais das palavras que circulam nas redes e no cotidiano.",
    icon: Sparkles,
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
  },
  {
    title: "Profissionais",
    description:
      "Para psicólogos, orientadores, comunicadores e equipes que precisam interpretar linguagem jovem com cuidado.",
    icon: HeartHandshake,
    className:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300",
  },
];

const privacyPrinciples = [
  "Não monitoramos conversas privadas.",
  "Não incentivamos espionagem, invasão de privacidade ou controle punitivo.",
  "Não armazenamos mensagens de terceiros nem criamos perfis comportamentais.",
  "Explicamos contexto e riscos para apoiar diálogo, cuidado e educação.",
];

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            asChild
            variant="outline"
            className="border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a home
            </Link>
          </Button>

          <Button
            asChild
            className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Link href="/apoie">
              Apoiar o projeto
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <section className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Uma ponte entre gerações
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Sobre o Gíria AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">
            O Gíria AI traduz gírias e expressões adolescentes para uma
            linguagem clara, adulta e contextualizada — ajudando famílias,
            escolas e profissionais a conversarem com mais empatia.
          </p>
        </section>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="space-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Missão do projeto
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Nossa missão é diminuir ruídos entre gerações. Mais do que
              traduzir palavras, o Gíria AI explica o contexto social, emocional
              e cultural por trás das expressões para que adultos possam se
              aproximar dos jovens com escuta, cuidado e respeito.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Para quem é
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {audiences.map(({ title, description, icon: Icon, className }) => (
                <div key={title} className={`rounded-lg border p-3 ${className}`}>
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    <Icon className="h-4 w-4" />
                    <h3>{title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed opacity-85">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-white dark:border-red-900 dark:bg-gray-900">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Segurança e privacidade
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              O Gíria AI é uma ferramenta educativa de consulta. Ele foi pensado
              para incentivar conversas mais seguras, não para vigiar pessoas.
            </p>
            <div className="space-y-2">
              {privacyPrinciples.map((principle) => (
                <div
                  key={principle}
                  className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950/30"
                >
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {principle}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Quer ajudar essa ponte a chegar mais longe?
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Seu apoio ajuda a manter o projeto gratuito, atualizado e útil
                para mais famílias, escolas e jovens.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/apoie">
                  Apoiar o projeto
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
