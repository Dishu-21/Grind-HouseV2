import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'virtual:pwa-register',
        replacement: path.resolve(__dirname, 'src/shared/utils/pwaRegister.dummy.ts'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    testTimeout: 20000,
  },
});
