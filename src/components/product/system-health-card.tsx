"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HealthResponse = { status: string; service: string; timestamp: string };

export function SystemHealthCard() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [data, setData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch("/api/v1/health")
      .then((r) => r.json())
      .then((d: HealthResponse) => {
        setData(d);
        setStatus(d.status === "ok" ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>Estado:</strong> {status === "loading" ? "Carregando..." : status === "ok" ? "Operacional" : "Instável"}</p>
        {data && (
          <>
            <p><strong>Serviço:</strong> {data.service}</p>
            <p><strong>Último ping:</strong> {new Date(data.timestamp).toLocaleString("pt-BR")}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
