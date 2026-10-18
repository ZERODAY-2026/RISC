import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/static/',
  build: {
    outDir: 'static',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(import.meta.dirname, 'index.html'),
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'bundle.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
});
