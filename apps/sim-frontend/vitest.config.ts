import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    alias: {
      '@': path.resolve(__dirname, './src'),
      'fs': path.resolve(__dirname, './src/fs-shim.ts'),
      'crypto': path.resolve(__dirname, './src/crypto-shim.ts'),
      'path-browserify': 'pathe',
    },
  },
});
