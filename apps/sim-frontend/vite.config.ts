import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'fs': path.resolve(__dirname, './src/fs-shim.ts'),
      'crypto': path.resolve(__dirname, './src/crypto-shim.ts'),
      'path-browserify': 'pathe',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/v1': 'http://localhost:3000',
    },
  },
  worker: {
    format: 'es',
  },
});
