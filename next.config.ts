import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" works on Vercel (ignored) and is needed for local `bun run start`
  output: "standalone",
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/guias/girias-nave-espacial-et-alienigena",
        destination: "/guias",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
