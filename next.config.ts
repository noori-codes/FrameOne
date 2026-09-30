import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image only loads remote hosts you allow here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
