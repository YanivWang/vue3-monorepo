import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), tsconfigPaths({ loose: true })],
  test: {
    name: 'admin',
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      },
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
