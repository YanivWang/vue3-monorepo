import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    name: 'h5',
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      // 这里刻意不设 thresholds：本文件在根 vitest.config.ts 的 test.projects 下运行时，
      // 项目级 coverage 配置整体不生效——阈值只认根配置那一份。曾经写死过 60/50 的数字，
      // 结果是：根门禁按根阈值判，谁也没在用这组数；而 `pnpm --filter ... test:coverage`
      // 一跑就红，红的还跟改动无关。留下的 coverage 段只服务「单独看某个 app 的报告」。
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/types/**', 'src/main.ts', 'src/**/*.d.ts', 'src/views/examples/**'],
    },
  },
  // `tsconfigPaths` 让 Vite 8 原生解析 tsconfig 的 paths（取代 vite-tsconfig-paths 插件），
  // 跨包的 @vue3-monorepo/* 由它负责。
  // `@` 仍保留一条显式 alias：vitest 的 `vi.mock('@/api/...')` 走的是 resolve.alias，
  // 只靠 tsconfigPaths 时 mock 路径与源码 import 解析成不同 id，mock 会静默失效
  // （表现为单测真的发起网络请求）。create-vue 脚手架同样是显式 alias。
  resolve: {
    tsconfigPaths: true,
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
