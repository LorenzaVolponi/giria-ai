"use client";

import { useEffect, useState } from "react";
import { SuggestionModerationPanel } from "@/components/product/suggestion-moderation-panel";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dash, setDash] = useState<{
    summary?: { pending: number; approved: number; rejected: number; all: number };
    topIps?: Array<{ ip: string; total: number; approved: number; rejected: number; pending: number; lastAt: number }>;
    recent?: Array<{ id: string; term: string; status: string; score: number; submitterName: string; createdAt?: string }>;
  }>({});

  function getCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)giria_admin_csrf=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  useEffect(() => {
    const boot = async () => {
      const res = await fetch("/api/v1/admin/session", { cache: "no-store" }).catch(() => null);
      if (res?.ok) {
        setOk(true);
        void reloadDashboard();
      }
    };
    void boot();
  }, []);

  async function reloadDashboard() {
    const res = await fetch("/api/v1/admin/dashboard", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => ({}))) as typeof dash;
    setDash(data);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/v1/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login, password, code }),
    }).catch(() => null);
    if (!res?.ok) {
      setMessage("Login inválido.");
      return;
    }
    setOk(true);
    setMessage("Login admin efetuado.");
    void reloadDashboard();
  }

  async function handleLogout() {
    await fetch("/api/v1/admin/session", { method: "DELETE", headers: { "x-csrf-token": getCsrfToken() } }).catch(() => null);
    setOk(false);
    setLogin("");
    setPassword("");
    setCode("");
    setMessage("Sessão encerrada.");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <section className="rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin · Gíria AI</h1>
            <p className="mt-2 text-sm text-slate-200">Centro de controle completo para validação, segurança e operação.</p>
          </div>
          {ok ? <button className="rounded border border-white/30 px-4 py-2 text-sm hover:bg-white/10" type="button" onClick={() => void handleLogout()}>Sair</button> : null}
        </div>
      </section>

      {!ok ? (
        <form className="rounded-xl border p-5 space-y-3 bg-white" onSubmit={handleLogin}>
          <input className="w-full rounded border p-2" placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)} required />
          <input className="w-full rounded border p-2" placeholder="Senha admin" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          <input className="w-full rounded border p-2" placeholder="Código de validação" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button className="rounded bg-black px-4 py-2 text-white" type="submit">Entrar no admin</button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </form>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">Total sugestões</p><p className="text-2xl font-bold">{dash.summary?.all ?? 0}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-amber-600">{dash.summary?.pending ?? 0}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">Aprovadas</p><p className="text-2xl font-bold text-emerald-600">{dash.summary?.approved ?? 0}</p></div>
            <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">Rejeitadas</p><p className="text-2xl font-bold text-rose-600">{dash.summary?.rejected ?? 0}</p></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Top IPs (ingresso de sugestões)</h2>
                <button className="rounded border px-3 py-1 text-xs" type="button" onClick={() => void reloadDashboard()}>Atualizar</button>
              </div>
              <div className="space-y-2 text-sm">
                {(dash.topIps || []).map((ip) => (
                  <div key={ip.ip} className="rounded border p-2">
                    <p className="font-mono text-xs">{ip.ip}</p>
                    <p>Total: <strong>{ip.total}</strong> · Aprov: {ip.approved} · Pend: {ip.pending} · Rej: {ip.rejected}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border bg-white p-4">
              <h2 className="mb-3 font-semibold">Últimas sugestões processadas</h2>
              <div className="space-y-2 text-sm">
                {(dash.recent || []).map((row) => (
                  <div key={row.id} className="rounded border p-2">
                    <p className="font-semibold">{row.term} <span className="text-xs text-muted-foreground">({row.status})</span></p>
                    <p className="text-xs text-muted-foreground">{row.submitterName} · score {row.score.toFixed(2)} · {row.createdAt ? new Date(row.createdAt).toLocaleString("pt-BR") : "-"}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <SuggestionModerationPanel initialPending={[]} initialAuthenticated />
        </>
      )}
    </main>
  );
}
