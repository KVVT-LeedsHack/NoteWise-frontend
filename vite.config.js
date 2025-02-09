import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',  // Ensure that this is the build output directory
  },
  server: {
    hmr: true,
  },
});
