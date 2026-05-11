"use client";

import { useEffect, useState } from "react";
import { SuggestionModerationPanel } from "@/components/product/suggestion-moderation-panel";

export default function AdminPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const res = await fetch("/api/v1/admin/session", { cache: "no-store" }).catch(() => null);
      if (res?.ok) setOk(true);
    };
    void boot();
  }, []);

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
  }

  async function handleLogout() {
    await fetch("/api/v1/admin/session", { method: "DELETE" }).catch(() => null);
    setOk(false);
    setLogin("");
    setPassword("");
    setCode("");
    setMessage("Sessão encerrada.");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin privado</h1>
      <p className="mt-2 text-sm text-muted-foreground">Acesso restrito para validação de sugestões.</p>

      {!ok ? (
        <form className="mt-6 rounded-lg border p-4 space-y-3" onSubmit={handleLogin}>
          <input className="w-full rounded border p-2" placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)} required />
          <input className="w-full rounded border p-2" placeholder="Senha admin" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          <input className="w-full rounded border p-2" placeholder="Código de validação" value={code} onChange={(e) => setCode(e.target.value)} required />
          <button className="rounded bg-black px-4 py-2 text-white" type="submit">Entrar no admin</button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </form>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between rounded border p-3">
            <p className="text-sm text-muted-foreground">Você está autenticada no painel privado.</p>
            <button className="rounded border px-3 py-1 text-sm" type="button" onClick={() => void handleLogout()}>
              Sair
            </button>
          </div>
          <SuggestionModerationPanel initialPending={[]} initialAuthenticated />
        </>
      )}
    </main>
  );
}
