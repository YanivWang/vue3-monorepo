import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vitePluginFakeServer } from 'vite-plugin-fake-server'
import { compression } from 'vite-plugin-compression2'

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

      // Mock 服务（开发环境在 vite devServer 层拦截，业务代码无感知）。
      // infixName: false —— 保持 mock/*.ts 的现有命名，不必改成 *.fake.ts。
      await vitePluginFakeServer({
        include: 'mock',
        infixName: false,
        enableDev: isMock,
      }),

      // 单实例多算法，避免对 generateBundle 重复挂钩导致同路径资源被多次 emit
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

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@vue3-monorepo/shared/styles/tokens/variables" as *;`,
        },
      },
    },

    server: {
      port: 5173,
      open: false,
      cors: true,
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
      // 生产环境关闭 sourcemap；staging 环境可通过 VITE_SOURCEMAP=true 开启
      sourcemap: env.VITE_SOURCEMAP === 'true',
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // 用 codeSplitting.groups 而不是 manualChunks：Vite 8 底层换成 rolldown，
          // manualChunks / advancedChunks 都已标记 @deprecated，只作兼容保留。
          //
          // groups 按顺序匹配，先命中先归属，所以更具体的要排在前面（vue-i18n 先于 vue）。
          // test 匹配的是模块 id，锚在 `node_modules/<包名>/` 上——不要写成宽松的
          // includes('vue')：本仓库目录名就叫 vue3-monorepo，那样会把所有依赖吸进同一个 chunk。
          codeSplitting: {
            groups: [
              { name: 'element-plus', test: /[\\/]node_modules[\\/](element-plus|@element-plus)[\\/]/ },
              { name: 'vue-i18n', test: /[\\/]node_modules[\\/](vue-i18n|@intlify)[\\/]/ },
              {
                name: 'vue-vendor',
                test: /[\\/]node_modules[\\/](vue|vue-router|vue-demi|pinia|pinia-plugin-persistedstate|@vue|@vueuse)[\\/]/,
              },
              { name: 'utils', test: /[\\/]node_modules[\\/](axios|dayjs|lodash-es|js-cookie)[\\/]/ },
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
