"use client";

import { useMemo, useState } from "react";

export function UserSuggestionForm() {
  const [submitterName, setSubmitterName] = useState("");
  const [submitterWhatsapp, setSubmitterWhatsapp] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [term, setTerm] = useState("");
  const [meaning, setMeaning] = useState("");
  const [context, setContext] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const legacyContact = useMemo(() => submitterEmail || submitterWhatsapp, [submitterEmail, submitterWhatsapp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      submitterName,
      submitterWhatsapp,
      submitterContact: submitterWhatsapp,
      submitterEmail,
      term,
      meaning,
      context,
      // Backward compatibility for consumers ainda no contrato antigo
      name: submitterName,
      contact: legacyContact,
    };

    const res = await fetch("/api/v1/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setLoading(false);
    if (!res) return setStatus("Erro de rede. Tente novamente.");

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setStatus(data?.error || "Não foi possível enviar a sugestão.");

    setStatus(`Sugestão enviada! Status: ${data.status}. Confiança: ${Math.round((data.score || 0) * 100)}%`);
    setTerm("");
    setMeaning("");
    setContext("");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border p-4 space-y-3">
      <h2 className="text-lg font-semibold">Enviar sugestão de gíria</h2>
      <input className="w-full rounded border p-2" placeholder="Seu nome" value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} required autoComplete="name" />
      <input
        className="w-full rounded border p-2"
        placeholder="WhatsApp (+5511999999999)"
        value={submitterWhatsapp}
        onChange={(e) => setSubmitterWhatsapp(e.target.value)}
        required
        inputMode="tel"
        autoComplete="tel"
      />
      <input className="w-full rounded border p-2" placeholder="Seu email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} required type="email" autoComplete="email" />
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
