/**
 * Optimized Vite Config with Code Splitting
 * 
 * To use: Replace vite.config.js with this file
 * Expected to reduce initial bundle significantly through manual chunk splitting
 */

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
    // Increase warning limit since we're splitting intentionally
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Node modules chunking
          if (id.includes('node_modules')) {
            // Core React - loads immediately
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            
            // Supabase - needed for most features
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            
            // Video player - only for livestream pages
            if (id.includes('@mux') || id.includes('mux-player')) {
              return 'feature-video'
            }
            
            // Charts - only for analytics/CRM
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'feature-charts'
            }
            
            // Animation - only for proposal/onboarding
            if (id.includes('framer-motion')) {
              return 'feature-motion'
            }
            
            // Maps - only for geo-blocking admin
            if (id.includes('leaflet')) {
              return 'feature-maps'
            }
            
            // PDF generation - only for proposals
            if (id.includes('html2pdf') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'feature-pdf'
            }
            
            // Drag and drop - only for assignments
            if (id.includes('@dnd-kit')) {
              return 'feature-dnd'
            }
            
            // Icons - used everywhere, but tree-shake
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            
            // Everything else goes to vendor
            return 'vendor-misc'
          }
          
          // App code chunking by feature
          if (id.includes('/portal/')) {
            return 'app-portal'
          }
          if (id.includes('/livestream/')) {
            return 'app-livestream'
          }
          if (id.includes('/gallery/')) {
            return 'app-gallery'
          }
          if (id.includes('/athlete/')) {
            return 'app-athlete'
          }
          if (id.includes('/proposal/') || id.includes('Proposal')) {
            return 'app-proposal'
          }
        }
      }
    }
  }
})
