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

  // Environment variables validation
  // Note: Empty string for API_URL forces mock mode in production (safer default)
  env: {
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA || "true",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_OPERATOR_ID: process.env.NEXT_PUBLIC_OPERATOR_ID || "op_001",
  },
};

export default nextConfig;
