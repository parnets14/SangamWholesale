import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      // Proxy uploaded images (founders/, team/, banners/, etc.)
      '/founders': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      '/team': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      '/banners': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      '/trading': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      '/business': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
      '/subcategories': {
        target: 'http://localhost:1083',
        changeOrigin: true,
      },
    },
  },
})
