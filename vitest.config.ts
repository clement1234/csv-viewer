import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['node_modules/', 'src/test/'],
    },
    // Generate JSON report for badge automation
    reporters: ['default', 'json'],
    outputFile: {
      json: './coverage/vitest-results.json',
    },
  },
});
