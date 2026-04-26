import { defineConfig, loadEnv } from 'vite'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import { compression } from 'vite-plugin-compression2'
import tsconfigPaths from 'vite-tsconfig-paths'
import mobileForever from 'postcss-mobile-forever'
import { resolve } from 'node:path'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isMock = env.VITE_USE_MOCK === 'true'
  const isAnalyze = env.VITE_ANALYZE === 'true'
  const viewportWidth = Number(env.VITE_H5_VIEWPORT_WIDTH || 375)

  const analyzePlugins: PluginOption[] = []
  if (isAnalyze) {
    const { visualizer } = await import('rollup-plugin-visualizer')
    analyzePlugins.push(visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true, brotliSize: true }))
  }

  return {
    plugins: [
      vue(),

      tsconfigPaths({ loose: true }),

      viteMockServe({
        mockPath: 'mock',
        enable: isMock
      }),

      compression({
        algorithms: ['gzip', 'brotliCompress'],
        exclude: [/\.(br)$/, /\.(gz)$/]
      }),

      ...analyzePlugins
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },

    optimizeDeps: {
      include: ['vant', '@vue3-mono/shared/components-h5']
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@vue3-mono/shared/styles/tokens/variables" as *;`
        }
      },
      postcss: {
        plugins: [
          mobileForever({
            viewportWidth,
            maxDisplayWidth: 600,
            appSelector: '#app'
          })
        ]
      }
    },

    server: {
      port: 5174,
      open: false,
      cors: true,
      host: true,
      proxy: {
        [env.VITE_API_PREFIX || '/api']: {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(new RegExp(`^${env.VITE_API_PREFIX || '/api'}`), '')
        }
      }
    },

    build: {
      target: 'es2015',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('vant')) return 'vant'
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) return 'vue-vendor'
              if (id.includes('vue-i18n')) return 'vue-i18n'
              if (id.includes('axios') || id.includes('dayjs') || id.includes('lodash-es')) return 'utils'
              if (id.includes('vconsole')) return 'vconsole'
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
