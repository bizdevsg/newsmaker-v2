import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "portalnews.newsmaker.id",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
