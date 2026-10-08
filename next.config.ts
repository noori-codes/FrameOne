import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Custom CDN sizing (no Next optimizer) — avoids passing loader fns into RSC
    loader: "custom",
    loaderFile: "./lib/tmdb-image-loader.ts",
    // next/image only loads remote hosts you allow here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "blob.ramaki.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
