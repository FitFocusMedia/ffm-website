import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    allowedHosts: ['clawdbots-mini.tailcfdc1.ts.net', 'localhost'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
