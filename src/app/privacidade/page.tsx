import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Gíria AI",
  description: "Saiba como o Gíria AI trata dados e histórico de uso.",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="mt-4 text-muted-foreground">O histórico de busca é salvo localmente no seu navegador para melhorar sua experiência.</p>
    </main>
  );
}
