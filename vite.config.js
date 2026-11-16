import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './', // works on GitHub Pages project sites (https://user.github.io/repo/)
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500, // the spelling dictionary (host only, lazy-loaded)
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        host: resolve(__dirname, 'host/index.html'),
        play: resolve(__dirname, 'play/index.html'),
      },
    },
  },
  server: { host: true, port: 5173 },
});
