import { defineConfig, loadEnv } from 'vite'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import { compression } from 'vite-plugin-compression2'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isMock = env.VITE_USE_MOCK === 'true'
  const isAnalyze = env.VITE_ANALYZE === 'true'

  // rollup-plugin-visualizer 是 ESM-only，动态导入避免 CJS 加载错误
  const analyzePlugins: PluginOption[] = []
  if (isAnalyze) {
    const { visualizer } = await import('rollup-plugin-visualizer')
    analyzePlugins.push(visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true, brotliSize: true }))
  }

  return {
    plugins: [
      vue(),

      // tsconfig paths：保证 Vite 能解析 @vue3-monorepo/* workspace 别名至源码
      tsconfigPaths({ loose: true }),

      // Mock 服务（开发环境在 vite devServer 层拦截，业务代码无感知）
      viteMockServe({
        mockPath: 'mock',
        enable: isMock
      }),

      // 单实例多算法，避免对 generateBundle 重复挂钩导致同路径资源被多次 emit
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

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`
        }
      }
    },

    server: {
      port: 5173,
      open: false,
      cors: true,
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
      // 生产环境关闭 sourcemap；staging 环境可通过 VITE_SOURCEMAP=true 开启
      sourcemap: env.VITE_SOURCEMAP === 'true',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus')) return 'element-plus'
              if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) return 'vue-vendor'
              if (id.includes('vue-i18n')) return 'vue-i18n'
              if (id.includes('axios') || id.includes('dayjs') || id.includes('lodash-es') || id.includes('js-cookie'))
                return 'utils'
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
