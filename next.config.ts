import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure webpack resolver to properly handle path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
};

export default nextConfig;
