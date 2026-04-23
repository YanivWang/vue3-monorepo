import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      // 覆盖率门禁：低于阈值时 CI 失败
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      },
      // 只统计业务代码，排除自动生成文件、示例页、类型声明
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/types/**', 'src/main.ts', 'src/**/*.d.ts', 'src/views/examples/**', 'src/stories/**']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
