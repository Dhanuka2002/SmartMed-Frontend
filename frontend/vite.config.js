import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['react', 'react-dom'],
          // React Router
          router: ['react-router-dom'],
          // Charts and visualizations
          charts: ['recharts'],
          // Icons and UI components
          icons: ['react-icons', 'lucide-react'],
          // Date utilities
          dates: ['date-fns', 'react-datepicker'],
          // QR code libraries
          qr: ['qr-scanner', 'qrcode', 'react-qr-code'],
          // Communication
          comm: ['twilio']
        }
      }
    }
  }
})
