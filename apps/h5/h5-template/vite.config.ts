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
      include: ['vant', '@vue3-monorepo/shared/components-h5']
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`
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
          // 同 admin：仓库目录名含 "vue"，必须先切到最后一个 node_modules 之后再匹配；
          // 且 vconsole / vue-i18n 等更具体的判断要排在 'vue' 之前。
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return
            const pkgPath = id.split('node_modules/').pop() ?? ''
            if (pkgPath.includes('vant')) return 'vant'
            if (pkgPath.includes('vconsole')) return 'vconsole'
            if (pkgPath.includes('vue-i18n') || pkgPath.includes('@intlify')) return 'vue-i18n'
            if (pkgPath.includes('vue') || pkgPath.includes('pinia')) return 'vue-vendor'
            if (pkgPath.includes('axios') || pkgPath.includes('dayjs') || pkgPath.includes('lodash-es')) return 'utils'
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
