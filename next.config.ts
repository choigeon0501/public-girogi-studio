import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
  images: { unoptimized: true },
};

export default nextConfig;
