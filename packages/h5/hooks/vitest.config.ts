import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'hooks-h5',
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts']
  }
})
