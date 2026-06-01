import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, MessageCircleQuestion, ShieldAlert } from "lucide-react";
import { getRadarItems, getRankingTerms } from "@/lib/growth";

type Publico = "pais" | "professores" | "criadores";

const GUIDES: Record<Publico, {
  title: string;
  eyebrow: string;
  description: string;
  promises: string[];
  questions: string[];
}> = {
  pais: {
    eyebrow: "Guia para pais e responsáveis",
    title: "Como entender gírias de adolescentes sem pânico e sem julgamento",
    description: "Um guia direto para interpretar linguagem jovem, memes, comentários e mensagens com contexto antes de tirar conclusões.",
    promises: ["Separar gíria leve de alerta real", "Abrir conversa sem interrogatório", "Usar exemplos para educar com calma"],
    questions: ["Essa gíria é ofensiva ou só meme?", "Em qual grupo ela apareceu?", "A frase indica brincadeira, pressão social ou risco?"],
  },
  professores: {
    eyebrow: "Guia para professores",
    title: "Gírias em sala de aula: contexto cultural, convivência e letramento digital",
    description: "Use o vocabulário jovem como ponte para discutir comunicação, cidadania digital, bullying, regionalismos e interpretação de texto.",
    promises: ["Transformar curiosidade em atividade", "Explicar contexto sem constranger alunos", "Mapear termos que merecem atenção"],
    questions: ["A turma usa isso como humor ou ataque?", "O termo tem variação regional?", "Vale uma conversa coletiva sobre respeito?"],
  },
  criadores: {
    eyebrow: "Guia para criadores e marcas",
    title: "Como usar gírias brasileiras sem parecer forçado",
    description: "Entenda tom, contexto, risco e timing antes de colocar gírias em posts, roteiros, anúncios e respostas de comunidade.",
    promises: ["Evitar cringe de marca", "Checar risco e duplo sentido", "Encontrar termos com potencial de conteúdo"],
    questions: ["A gíria combina com a comunidade?", "O termo ainda está vivo ou já saturou?", "Existe risco de apropriação ou mal-entendido?"],
  },
};

interface Props {
  params: Promise<{ publico: string }>;
}

function getGuide(publico: string) {
  if (publico === "pais" || publico === "professores" || publico === "criadores") return GUIDES[publico];
  return null;
}

export function generateStaticParams() {
  return Object.keys(GUIDES).map((publico) => ({ publico }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publico } = await params;
  const guide = getGuide(publico);
  if (!guide) return { title: "Guia não encontrado | Gíria AI" };
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  return {
    title: `${guide.eyebrow} | Gíria AI`,
    description: guide.description,
    alternates: { canonical: `${site}/guias/${publico}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${site}/guias/${publico}`,
      type: "article",
      locale: "pt_BR",
    },
  };
}

export default async function GuiaPublicoPage({ params }: Props) {
  const { publico } = await params;
  const guide = getGuide(publico);
  if (!guide) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const hotTerms = getRankingTerms(6);
  const radar = getRadarItems().slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            inLanguage: "pt-BR",
            mainEntityOfPage: `${site}/guias/${publico}`,
            about: ["gírias brasileiras", "linguagem jovem", guide.eyebrow],
          }),
        }}
      />
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/90 p-6 shadow-xl dark:border-emerald-900 dark:bg-gray-900 sm:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{guide.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{guide.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">{guide.description}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {guide.promises.map((promise) => (
            <article key={promise} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              <h2 className="font-black">{promise}</h2>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <MessageCircleQuestion className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-black">Perguntas antes de reagir</h2>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {guide.questions.map((question) => (
                <li key={question} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">{question}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.5rem] border border-yellow-200 bg-yellow-50 p-6 shadow-sm dark:border-yellow-900 dark:bg-yellow-950/20">
            <ShieldAlert className="mb-3 h-6 w-6 text-yellow-700 dark:text-yellow-300" />
            <h2 className="text-xl font-black">Regra de ouro</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Gíria isolada não é diagnóstico. O Gíria AI mostra significado, risco e contexto para ajudar a perguntar melhor — não para vigiar ou rotular alguém.
            </p>
          </article>
        </section>

        <section className="rounded-[1.5rem] border border-emerald-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-black">Comece por termos com alta busca</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hotTerms.map((term) => (
              <Link key={term.term} href={`/o-que-significa/${encodeURIComponent(term.term)}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-emerald-950/30">
                <h3 className="font-black">{term.term}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{term.meaning}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {radar.map((item) => (
            <Link key={item.title} href="/radar" className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-emerald-950/30">
              <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
              <h3 className="mt-2 font-black">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{item.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
