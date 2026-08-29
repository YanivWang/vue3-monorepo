import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ loose: true })],
  test: {
    name: 'request-core',
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
})
