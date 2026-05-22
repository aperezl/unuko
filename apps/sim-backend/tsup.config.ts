import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  platform: 'node',
  external: ['pkcs11js'],
  noExternal: [
    '@unuko/adapter-http',
    '@unuko/adapter-mongodb',
    '@unuko/adapter-open5gs-sdm',
    '@unuko/adapter-pkcs11',
    '@unuko/adapter-ueransim',
    '@unuko/cli',
    '@unuko/core',
  ],
});
