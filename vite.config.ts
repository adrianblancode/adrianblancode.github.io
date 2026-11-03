import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  // Bulma 1.0.4 still uses Sass syntax that newer Sass versions warn about
  css: { preprocessorOptions: { scss: { quietDeps: true } } },
  build: { outDir: 'build' },
})
