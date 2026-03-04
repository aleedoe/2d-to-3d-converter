import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep connections alive for proxied requests
  httpAgentOptions: {
    keepAlive: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },

  // Expose the Flask backend URL to the client so we can call it
  // directly for long-running requests (bypasses proxy timeout)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },
};

export default nextConfig;
