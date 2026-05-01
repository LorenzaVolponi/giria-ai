"use client";

import { useState } from "react";

export function UserSuggestionForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [context, setContext] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await fetch("/api/v1/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, contact, term, meaning, context }),
    }).catch(() => null);

    setLoading(false);
    if (!res) {
      setStatus("Erro de rede. Tente novamente.");
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(data?.error || "Não foi possível enviar a sugestão.");
      return;
    }

    setStatus("Sugestão enviada e validada com sucesso!");
    setTerm("");
    setMeaning("");
    setContext("");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border p-4 space-y-3">
      <h2 className="text-lg font-semibold">Enviar sugestão de gíria</h2>
      <input className="w-full rounded border p-2" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="w-full rounded border p-2" placeholder="Seu contato (email/telefone)" value={contact} onChange={(e) => setContact(e.target.value)} required />
      <input className="w-full rounded border p-2" placeholder="Gíria" value={term} onChange={(e) => setTerm(e.target.value)} required />
      <input className="w-full rounded border p-2" placeholder="Significado" value={meaning} onChange={(e) => setMeaning(e.target.value)} required />
      <textarea className="w-full rounded border p-2" placeholder="Contexto de uso (opcional)" value={context} onChange={(e) => setContext(e.target.value)} rows={3} />
      <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Enviando..." : "Enviar"}
      </button>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
