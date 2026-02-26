import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Generate build version: YYMMDD.HHMM
const now = new Date()
const buildVersion = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  server: {
    allowedHosts: ['clawdbots-mini.tailcfdc1.ts.net', 'localhost'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
