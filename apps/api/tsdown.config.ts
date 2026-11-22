import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  // Emit dist/server.js instead of .mjs. The package is "type": "module", so .js is ESM.
  fixedExtension: false,
  deps: {
    // @ai-commerce-pos/shared exports raw TypeScript source. Node.js will not strip types
    // inside node_modules, so it MUST be bundled. Leaving it external crashes at startup.
    alwaysBundle: ['@ai-commerce-pos/shared'],
  },
});
