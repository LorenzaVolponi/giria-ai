export type CircuitState = "closed" | "open" | "half_open";

export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  constructor(private readonly threshold = 4, private readonly cooldownMs = 30_000) {}

  state(now = Date.now()): CircuitState {
    if (!this.openedAt) return "closed";
    if (now - this.openedAt >= this.cooldownMs) return "half_open";
    return "open";
  }

  canExecute(now = Date.now()) { return this.state(now) !== "open"; }
  success() { this.failures = 0; this.openedAt = 0; }
  failure(now = Date.now()) { this.failures += 1; if (this.failures >= this.threshold) this.openedAt = now; }
}

export function publicReadCache(seconds = 300) {
  const safe = Math.max(30, Math.min(seconds, 86_400));
  return `public, max-age=${Math.min(60, safe)}, s-maxage=${safe}, stale-while-revalidate=${safe * 4}`;
}

export function privateNoStore() { return "private, no-store, max-age=0"; }
