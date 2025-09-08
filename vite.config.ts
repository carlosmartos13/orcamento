import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Para funcionar em subdiretórios
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Remove sourcemaps para produção
    minify: 'esbuild',
    target: 'esnext', // Melhor para modern browsers
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        }
      }
    },
    chunkSizeWarningLimit: 1600
  },
  
  // Configurações do server (apenas para desenvolvimento)
  server: {
    port: 5173,
    host: '0.0.0.0', // Permite acesso externo no Docker
    allowedHosts: [
      'seatec-builders-orcamento-test.ucwu5a.easypanel.host/',
      'localhost',
      '127.0.0.1'
    ]
  },
  
  // Configurações do preview (para preview de produção)
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: [
      'seatec-builders-orcamento-test.ucwu5a.easypanel.host/',
      'localhost', 
      '127.0.0.1'
    ]
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled']
  }
})
