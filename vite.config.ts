import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import jscLocPlugin from "@builder.io/vite-plugin-jsx-loc";

export default defineConfig({
  plugins: [react(), jscLocPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "@trpc/react-query"],
        },
      },
    },
  },
  server: {
    middlewareMode: true,
  },
});
