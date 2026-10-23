import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
  images: { unoptimized: true },
  // 브라우저에서 "영상 만들기" 버튼 표시 여부. Vercel(서버리스)에서는 서버 렌더가 불가.
  env: {
    NEXT_PUBLIC_RENDER_DISABLED: process.env.VERCEL || process.env.RENDER_DISABLED === "1" ? "1" : "",
  },
  // 서버리스 함수 번들에서 Remotion 렌더러(헤드리스 Chrome·컴포지터 바이너리)를 제외.
  // 포함되면 함수 크기 제한(250MB)을 넘어 배포가 실패한다. 렌더 API는 Vercel에서 비활성.
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@remotion/compositor-*/**",
      "node_modules/@remotion/renderer/**",
      "node_modules/@remotion/bundler/**",
      "node_modules/@remotion/cli/**",
      "node_modules/webpack/**",
      "node_modules/esbuild*/**",
      "node_modules/@esbuild/**",
    ],
  },
};

export default nextConfig;
