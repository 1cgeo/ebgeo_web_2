import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/features': resolve(__dirname, './src/features'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/constants': resolve(__dirname, './src/constants'),
      '@/config': resolve(__dirname, './src/config'),
      '@/theme': resolve(__dirname, './src/theme'),
    },
  },

  // Development server configuration
  server: {
    host: true,
    port: 3000,
    open: true,
    cors: true,
    // HMR configuration for better development experience
    hmr: {
      overlay: true,
    },
  },

  // Preview server configuration
  preview: {
    host: true,
    port: 4173,
    open: true,
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',

    // Rollup options for optimized bundles
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],

          // UI library
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],

          // Map and geospatial libraries
          'map-vendor': ['maplibre-gl', 'react-map-gl', '@turf/turf'],

          // State management and data fetching
          'state-vendor': ['@tanstack/react-query', 'zustand'],

          // Utilities and data handling
          'utils-vendor': [
            'zod',
            'dexie',
            'jszip',
            'file-saver',
            'papaparse',
            'browser-image-compression',
          ],

          // Military symbols (potentially large)
          'military-vendor': ['milsymbol'],
        },
      },
    },

    // Bundle size warning limit
    chunkSizeWarningLimit: 1000,
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'maplibre-gl',
      'react-map-gl',
      '@mui/material',
      '@mui/icons-material',
      '@tanstack/react-query',
      'zustand',
      'zod',
      'dexie',
      '@turf/turf',
    ],
    // Exclude libraries that might have issues with pre-bundling
    exclude: ['milsymbol'],
  },

  // Global constants for client-side code
  define: {
    // Required for some geospatial libraries
    global: 'globalThis',
  },

  // Web Workers configuration
  worker: {
    format: 'es',
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },

  // Testing configuration (if using Vitest)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
