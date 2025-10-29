import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
})
