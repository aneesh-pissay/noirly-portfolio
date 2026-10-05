import type { NextConfig } from "next";
import path from "path";

const polyfillPath = path.join(process.cwd(), "lib/modern-polyfill.js");

const r2Host = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : undefined;

const polyfillStub = "./lib/modern-polyfill.js";

const nextConfig: NextConfig = {
  // Vercel packages the build itself via its adapter; the standalone copy step
  // there fails because Turbopack doesn't emit .next/next-server.js.nft.json.
  // Keep standalone for self-hosting (`npm start`).
  output: process.env.VERCEL ? undefined : "standalone",
  // The old standalone pages were folded into the home page and /work. Keep
  // their URLs working for anyone with a bookmark or an old search result.
  // `/projects` is matched exactly so /projects/noirly-messenger/* still serves.
  async redirects() {
    return [
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/skills", destination: "/#stack", permanent: true },
      { source: "/contact", destination: "/#contact", permanent: true },
    ];
  },
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
      ...(r2Host
        ? [{ protocol: "https" as const, hostname: r2Host, pathname: "/**" }]
        : []),
    ],
  },
};

export default nextConfig;
