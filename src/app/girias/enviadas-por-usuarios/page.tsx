import type { Metadata } from "next";
import { listSuggestionsByStatus } from "@/lib/suggestion-pipeline";
import { UserSuggestionForm } from "@/components/product/user-suggestion-form";
import { SuggestionModerationPanel } from "@/components/product/suggestion-moderation-panel";

export const metadata: Metadata = {
  title: "Enviadas por usuários | Gíria AI",
  description: "Lista de gírias sugeridas e validadas automaticamente pela comunidade.",
};

export default async function UserSubmittedSlangsPage() {
  const [approved, pending] = await Promise.all([listSuggestionsByStatus("approved", 200), listSuggestionsByStatus("pending", 80)]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Enviadas por usuários</h1>
      <p className="mt-3 text-muted-foreground">Fluxo completo: envio, validação automática, score de confiança e publicação das aprovadas.</p>

      <div className="mt-6"><UserSuggestionForm /></div>

      <SuggestionModerationPanel initialPending={pending as Array<{ id: string; term: string; meaning: string; context?: string; submitterName: string; score: number; status: "pending" | "approved" | "rejected" }>} />
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Aguardando validação ({pending.length})</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {pending.map((item) => (
            <li key={item.id} className="rounded-lg border p-4 border-amber-300/60">
              <p className="font-semibold">{item.term}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.meaning}</p>
              {item.context ? <p className="mt-2 text-xs text-muted-foreground">Contexto: {item.context}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">Enviado por: {item.submitterName} · score {item.score.toFixed(2)} · status {item.status}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Aprovadas ({approved.length})</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {approved.map((item) => (
            <li key={item.id} className="rounded-lg border p-4">
              <p className="font-semibold">{item.term}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.meaning}</p>
              {item.context ? <p className="mt-2 text-xs text-muted-foreground">Contexto: {item.context}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">Enviado por: {item.submitterName} · score {item.score.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
