import type { NextConfig } from "next";

/**
 * Fully static export for GitHub Pages (https://mollyelizabethbrown.github.io).
 * `npm run build` writes the site to out/; .github/workflows/deploy.yml publishes it.
 * The site is served from the domain root, so no basePath is needed.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // /about/ → out/about/index.html, which GitHub Pages serves natively
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // No image server on static hosting. Local images are pre-sized (scripts/optimize-images.sh);
    // CMS images are served from Sanity's CDN.
    unoptimized: true,
  },
};

export default nextConfig;
