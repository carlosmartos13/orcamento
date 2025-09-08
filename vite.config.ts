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
    minify: 'esbuild', // Usar esbuild ao invés de terser para melhor compatibilidade
    target: 'es2015', // Compatibilidade com navegadores mais antigos
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
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  },
  preview: {
    port: 4173,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled']
  }
})
