import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Dev server serve o index.html da raiz (demo interativa)
  root: '.',

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'LibrasWidget',
      fileName: 'libras-widget',
      formats: ['umd', 'es'],
    },
    // Não externaliza nada — bundle é self-contained
    rollupOptions: {
      external: [],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
