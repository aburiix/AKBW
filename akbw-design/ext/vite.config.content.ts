import { defineConfig } from "vite";
import { resolve } from "node:path";

// Content script build: a self-contained IIFE bundle (MV3 content scripts
// cannot be ES modules). Emitted as dist/content.js.
export default defineConfig({
  envPrefix: ["ADMIN_", "VITE_"],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content/index.ts"),
      name: "AkbwContentScript",
      formats: ["iife"],
      fileName: () => "content.js",
    },
  },
});
