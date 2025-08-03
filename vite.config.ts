// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Resolver aliases para imports mais limpos
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

  // Configurações de desenvolvimento
  server: {
    host: true,
    port: 3000,
    open: true,
    cors: true,
  },

  // Configurações de preview
  preview: {
    host: true,
    port: 4173,
    open: true,
  },

  // Configurações de build
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    
    // Otimizações para redes lentas (requisito do projeto)
    rollupOptions: {
      output: {
        // Separar bibliotecas em chunks separados
        manualChunks: {
          // React e bibliotecas principais
          'react-vendor': ['react', 'react-dom'],
          
          // Material-UI
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          
          // MapLibre e bibliotecas de mapa
          'map-vendor': [
            'maplibre-gl',
            'react-map-gl',
            '@turf/turf',
          ],
          
          // React Query e estado
          'state-vendor': [
            '@tanstack/react-query',
            'zustand',
          ],
          
          // Utilitários
          'utils-vendor': [
            'zod',
            'dexie',
          ],
        },
      },
    },
    
    // Limite de warnings de tamanho de chunk
    chunkSizeWarningLimit: 1000,
  },

  // Otimizações de dependências
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
    exclude: ['milsymbol'], // Biblioteca que pode ter problemas com pre-bundling
  },

  // Configurações específicas para trabalhar com MapLibre
  define: {
    // Necessário para algumas bibliotecas geoespaciais
    global: 'globalThis',
  },

  // Configurações para suporte a Web Workers (caso necessário no futuro)
  worker: {
    format: 'es',
  },

  // Configurações de teste
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },

  // Configurações CSS
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },

  // Configurações para PWA (caso queira implementar no futuro)
  // Comentado por enquanto, mas pode ser útil para uso offline
  /*
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'osm-tiles',
            expiration: {
              maxEntries: 500,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
            },
          },
        },
      ],
    },
  },
  */
});