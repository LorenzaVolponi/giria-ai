import type { Metadata } from "next";
import { ApiPlayground } from "@/components/product/api-playground";
import Script from "next/script";
import { SystemHealthCard } from "@/components/product/system-health-card";

export const metadata: Metadata = {
  title: "Diagnóstico | Gíria AI",
  description: "Painel técnico para validar saúde do backend e testar a API de tradução.",
};

export default function DiagnosticoPage() {
  return (
    <>
      <Script id="track-visit" strategy="afterInteractive">{`fetch("/api/v1/visits", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: window.location.pathname }) }).catch(() => null);`}</Script>
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Diagnóstico técnico</h1>
        <p className="text-muted-foreground">Valide rapidamente o estado do backend e a resposta da API v1.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <SystemHealthCard />
        <ApiPlayground />
      </div>
    </main>
    </>
  );
}
