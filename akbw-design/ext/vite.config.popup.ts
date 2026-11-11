import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Popup build: a plain React app emitted as dist/popup.html + dist/assets/*.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  envPrefix: ["ADMIN_", "VITE_"],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
    },
  },
});
