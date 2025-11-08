import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Production-ready configuration */

  // Output configuration for Vercel
  output: "standalone",

  // Image optimization
  images: {
    domains: [],
    unoptimized: false,
  },

  // React strict mode for better error detection
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compression
  compress: true,

  // Environment variables are automatically available via NEXT_PUBLIC_* prefix
  // Vercel injects them directly - no need for explicit env section
  // This prevents build-time hardcoding issues
};

export default nextConfig;
