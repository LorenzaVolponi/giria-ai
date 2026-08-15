import type { Metadata } from "next";
import Link from "next/link";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Sobre e metodologia",
  description:
    "Conheça o propósito, a metodologia editorial e os limites de interpretação do Gíria AI, dicionário de gírias e cultura digital brasileira.",
  alternates: { canonical: `${site}/sobre` },
  openGraph: {
    title: "Sobre e metodologia | Gíria AI",
    description:
      "Como o Gíria AI organiza significado, contexto, origem, variações e exemplos para explicar a linguagem digital brasileira.",
    url: `${site}/sobre`,
    type: "website",
  },
};

const method = [
  {
    title: "Significado primeiro",
    text: "A explicação começa pelo sentido mais útil do termo em português claro, evitando transformar uma gíria em definição acadêmica rígida.",
  },
  {
    title: "Contexto importa",
    text: "O mesmo termo pode funcionar como elogio, ironia, provocação, meme ou alerta dependendo de quem fala, da comunidade e da situação.",
  },
  {
    title: "Exemplos para interpretar",
    text: "Quando disponíveis, exemplos mostram como a expressão aparece em uma frase e ajudam a separar significado literal de intenção social.",
  },
  {
    title: "Variação regional e digital",
    text: "Região, plataforma, geração e comunidade podem mudar o sentido. Por isso, o Gíria AI organiza também origem, variações e recortes regionais quando registrados.",
  },
];

export default function SobrePage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre e metodologia do Gíria AI",
    url: `${site}/sobre`,
    inLanguage: "pt-BR",
    description:
      "Metodologia editorial do Gíria AI para explicar gírias brasileiras, memes, regionalismos e linguagem da internet com contexto.",
    isPartOf: { "@type": "WebSite", name: "Gíria AI", url: site },
    about: {
      "@type": "Organization",
      name: "Gíria AI",
      url: site,
      description:
        "Projeto de educação e cultura digital que explica gírias brasileiras, memes, regionalismos e linguagem da internet.",
    },
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7f8fb_100%)] px-4 py-10 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />

      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-10">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Sobre o Gíria AI
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
            Linguagem muda rápido. Contexto impede tradução errada.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            O Gíria AI é um dicionário inteligente de gírias e cultura digital brasileira. O objetivo é explicar expressões
            de forma clara, contextualizada e útil para quem encontrou um termo em uma conversa, meme, vídeo, jogo,
            escola, rede social ou comunidade regional.
          </p>
        </section>

        <section className="mt-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Metodologia editorial</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Como uma expressão é explicada</h2>
            <p className="mt-3 leading-7 text-slate-600">
              As fichas do Gíria AI são estruturadas para separar o que a palavra pode significar do modo como ela é usada.
              Dependendo do termo, a página pode registrar significado, tradução em português claro, contexto, exemplo,
              origem, variações, região e status de popularidade.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {method.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Transparência</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">O que o Gíria AI não promete</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Gírias não possuem um significado universal e permanente. Uma explicação pode mudar conforme época,
              plataforma, região, grupo social e intenção. O conteúdo é educativo e deve ser lido junto com o contexto real
              da conversa.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Comunidade</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">A língua também vem de quem usa</h2>
            <p className="mt-3 leading-7 text-slate-300">
              O projeto possui uma área para sugestões de gírias enviadas por usuários. As contribuições públicas ampliam
              a cobertura do dicionário sem substituir a necessidade de contexto e revisão.
            </p>
            <Link href="/girias/enviadas-por-usuarios" className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">
              Ver sugestões da comunidade
            </Link>
          </article>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Comece pelo que você ouviu</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-700">
            Se você chegou aqui tentando entender uma palavra específica, use a busca de significados. Para explorar por
            tema, geração, rede social ou região, navegue pelos guias e pelo dicionário.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/o-que-significa" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Buscar significado
            </Link>
            <Link href="/guias" className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700">
              Explorar guias
            </Link>
            <Link href="/girias/regionais" className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-emerald-700">
              Ver gírias regionais
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
