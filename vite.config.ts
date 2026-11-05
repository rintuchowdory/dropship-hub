import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    // `wrangler dev` runs the API on 8787 during local development.
    proxy: { '/api': 'http://localhost:8787' },
  },
})
