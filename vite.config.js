import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev-only: proxies to the local mock-server (see mock-server/) so
      // cookies stay same-origin. Point this at a real backend later by
      // changing the target (or removing the proxy and setting
      // VITE_API_BASE_URL to the real API's absolute URL).
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
