import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o Gíria AI",
  description: "Conheça o propósito do Gíria AI e como ele ajuda a traduzir linguagem adolescente com clareza.",
};

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Sobre o Gíria AI</h1>
      <p className="mt-4 text-muted-foreground">O Gíria AI traduz gírias e expressões adolescentes para linguagem clara, adulta e contextualizada.</p>
    </main>
  );
}
