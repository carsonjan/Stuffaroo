// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const webOrigin = process.env["WEB_ORIGIN"];
if (process.env["VERCEL"] && (!webOrigin || !/^https:\/\/[a-z0-9.-]+\.vercel\.app$/.test(webOrigin))) {
  throw new Error("Set WEB_ORIGIN to the web project's HTTPS vercel.app origin");
}

const nitroOptions = {
    preset: process.env["VERCEL"] ? "vercel" : "cloudflare-module",
    routeRules: webOrigin ? {
      "/app": { proxy: `${webOrigin}/app` },
      "/app/**": { proxy: `${webOrigin}/app/**` },
      "/marketplace": { redirect: { to: "/app/marketplace", status: 307 } },
      "/marketplace/**": { redirect: { to: "/app/marketplace/**", status: 307 } },
      "/auth/**": { redirect: { to: "/app/auth/**", status: 307 } },
    } : {},
};

export default defineConfig({
  nitro: nitroOptions,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
