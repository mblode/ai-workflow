import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/site-url";

const isDev = process.env.NODE_ENV === "development";

/**
 * PostHog is reverse-proxied through r.blode.co, and posthog-js lazy-loads its
 * extension bundles from `api_host`, so the origin belongs in `script-src` as
 * well as `connect-src`.
 *
 * The fallback is the deployed proxy rather than "": this file is evaluated at
 * build time, and an env var that is only bound on production would otherwise
 * ship previews a CSP that silently blocks analytics.
 */
const posthogOrigin = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://r.blode.co";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' is not optional: Next inlines the RSC flight payload as a
  // <script>. 'unsafe-eval' is dev-only, for the Turbopack HMR runtime.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${posthogOrigin}`,
  `connect-src 'self' ${posthogOrigin}`,
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * blode.co deliberately skips zone paths in its own `headers()`, because two
 * Content-Security-Policy headers on one response are intersected by the
 * browser rather than overridden. So this zone owns its response headers.
 *
 * No `Cross-Origin-Resource-Policy`: `same-origin` would need a `cross-origin`
 * override on every OG route, `[slide]/opengraph-image` included, and
 * missing one kills a share card silently. HSTS is already set at the edge.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  assetPrefix: BASE_PATH,
  basePath: BASE_PATH,
  // Instant navigation (Next 16.3+): every slide is prerendered into a static
  // shell, and each prefetch fetches the route's App Shell.
  cacheComponents: true,
  // The dev badge would sit on the projector if the talk is ever run from `next dev`.
  devIndicators: false,
  experimental: { turbopackRustReactCompiler: true },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  reactCompiler: true,
  partialPrefetching: true,
  // The presenter package ships TypeScript source, not a build.
  transpilePackages: ["deck-presenter"],
  headers() {
    // Every matching rule applies in array order and a later one wins per
    // header key, so a catch-all must come first or it overwrites the
    // per-path rules after it.
    //
    // `/:path*` rather than `/(.*)`: `headers` sources are basePath-prefixed,
    // and `/ai-workflow/(.*)` does not match the bare `/ai-workflow` the zone rewrite
    // actually requests. The `*` modifier makes the segment optional, so
    // `/ai-workflow/:path*` covers the zone root as well as everything under it.
    return Promise.resolve([
      {
        headers: securityHeaders,
        source: "/:path*",
      },
    ]);
  },
  redirects() {
    return Promise.resolve([
      {
        destination: "/",
        permanent: true,
        source: "/1",
      },
    ]);
  },
};

export default nextConfig;
