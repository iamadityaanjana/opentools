import { defineConfig } from 'vitest/config';

// Unit tests cover the pure, browser-free logic (color math, filename
// helpers, the format capability matrix, and the tool catalog). Anything that
// needs a real canvas/WASM codec is exercised manually, not here.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
