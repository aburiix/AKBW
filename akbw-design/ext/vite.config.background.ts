import { defineConfig } from "vite";
import { resolve } from "node:path";

// Background service worker build: an ES module (MV3 supports "type": "module").
// Emitted as dist/background.js.
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
      entry: resolve(__dirname, "src/background/index.ts"),
      name: "AkbwBackground",
      formats: ["es"],
      fileName: () => "background.js",
    },
  },
});
