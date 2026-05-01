import type { Metadata } from "next";
import { listApprovedSuggestions } from "@/lib/suggestion-pipeline";

export const metadata: Metadata = {
  title: "Enviadas por usuários | Gíria AI",
  description: "Lista de gírias sugeridas e validadas automaticamente pela comunidade.",
};

export default async function UserSubmittedSlangsPage() {
  const items = await listApprovedSuggestions(200);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Enviadas por usuários</h1>
      <p className="mt-3 text-muted-foreground">Gírias aprovadas pela automação e sincronizadas para evitar inconsistências.</p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border p-4">
            <p className="font-semibold">{item.term}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.meaning}</p>
            {item.context ? <p className="mt-2 text-xs text-muted-foreground">Contexto: {item.context}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">Enviado por: {item.submitterName} · score {item.score.toFixed(1)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
