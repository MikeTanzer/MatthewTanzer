import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.moxi.onl" },
      { protocol: "https", hostname: "images-static.moxiworks.com" },
    ],
  },
};

export default nextConfig;
