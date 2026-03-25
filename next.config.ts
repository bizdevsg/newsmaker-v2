import type { NextConfig } from "next";

const upstreamUrls = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_PORTALNEWS_API_URL,
  process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE,
  process.env.NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL,
  process.env.NEXT_PUBLIC_ENDPOAPI_BASE,
  process.env.ENDPO_NM23_BASE,
  process.env.FRANKFURTER_BASE_URL,
  process.env.PORTALNEWS_PIVOT_HISTORY_URL,
  "https://archive.org",
].filter((value): value is string => Boolean(value));

const remotePatterns = Array.from(
  new Map(
    upstreamUrls.flatMap((value) => {
      try {
        const url = new URL(value);
        return [
          [
            `${url.protocol}//${url.hostname}`,
            {
              protocol: url.protocol.replace(":", "") as "http" | "https",
              hostname: url.hostname,
              pathname: "/**",
            },
          ] as const,
        ];
      } catch {
        return [];
      }
    }),
  ).values(),
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PORTALNEWS_API_URL: process.env.NEXT_PUBLIC_PORTALNEWS_API_URL,
    NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE:
      process.env.NEXT_PUBLIC_PORTALNEWS_IMAGE_BASE,
    NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL:
      process.env.NEXT_PUBLIC_PORTALNEWS_TIKTOK_URL,
    NEXT_PUBLIC_ENDPOAPI_BASE: process.env.NEXT_PUBLIC_ENDPOAPI_BASE,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
