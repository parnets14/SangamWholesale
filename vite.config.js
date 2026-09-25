import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      // Proxy uploaded images — must match the folders multer saves to
      '/categories': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/subcategories': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/products': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/founders': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/team': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/banners': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/trading': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
      '/business': {
        target: 'https://sangamwholesale.com',
        changeOrigin: true,
      },
    },
  },
})
