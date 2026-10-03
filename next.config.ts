import type { NextConfig } from "next";
import path from "path";

const polyfillPath = path.join(process.cwd(), "lib/modern-polyfill.js");

const r2Host = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : undefined;

const contentApiHost = (() => {
  try {
    const url = process.env.SITE_CONTENT_API_URL;
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const polyfillStub = "./lib/modern-polyfill.js";

const nextConfig: NextConfig = {
  // Vercel packages the build itself via its adapter; the standalone copy step
  // there fails because Turbopack doesn't emit .next/next-server.js.nft.json.
  // Keep standalone for self-hosting (`npm start`).
  output: process.env.VERCEL ? undefined : "standalone",
  transpilePackages: ["@noirly-dev/ui"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@mdi/js", "@mdi/react", "framer-motion"],
  },
  turbopack: {
    resolveAlias: {
      "../build/polyfills/polyfill-module": polyfillStub,
      "next/dist/build/polyfills/polyfill-module": polyfillStub,
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "../build/polyfills/polyfill-module": polyfillPath,
      "next/dist/build/polyfills/polyfill-module": polyfillPath,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "noirly-calculator.aneesh-pissay.in",
      },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      ...(contentApiHost
        ? [
            {
              protocol: "http" as const,
              hostname: contentApiHost,
              pathname: "/**",
            },
            {
              protocol: "https" as const,
              hostname: contentApiHost,
              pathname: "/**",
            },
          ]
        : []),
      ...(r2Host
        ? [{ protocol: "https" as const, hostname: r2Host, pathname: "/**" }]
        : []),
    ],
  },
};

export default nextConfig;
