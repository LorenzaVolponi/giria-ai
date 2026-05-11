"use client";

import { useEffect, useState } from "react";

type SuggestionItem = {
  id: string;
  term: string;
  meaning: string;
  context?: string;
  submitterName: string;
  submitterWhatsapp?: string;
  submitterEmail?: string;
  score: number;
  status: "pending" | "approved" | "rejected";
};

export function SuggestionModerationPanel({ initialPending, initialAuthenticated = false }: { initialPending: SuggestionItem[]; initialAuthenticated?: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [items, setItems] = useState(initialPending);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [minScore, setMinScore] = useState(0);
  const [termQuery, setTermQuery] = useState("");

  async function reloadPending() {
    setLoading(true);
    const statusParam = statusFilter === "all" ? "all" : statusFilter;
    const res = await fetch(`/api/v1/suggestions?status=${statusParam}&limit=120`, { cache: "no-store" }).catch(() => null);
    setLoading(false);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => ({}))) as { items?: SuggestionItem[] };
    setItems(Array.isArray(data.items) ? data.items : []);
  }

  useEffect(() => {
    void reloadPending();
  }, [statusFilter]);

  useEffect(() => {
    const id = setInterval(() => {
      void reloadPending();
    }, 15000);
    return () => clearInterval(id);
  }, [statusFilter]);

  async function moderate(id: string, status: "approved" | "rejected") {
    if (!isAuthenticated) return setMessage("Faça login admin para moderar.");
    setBusyId(id);
    setMessage(null);

    const res = await fetch(`/api/v1/suggestions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => null);

    setBusyId(null);
    if (!res) return setMessage("Erro de rede ao moderar.");
    if (res.status === 401) {
      setIsAuthenticated(false);
      return setMessage("Sessão expirada. Faça login novamente.");
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setMessage(data?.error || "Falha ao moderar item.");
    }

    setMessage(`Sugestão ${status === "approved" ? "aprovada" : "rejeitada"} com sucesso.`);
    await reloadPending();
  }

  return (
    <section className="mt-8 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Moderação manual (admin)</h3>
      <p className="text-sm text-muted-foreground mt-1">Sessão admin ativa via /admin com cookie HttpOnly.</p>
      {!isAuthenticated ? <p className="mt-3 rounded border p-2 text-sm">Faça login em <strong>/admin</strong> para liberar a moderação.</p> : null}
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <select className="rounded border p-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovadas</option>
          <option value="rejected">Rejeitadas</option>
          <option value="all">Todas</option>
        </select>
        <input className="rounded border p-2 text-sm" type="number" min={0} max={1} step={0.05} value={minScore} onChange={(e) => setMinScore(Number(e.target.value) || 0)} placeholder="Score mínimo" />
        <input className="rounded border p-2 text-sm md:col-span-2" value={termQuery} onChange={(e) => setTermQuery(e.target.value)} placeholder="Buscar por gíria, contexto ou submitter" />
      </div>

      <button className="mt-3 rounded border px-3 py-1 text-sm" type="button" onClick={() => void reloadPending()} disabled={loading}>
        {loading ? "Atualizando..." : "Atualizar pendentes"}
      </button>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items
          .filter((item) => item.score >= minScore)
          .filter((item) => {
            const q = termQuery.trim().toLowerCase();
            if (!q) return true;
            return `${item.term} ${item.meaning} ${item.context || ""} ${item.submitterName}`.toLowerCase().includes(q);
          })
          .map((item) => (
          <li key={item.id} className="rounded border p-3">
            <p className="font-medium">{item.term}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.meaning}</p>
            <p className="text-xs text-muted-foreground mt-2">{item.submitterName} · score {item.score.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{item.submitterWhatsapp || "WhatsApp não informado"}</p>
            <p className="text-xs text-muted-foreground">{item.submitterEmail || "Email não informado"}</p>
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
