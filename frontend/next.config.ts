import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // In Docker, this resolves to the internal container. Locally, it defaults to localhost.
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/health`,
      }
    ];
  },
};

export default nextConfig;
