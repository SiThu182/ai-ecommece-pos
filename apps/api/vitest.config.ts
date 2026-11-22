import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Unit tests live next to the code (src/**); integration tests live in tests/.
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
