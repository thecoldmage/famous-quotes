import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'app'),
    },
  },
};

export default nextConfig;
