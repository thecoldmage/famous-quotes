import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds to fix path alias resolution
  experimental: {
    turbo: undefined
  }
};

export default nextConfig;
