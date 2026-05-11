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
  createdAt?: string;
  score: number;
  status: "pending" | "approved" | "rejected";
};

export function SuggestionModerationPanel({ initialPending, initialAuthenticated = false }: { initialPending: SuggestionItem[]; initialAuthenticated?: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [items, setItems] = useState(initialPending);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [minScore, setMinScore] = useState(0);
  const [termQuery, setTermQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<{ pending: number; approved: number; rejected: number; all: number } | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [historyById, setHistoryById] = useState<Record<string, Array<{ status: string; actor: string; at: string; reason?: string }>>>({});
  const pageSize = 12;
  const csrfToken = (() => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|;\s*)giria_admin_csrf=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  })();

  async function reloadPending() {
    setLoading(true);
    const statusParam = statusFilter === "all" ? "all" : statusFilter;
    const qs = new URLSearchParams({
      status: statusParam,
      limit: "120",
      includeSummary: "true",
    });
    if (fromDate) qs.set("from", `${fromDate}T00:00:00.000Z`);
    if (toDate) qs.set("to", `${toDate}T23:59:59.999Z`);
    const res = await fetch(`/api/v1/suggestions?${qs.toString()}`, { cache: "no-store" }).catch(() => null);
    setLoading(false);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => ({}))) as { items?: SuggestionItem[]; summary?: { pending: number; approved: number; rejected: number; all: number } };
    setItems(Array.isArray(data.items) ? data.items : []);
    setSummary(data.summary || null);
  }

  useEffect(() => {
    void reloadPending();
  }, [statusFilter, fromDate, toDate]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, minScore, termQuery, fromDate, toDate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/v1/suggestions/revalidate", { method: "POST", headers: { "x-csrf-token": csrfToken } }).catch(() => null);
  }, [isAuthenticated]);

  useEffect(() => {
    const id = setInterval(() => {
      void reloadPending();
    }, 15000);
    return () => clearInterval(id);
  }, [statusFilter, fromDate, toDate]);

  async function loadHistory(id: string) {
    const res = await fetch(`/api/v1/suggestions/${id}/history`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => ({}))) as { history?: Array<{ status: string; actor: string; at: string; reason?: string }> };
    setHistoryById((prev) => ({ ...prev, [id]: Array.isArray(data.history) ? data.history : [] }));
  }

  async function moderate(id: string, status: "approved" | "rejected") {
    if (!isAuthenticated) return setMessage("Faça login admin para moderar.");
    setBusyId(id);
    setMessage(null);

    const reason = (rejectReasonById[id] || "").trim();
    if (status === "rejected" && !reason) {
      setBusyId(null);
      return setMessage("Informe um motivo para rejeitar.");
    }
    const res = await fetch(`/api/v1/suggestions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify({ status, reason: status === "rejected" ? reason : undefined }),
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

  function exportFilteredCsv() {
    const filtered = items
      .filter((item) => item.score >= minScore)
      .filter((item) => {
        const q = termQuery.trim().toLowerCase();
        if (!q) return true;
        return `${item.term} ${item.meaning} ${item.context || ""} ${item.submitterName}`.toLowerCase().includes(q);
      });
    const headers = ["id", "term", "meaning", "context", "submitterName", "submitterWhatsapp", "submitterEmail", "score", "status", "createdAt"];
    const rows = filtered.map((item) =>
      [item.id, item.term, item.meaning, item.context || "", item.submitterName, item.submitterWhatsapp || "", item.submitterEmail || "", String(item.score), item.status, item.createdAt || ""]
        .map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moderacao-girias-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <input className="rounded border p-2 text-sm" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input className="rounded border p-2 text-sm" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        <p className="rounded border p-2">Carregadas: <strong>{items.length}</strong></p>
        <p className="rounded border p-2">Com score ≥ filtro: <strong>{items.filter((item) => item.score >= minScore).length}</strong></p>
        <p className="rounded border p-2">Busca ativa: <strong>{termQuery.trim() ? "sim" : "não"}</strong></p>
      </div>
      {summary ? (
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
          <p className="rounded border p-2">Pendentes: <strong>{summary.pending}</strong></p>
          <p className="rounded border p-2">Aprovadas: <strong>{summary.approved}</strong></p>
          <p className="rounded border p-2">Rejeitadas: <strong>{summary.rejected}</strong></p>
          <p className="rounded border p-2">Total: <strong>{summary.all}</strong></p>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button className="rounded border px-3 py-1 text-sm" type="button" onClick={() => void reloadPending()} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar sugestões"}
        </button>
        <button className="rounded border px-3 py-1 text-sm" type="button" onClick={exportFilteredCsv}>
          Exportar CSV
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

      {(() => {
        const filtered = items
          .filter((item) => item.score >= minScore)
          .filter((item) => {
            const q = termQuery.trim().toLowerCase();
            if (!q) return true;
            return `${item.term} ${item.meaning} ${item.context || ""} ${item.submitterName}`.toLowerCase().includes(q);
          });
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        const safePage = Math.min(page, totalPages);
        const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

        return (
          <>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {paged.map((item) => (
          <li key={item.id} className="rounded border p-3">
            <p className="font-medium">{item.term}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.meaning}</p>
            {item.context ? <p className="text-xs text-muted-foreground mt-1">Contexto: {item.context}</p> : null}
            <p className="text-xs text-muted-foreground mt-2">{item.submitterName} · score {item.score.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{item.submitterWhatsapp || "WhatsApp não informado"}</p>
            <p className="text-xs text-muted-foreground">{item.submitterEmail || "Email não informado"}</p>
            {item.createdAt ? <p className="text-xs text-muted-foreground">Enviado em: {new Date(item.createdAt).toLocaleString("pt-BR")}</p> : null}
            <div className="mt-3 flex gap-2">
              <button className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-60" disabled={busyId === item.id} onClick={() => moderate(item.id, "approved")}>Aprovar</button>
              <button className="rounded bg-rose-600 px-3 py-1 text-white disabled:opacity-60" disabled={busyId === item.id} onClick={() => moderate(item.id, "rejected")}>Rejeitar</button>
              <button className="rounded border px-3 py-1 text-xs" type="button" onClick={() => void loadHistory(item.id)}>Histórico</button>
            </div>
            <input
              className="mt-2 w-full rounded border p-2 text-xs"
              value={rejectReasonById[item.id] || ""}
              onChange={(e) => setRejectReasonById((prev) => ({ ...prev, [item.id]: e.target.value }))}
              placeholder="Motivo da rejeição (obrigatório para rejeitar)"
            />
            {historyById[item.id]?.length ? (
              <div className="mt-2 rounded border p-2 text-[11px] text-muted-foreground">
                {historyById[item.id].slice(0, 3).map((h) => (
                  <p key={`${h.status}-${h.at}`}>
                    {new Date(h.at).toLocaleString("pt-BR")} · {h.actor} · {h.status}
                    {h.reason ? ` · ${h.reason}` : ""}
                  </p>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>Página {safePage} de {totalPages} · {filtered.length} itens filtrados</p>
        <div className="flex gap-2">
          <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </button>
          <button className="rounded border px-2 py-1 disabled:opacity-50" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Próxima
          </button>
        </div>
      </div>
          </>
        );
      })()}
    </section>
  );
}
