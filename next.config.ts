import type { NextConfig } from "next";

// GitHub Pages serves the app from /<repo-name>; the deploy workflow sets this.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: { root: __dirname },
};

export default nextConfig;
