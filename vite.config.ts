import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api/send-confirmation": {
        target:
          "https://vnxftftsglekhpczgbcf.functions.supabase.co/send-application-confirmation",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/send-confirmation/, ""),
      },
    },
  },
});
