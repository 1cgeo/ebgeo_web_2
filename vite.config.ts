import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      }),
      viteCompression()
    ],
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-core': ['react', 'react-dom'],
            'vendor-mui': [
              '@mui/material',
              '@mui/icons-material',
              '@emotion/react',
              '@emotion/styled'
            ],
            'vendor-cesium': ['cesium'],
            'vendor-map': ['maplibre-gl'],
            'vendor-state': ['@tanstack/react-query', 'zustand'],
            'vendor-utils': ['zod', 'lodash']
          }
        }
      },
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1500,
      target: 'esnext',
      minify: 'esbuild'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      exclude: ['cesium']
    }
  }
})