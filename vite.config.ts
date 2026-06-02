import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SpeedImage is a fully client-side static app. `base: './'` keeps asset URLs
// relative so it works on GitHub Pages project subpaths as well as the root.
export default defineConfig({
  base: './',
  plugins: [react()],
  // jSquash codecs run inside a Web Worker as ES modules.
  worker: { format: 'es' },
  // The WASM-backed jSquash packages must be excluded from Vite's dependency
  // pre-bundling, otherwise esbuild mangles their `new URL(...wasm)` loaders.
  optimizeDeps: {
    exclude: [
      '@jsquash/jpeg',
      '@jsquash/png',
      '@jsquash/webp',
      '@jsquash/oxipng',
      '@jsquash/resize',
    ],
  },
});
