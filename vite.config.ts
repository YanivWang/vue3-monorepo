import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),

      // 自动导入 Vue、Vue Router、Pinia 等 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [
          // 自动导入 Element Plus 相关函数（ElMessage、ElMessageBox 等）
          ElementPlusResolver()
        ],
        // 生成自动导入类型声明文件
        dts: 'src/types/auto-imports.d.ts',
        // 生成 .eslintrc-auto-import.json 供 ESLint 识别全局 API
        eslintrc: {
          enabled: true
        }
      }),

      // 自动导入组件
      Components({
        resolvers: [
          // 自动导入 Element Plus 组件（使用预编译 CSS，避免 additionalData 注入到 EP 内部 SCSS 导致 @use 冲突）
          ElementPlusResolver()
        ],
        // 组件类型声明文件
        dts: 'src/types/components.d.ts',
        // 自定义组件目录
        dirs: ['src/components']
      })
    ],

    resolve: {
      alias: {
        // 路径别名 @ 指向 src 目录
        '@': resolve(__dirname, 'src')
      }
    },

    css: {
      preprocessorOptions: {
        scss: {
          // 使用现代 Sass 编译器 API，消除 legacy-js-api 弃用警告
          api: 'modern-compiler',
          // 全局注入变量文件：@use ... as * 使变量在当前文件作用域内可用
          additionalData: `@use "@/assets/styles/variables.scss" as *;`
        }
      }
    },

    server: {
      // 开发服务器端口
      port: 5173,
      // 自动打开浏览器
      open: false,
      // 允许跨域
      cors: true,
      // 代理配置
      proxy: {
        [env.VITE_API_PREFIX || '/api']: {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^${env.VITE_API_PREFIX || '/api'}`), '')
        }
      }
    },

    build: {
      // 构建目标
      target: 'es2015',
      // 开启 gzip 压缩报告
      reportCompressedSize: false,
      // 消除打包大小超过 500kb 警告
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // 分包策略
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
            utils: ['axios', 'dayjs', 'lodash-es', 'js-cookie']
          },
          // 用于从入口点创建的块的打包输出格式
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
