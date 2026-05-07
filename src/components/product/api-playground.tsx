"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiResult {
  traducaoFormal?: string;
  explicacaoContextual?: string;
  intencaoSocialEmocional?: string;
  nivelInformalidade?: string;
  error?: string;
}

export function ApiPlayground() {
  const [text, setText] = useState("slay");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function handleRun() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/v1/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as ApiResult;
      setResult(data);
    } catch {
      setResult({ error: "Falha ao consultar API." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Playground da API v1</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite uma gíria" />
          <Button onClick={handleRun} disabled={loading || !text.trim()}>{loading ? "Consultando..." : "Testar"}</Button>
        </div>
        {result && (
          <div className="rounded-md border p-3 text-sm space-y-1">
            {result.error ? (
              <p className="text-destructive">{result.error}</p>
            ) : (
              <>
                <p><strong>Tradução:</strong> {result.traducaoFormal}</p>
                <p><strong>Contexto:</strong> {result.explicacaoContextual}</p>
                <p><strong>Intenção:</strong> {result.intencaoSocialEmocional}</p>
                <p><strong>Informalidade:</strong> {result.nivelInformalidade}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
