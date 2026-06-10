import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" works on Vercel (ignored) and is needed for local `bun run start`
  output: "standalone",
  reactStrictMode: false,
};

export default nextConfig;
