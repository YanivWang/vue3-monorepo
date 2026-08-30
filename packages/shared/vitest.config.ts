import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Vite 8 起原生解析 tsconfig 的 paths，vite-tsconfig-paths 插件已无必要。
  // 别名因此只有 tsconfig 一个真源：@/* 与 @vue3-monorepo/* 都从那里来。
  resolve: { tsconfigPaths: true },
  test: {
    name: 'shared',
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
})
