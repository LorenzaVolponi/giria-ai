import type { Metadata } from "next";
import { ApoieClient } from "@/components/support/apoie-client";

export const metadata: Metadata = {
  title: "Apoie o Gíria AI",
  description: "Ajude o Gíria AI a continuar gratuito, atualizado e acessível para pais, educadores e jovens.",
};

export default function ApoiePage() {
  return <ApoieClient />;
}
