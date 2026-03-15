import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ??
  "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // On Vercel: output .next/ to repo root so Vercel can find routes-manifest.json.
  // Locally: keep .next/ inside web-app/ (default behaviour).
  distDir: process.env.VERCEL ? "../.next" : ".next",
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
