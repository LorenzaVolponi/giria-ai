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
    alerts?: Array<{ level: "info" | "warning" | "critical"; code: string; message: string }>;
    recent?: Array<{ id: string; term: string; status: string; score: number; submitterName: string; createdAt?: string }>;
  }>({});
  const [metrics, setMetrics] = useState<{
    chatGrounding?: {
      total: number;
      grounded: number;
      unresolved: number;
      groundedRate: number;
      unresolvedRate: number;
      series?: Array<{ ts: string; total: number; grounded: number; unresolved: number }>;
    };
    chatFeedback?: {
      up: number;
      down: number;
      total: number;
      approvalRate: number;
      reasons?: Record<string, number>;
    };
    slo?: {
      status?: {
        groundedRateOk: boolean;
        unresolvedRateOk: boolean;
        feedbackApprovalRateOk: boolean;
      };
    };
  }>({});
  const [metricsWindow, setMetricsWindow] = useState<"15" | "60" | "1440" | "10080">("60");

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

  async function reloadDashboard(windowOverride?: typeof metricsWindow) {
    const selectedWindow = windowOverride ?? metricsWindow;
    const res = await fetch("/api/v1/admin/dashboard", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => ({}))) as typeof dash;
    setDash(data);

    const metricsRes = await fetch(`/api/v1/metrics?window=${selectedWindow}`, { cache: "no-store" }).catch(() => null);
    if (metricsRes?.ok) {
      const metricsData = (await metricsRes.json().catch(() => ({}))) as typeof metrics;
      setMetrics(metricsData);
    }
  }

  useEffect(() => {
    if (!ok) return;
    void reloadDashboard(metricsWindow);
  }, [metricsWindow, ok]);

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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">Feedback positivo (%)</p>
              <p className="text-2xl font-bold text-emerald-600">{metrics.chatFeedback?.approvalRate ?? 0}%</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">Feedback total</p>
              <p className="text-2xl font-bold">{metrics.chatFeedback?.total ?? 0}</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">👍 Sim</p>
              <p className="text-2xl font-bold">{metrics.chatFeedback?.up ?? 0}</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">👎 Não</p>
              <p className="text-2xl font-bold">{metrics.chatFeedback?.down ?? 0}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">Chat grounded (%)</p>
              <p className="text-2xl font-bold text-emerald-600">{metrics.chatGrounding?.groundedRate ?? 0}%</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">Chat unresolved (%)</p>
              <p className="text-2xl font-bold text-amber-600">{metrics.chatGrounding?.unresolvedRate ?? 0}%</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">Grounded</p>
              <p className="text-2xl font-bold">{metrics.chatGrounding?.grounded ?? 0}</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-muted-foreground">Unresolved</p>
              <p className="text-2xl font-bold">{metrics.chatGrounding?.unresolved ?? 0}</p>
            </div>
          </div>
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold">SLO de qualidade do chat</h2>
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Grounded rate</p>
                <p className={metrics.slo?.status?.groundedRateOk ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                  {metrics.slo?.status?.groundedRateOk ? "OK" : "Abaixo da meta"}
                </p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Unresolved rate</p>
                <p className={metrics.slo?.status?.unresolvedRateOk ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                  {metrics.slo?.status?.unresolvedRateOk ? "OK" : "Acima da meta"}
                </p>
              </div>
              <div className="rounded border p-2">
                <p className="text-xs text-muted-foreground">Feedback approval</p>
                <p className={metrics.slo?.status?.feedbackApprovalRateOk ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                  {metrics.slo?.status?.feedbackApprovalRateOk ? "OK" : "Abaixo da meta"}
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold">Motivos de feedback (chat)</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(metrics.chatFeedback?.reasons || {}).length === 0 ? (
                <p className="text-muted-foreground text-xs">Sem motivos registrados ainda.</p>
              ) : (
                Object.entries(metrics.chatFeedback?.reasons || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between rounded border p-2">
                      <span className="text-xs">{reason}</span>
                      <strong>{count}</strong>
                    </div>
                  ))
              )}
            </div>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border bg-white p-4 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">Tendência de grounding (últimos registros)</h2>
                <select
                  className="rounded border px-2 py-1 text-xs"
                  value={metricsWindow}
                  onChange={(e) => {
                    const next = e.target.value as typeof metricsWindow;
                    setMetricsWindow(next);
                    void reloadDashboard(next);
                  }}
                >
                  <option value="15">15 min</option>
                  <option value="60">1 hora</option>
                  <option value="1440">24 horas</option>
                  <option value="10080">7 dias</option>
                </select>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(metrics.chatGrounding?.series || []).slice(-8).map((point) => {
                  const rate = point.total > 0 ? Math.round((point.grounded / point.total) * 100) : 0;
                  return (
                    <div key={point.ts} className="rounded border p-2">
                      <p className="text-[11px] text-muted-foreground">{new Date(point.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-sm font-semibold">{rate}% grounded</p>
                      <div className="mt-1 h-2 w-full rounded bg-slate-100">
                        <div className="h-2 rounded bg-emerald-500" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
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
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold">Alertas operacionais</h2>
            <div className="space-y-2 text-sm">
              {(dash.alerts || []).map((a) => (
                <p key={a.code} className={`rounded border p-2 ${a.level === "critical" ? "border-rose-300 bg-rose-50" : a.level === "warning" ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}>
                  <strong>{a.level.toUpperCase()}</strong> · {a.message}
                </p>
              ))}
            </div>
            <h3 className="mt-4 mb-2 font-semibold">Últimos eventos de auditoria</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              {auditPreview.map((e, idx) => (
                <p key={`${e.at}-${idx}`}>{new Date(e.at).toLocaleString("pt-BR")} · {e.action} · {e.ip || "sem-ip"}</p>
              ))}
            </div>
          </section>
          <SuggestionModerationPanel initialPending={[]} initialAuthenticated />
        </>
      )}
    </main>
  );
}
