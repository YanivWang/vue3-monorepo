import { defineConfig, loadEnv } from 'vite'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { viteMockServe } from 'vite-plugin-mock'
import { compression } from 'vite-plugin-compression2'
import { resolve } from 'path'

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isMock = env.VITE_USE_MOCK === 'true'
  const isAnalyze = env.VITE_ANALYZE === 'true'

  // rollup-plugin-visualizer 是 ESM-only，使用动态导入避免 CJS 加载错误
  const analyzePlugins: PluginOption[] = []
  if (isAnalyze) {
    const { visualizer } = await import('rollup-plugin-visualizer')
    analyzePlugins.push(visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true, brotliSize: true }))
  }

  return {
    plugins: [
      vue(),

      // 自动导入 Vue、Vue Router、Pinia 等 API + vue-i18n
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: { enabled: true }
      }),

      // 自动导入组件
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/components.d.ts',
        dirs: ['src/components']
      }),

      // Mock 服务（开发环境在 vite devServer 层拦截，业务代码无感知）
      viteMockServe({
        mockPath: 'mock',
        enable: isMock
      }),

      // Gzip 压缩（生产构建时生成 .gz 文件）
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/]
      }),

      // Brotli 压缩（比 Gzip 压缩率更高，现代浏览器首选）
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/]
      }),

      // 打包体积可视化（通过 VITE_ANALYZE=true vite build 触发）
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
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
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
          rewrite: path => path.replace(new RegExp(`^${env.VITE_API_PREFIX || '/api'}`), '')
        }
      }
    },

    build: {
      target: 'es2015',
      // 生产环境关闭 sourcemap（安全）；如需排查问题可单独开启
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
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
