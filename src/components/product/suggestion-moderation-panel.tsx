"use client";

import { useState } from "react";

type SuggestionItem = {
  id: string;
  term: string;
  meaning: string;
  context?: string;
  submitterName: string;
  score: number;
  status: "pending" | "approved" | "rejected";
};

export function SuggestionModerationPanel({ initialPending }: { initialPending: SuggestionItem[] }) {
  const [adminToken, setAdminToken] = useState("");
  const [items, setItems] = useState(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function moderate(id: string, status: "approved" | "rejected") {
    if (!adminToken) return setMessage("Informe o token admin para moderar.");
    setBusyId(id);
    setMessage(null);

    const res = await fetch(`/api/v1/suggestions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-token": adminToken },
      body: JSON.stringify({ status }),
    }).catch(() => null);

    setBusyId(null);
    if (!res) return setMessage("Erro de rede ao moderar.");

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setMessage(data?.error || "Falha ao moderar item.");
    }

    setItems((prev) => prev.filter((x) => x.id !== id));
    setMessage(`Sugestão ${status === "approved" ? "aprovada" : "rejeitada"} com sucesso.`);
  }

  return (
    <section className="mt-8 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Moderação manual (admin)</h3>
      <p className="text-sm text-muted-foreground mt-1">Use o token admin para aprovar/rejeitar sugestões pendentes.</p>

      <input
        className="mt-3 w-full rounded border p-2"
        placeholder="ADMIN_API_TOKEN"
        value={adminToken}
        onChange={(e) => setAdminToken(e.target.value)}
        type="password"
      />

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded border p-3">
            <p className="font-medium">{item.term}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.meaning}</p>
            <p className="text-xs text-muted-foreground mt-2">{item.submitterName} · score {item.score.toFixed(2)}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-60" disabled={busyId === item.id} onClick={() => moderate(item.id, "approved")}>Aprovar</button>
              <button className="rounded bg-rose-600 px-3 py-1 text-white disabled:opacity-60" disabled={busyId === item.id} onClick={() => moderate(item.id, "rejected")}>Rejeitar</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
