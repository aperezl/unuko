import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  platform: 'node',
  noExternal: [
    '@unuko/cli',
    '@unuko/adapter-ueransim',
    '@unuko/core',
    '@unuko/ueransim-lib',
  ],
});
