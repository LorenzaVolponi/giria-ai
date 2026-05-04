import type { TranslationResponse } from "@/types/translation";

export type RegionSignal = {
  requestedRegion?: string | null;
  inferredRegion?: string | null;
  confidence?: number | null;
};

export type RegionalizationOptions = {
  enabled: boolean;
  lowConfidenceThreshold?: number;
};

export function applyRegionalization(
  base: TranslationResponse,
  signal: RegionSignal,
  options: RegionalizationOptions,
): TranslationResponse {
  if (!options.enabled) return base;

  const threshold = options.lowConfidenceThreshold ?? 0.6;
  const confidence = signal.confidence ?? 0;

  if (confidence < threshold) {
    return {
      ...base,
      explicacaoContextual: `${base.explicacaoContextual} (Sem confiança suficiente para regionalizar; resposta neutra.)`,
    };
  }

  const requested = normalizeRegion(signal.requestedRegion);
  const inferred = normalizeRegion(signal.inferredRegion);

  if (requested && inferred && requested !== inferred) {
    return {
      ...base,
      explicacaoContextual: `${base.explicacaoContextual} (Conflito de região: pedido ${requested}, inferido ${inferred}. Mantendo resposta neutra.)`,
    };
  }

  const region = requested ?? inferred;
  if (!region) return base;

  return {
    ...base,
    explicacaoContextual: `${base.explicacaoContextual} (Contexto regional considerado: ${region}.)`,
  };
}

function normalizeRegion(region?: string | null): string | null {
  const trimmed = region?.trim();
  return trimmed ? trimmed.toUpperCase() : null;
}
