import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/olympiad-studio/',
  plugins: [react()],
  build: {
    // Framework + Supabase main chunk is ~562 kB (164 kB gzip) after event tools
    // are code-split via lazy() imports — benign for this app, so silence the
    // default 500 kB advisory.
    chunkSizeWarningLimit: 600,
  },
})
