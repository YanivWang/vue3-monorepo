import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue(), tsconfigPaths({ loose: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      // 严格 external：所有 peer / 跨包依赖都不内联
      external: ['vue', 'element-plus', '@element-plus/icons-vue', '@vueuse/core', /^@vue3-mono\//],
      output: {
        assetFileNames: 'styles/[name][extname]',
        preserveModules: true,
        preserveModulesRoot: 'src'
      }
    }
  }
})
