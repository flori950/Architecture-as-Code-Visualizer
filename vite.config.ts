/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['js-yaml', 'mermaid'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Only split the truly large/heavy libraries
          vue: ['mermaid'], // Mermaid as its own chunk (it's large)
          'react-vendor': ['react', 'react-dom'], // React as its own chunk
        },
        // Create smaller chunks for better caching
        chunkFileNames: chunkInfo => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
      },
    },
    // Increase chunk size warning limit to 1.5MB for visualization libraries
    chunkSizeWarningLimit: 1500,
    // Enable source maps for better debugging
    sourcemap: false, // Disable in production for smaller builds
    // Enable minification with better settings
    minify: 'terser',
    // Report compressed sizes
    reportCompressedSize: true,
  },
});
