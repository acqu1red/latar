import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Конфигурация для поддомена new
export default defineConfig({
  plugins: [react()],
  base: '/', // Для поддомена new используем корневой путь
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5174, // Другой порт для разработки
    host: true,
  },
  build: {
    outDir: 'dist-new',
    assetsDir: 'assets',
    rollupOptions: {
      input: './public/new.html',
      output: {
        manualChunks: undefined,
      },
    },
  },
})
