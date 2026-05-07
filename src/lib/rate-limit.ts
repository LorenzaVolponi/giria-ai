export type RateLimiter = {
  isLimited: (key: string) => boolean;
};

export function createInMemoryRateLimiter(windowMs: number, maxRequests: number): RateLimiter {
  const store = new Map<string, number[]>();

  return {
    isLimited(key: string): boolean {
      const now = Date.now();
      const recent = (store.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
      recent.push(now);
      store.set(key, recent);
      return recent.length > maxRequests;
    },
  };
}
