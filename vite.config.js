import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/evaluate': 'http://localhost:3000',
      '/analyze-flavor': 'http://localhost:3000',
      '/generate': 'http://localhost:3000',
      '/reformulate': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/logs': 'http://localhost:3000',
    },
  },
})
