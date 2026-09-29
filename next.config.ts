import type { NextConfig } from "next";

// GITHUB_PAGES=true is set by .github/workflows/deploy.yml. It switches on the
// static export and the /MatthewTanzer base path that github.io serves from,
// while leaving `next dev` at a clean localhost root.
const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export",
        basePath: "/MatthewTanzer",
        assetPrefix: "/MatthewTanzer",
      }
    : {}),
  trailingSlash: true,
  // Leaflet popups build links as raw HTML strings, which Next cannot rewrite
  // with basePath the way it does for <Link>. Expose it so they can prefix it.
  env: { NEXT_PUBLIC_BASE_PATH: isPages ? "/MatthewTanzer" : "" },
  images: {
    // Pages has no image optimizer, so listing photos load straight from Moxi.
    unoptimized: isPages,
    remotePatterns: [
      { protocol: "https", hostname: "*.moxi.onl" },
      { protocol: "https", hostname: "images-static.moxiworks.com" },
    ],
  },
};

export default nextConfig;
