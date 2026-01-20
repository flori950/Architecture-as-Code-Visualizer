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
        manualChunks: id => {
          // React and core libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }

          // Mermaid core (largest library) - split more aggressively
          if (id.includes('mermaid')) {
            // Core mermaid engine
            if (
              id.includes('mermaid/dist/mermaid.esm') ||
              id.includes('mermaidAPI')
            ) {
              return 'mermaid-core';
            }
            // Diagram parsers and renderers
            if (id.includes('diagram') || id.includes('parser')) {
              return 'mermaid-diagrams';
            }
            // Other mermaid utilities
            return 'mermaid-utils';
          }

          // Utility libraries
          if (id.includes('js-yaml')) {
            return 'yaml-utils';
          }

          // Icon library
          if (id.includes('lucide-react')) {
            return 'icons';
          }

          // D3 and graph libraries (often used by mermaid)
          if (
            id.includes('d3-') ||
            id.includes('dagre') ||
            id.includes('graphlib')
          ) {
            return 'graph-libs';
          }

          // Split other large node_modules
          if (id.includes('node_modules')) {
            // Group similar libraries together
            if (id.includes('monaco-editor')) {
              return 'monaco-vendor';
            }
            if (id.includes('@codemirror') || id.includes('codemirror')) {
              return 'codemirror-vendor';
            }
            return 'vendor';
          }
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
