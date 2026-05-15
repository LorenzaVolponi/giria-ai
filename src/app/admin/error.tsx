"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <section className="rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Falha ao carregar o painel admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente recarregar a área de moderação. Se persistir, faça logout/login e tente novamente.
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={reset} className="rounded border px-3 py-2 text-sm">
            Tentar novamente
          </button>
          <a href="/admin" className="rounded border px-3 py-2 text-sm">
            Reabrir /admin
          </a>
        </div>
      </section>
    </main>
  );
}
