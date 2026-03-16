import type { NextConfig } from "next";

// Server-side env var — set BACKEND_URL in Vercel dashboard (no NEXT_PUBLIC_ prefix needed).
// This is NOT embedded in the client bundle; it's only used by the Next.js proxy rewrite.
// Local dev: add BACKEND_URL=http://localhost:8000 to web-app/.env.local
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
