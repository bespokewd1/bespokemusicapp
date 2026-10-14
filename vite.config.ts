// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null, // src/lib/pwa.ts is the only registrar
        devOptions: { enabled: false },
        filename: "sw.js",
        manifest: false, // public/manifest.webmanifest is linked from __root
        workbox: {
          globPatterns: ["**/*.{js,css,woff2,png,svg,jpg,webp,ico}"],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallback: null, // SSR app: no static shell; pages cached NetworkFirst below
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) => request.mode === "navigate" && !url.pathname.startsWith("/~oauth") && !url.pathname.startsWith("/api/"),
              handler: "NetworkFirst",
              options: { cacheName: "bm-pages", networkTimeoutSeconds: 4, expiration: { maxEntries: 80 } },
            },
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "bm-assets", expiration: { maxEntries: 300 } },
            },
            {
              // Song, playlist and preference reads, so previously opened songs work offline
              urlPattern: ({ url, request }) => request.method === "GET" && url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/rest/v1/"),
              handler: "NetworkFirst",
              options: { cacheName: "bm-data", networkTimeoutSeconds: 5, expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
            },
            {
              urlPattern: ({ url }) => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "bm-fonts", expiration: { maxEntries: 30 } },
            },
          ],
        },
      }),
    ],
  },
});
