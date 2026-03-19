import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      CORS_ORIGIN: 'http://localhost:3000',
    },
  },
});
