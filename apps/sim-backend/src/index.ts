import { startServer } from './infrastructure/http/server.js';

startServer().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});