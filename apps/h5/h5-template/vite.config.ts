import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import { compression } from 'vite-plugin-compression2'
import mobileForever from 'postcss-mobile-forever'

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

      // Mock 服务（开发环境在 vite devServer 层拦截，业务代码无感知）。
      // infixName: false —— 保持 mock/*.ts 的现有命名，不必改成 *.fake.ts。
      await vitePluginFakeServer({
        include: 'mock',
        infixName: false,
        enableDev: isMock,
      }),

      compression({
        algorithms: ['gzip', 'brotliCompress'],
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),

      ...analyzePlugins,
    ].filter(Boolean),

    // `tsconfigPaths` 让 Vite 8 原生解析 tsconfig 的 paths（取代 vite-tsconfig-paths 插件）；
    // `@` 保留显式 alias，与 vitest.config.ts 一致（见那边的说明）。
    resolve: {
      tsconfigPaths: true,
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },

    optimizeDeps: {
      include: ['vant', '@vue3-monorepo/shared/components-h5'],
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`,
        },
      },
      postcss: {
        plugins: [
          mobileForever({
            viewportWidth,
            maxDisplayWidth: 600,
            appSelector: '#app',
          }),
        ],
      },
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
          rewrite: (path: string) => path.replace(new RegExp(`^${env.VITE_API_PREFIX || '/api'}`), ''),
        },
      },
    },

    build: {
      // 不写 target：用 Vite 8 的默认值 'baseline-widely-available'（Baseline 广泛可用）。
      // 之前钉死的 'es2015' 是 Vite 2 时代模板留下的默认值，没有对应的兼容性需求——
      // Vue 3 本身就不支持 IE，产物里其他依赖也早就是 ES2015+，钉低只会多做无谓降级。
      // 确有更老的 WebView 要支持时，在这里显式写 target 并注明是哪个宿主。
      sourcemap: env.VITE_SOURCEMAP === 'true',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // 同 admin：Vite 8 底层是 rolldown，manualChunks 已 @deprecated，改用 codeSplitting.groups。
          // 顺序敏感——vant / vconsole / vue-i18n 这些更具体的要排在 vue 之前。
          codeSplitting: {
            groups: [
              { name: 'vant', test: /[\\/]node_modules[\\/](vant|@vant)[\\/]/ },
              { name: 'vconsole', test: /[\\/]node_modules[\\/]vconsole[\\/]/ },
              { name: 'vue-i18n', test: /[\\/]node_modules[\\/](vue-i18n|@intlify)[\\/]/ },
              {
                name: 'vue-vendor',
                test: /[\\/]node_modules[\\/](vue|vue-router|vue-demi|pinia|pinia-plugin-persistedstate|@vue|@vueuse)[\\/]/,
              },
              { name: 'utils', test: /[\\/]node_modules[\\/](axios|dayjs|lodash-es)[\\/]/ },
            ],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  }
})
