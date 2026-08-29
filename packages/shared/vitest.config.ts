import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [vue(), tsconfigPaths({ loose: true })],
  test: {
    name: 'shared',
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
})
