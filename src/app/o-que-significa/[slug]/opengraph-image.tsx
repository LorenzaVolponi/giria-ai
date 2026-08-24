import { ImageResponse } from "next/og";
import { getTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

export const alt = "Gíria AI — significado de gíria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  const evidence = term ? getEditorialEvidence(term.term) : null;
  const name = term?.term || decodeURIComponent(slug);
  const definition = evidence?.definition || term?.meaning || "Entenda o significado, contexto e uso da expressão.";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fffefa", color: "#173526", padding: "64px 72px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 999, background: "#d8d100", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>💬</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>Gíria AI</div>
            <div style={{ fontSize: 14, letterSpacing: 4, textTransform: "uppercase", opacity: 0.55 }}>Fala do seu jeito.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 980 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#9d9700", textTransform: "uppercase", letterSpacing: 3 }}>O que significa</div>
          <div style={{ fontSize: 82, lineHeight: 0.98, fontWeight: 800, letterSpacing: -4 }}>“{name}”?</div>
          <div style={{ fontSize: 30, lineHeight: 1.25, color: "#4f5552" }}>{definition.slice(0, 180)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(23,53,38,.14)", paddingTop: 24, fontSize: 18 }}>
          <div style={{ fontWeight: 700 }}>AIX8C · volponi.tech</div>
          <div style={{ color: "#7f7900" }}>@lorenzavolponi</div>
        </div>
      </div>
    ),
    size,
  );
}
