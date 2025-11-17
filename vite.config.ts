import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: process.env.GITHUB_PAGES
    ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] || "mononote"}/`
    : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    copyPublicDir: true,
  },
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
