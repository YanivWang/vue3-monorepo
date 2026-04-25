import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'bridge',
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts']
  }
})
