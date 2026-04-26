import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from './stores'
import { setupPlugins } from './plugins'
import { registerDirectives } from './directives'
import { installComponents } from '@vue3-mono/shared/components-pc'
import { initWebVitals } from '@vue3-mono/shared/utils'

// Element Plus 预编译 CSS（须在自定义全局样式之前引入，方便覆盖）
import 'element-plus/dist/index.css'
// Element Plus 暗黑模式 CSS 变量（须在 dist/index.css 之后引入）
import 'element-plus/theme-chalk/dark/css-vars.css'
// 全局样式（包含 reset、工具类、暗黑变量覆盖等）
import './assets/styles/index.scss'

async function bootstrap(): Promise<void> {
  const app = createApp(App)

  // 1. 注册 Pinia（须最先，其他模块依赖它）
  setupStore(app)

  // 2. 全局指令（依赖 Pinia）
  registerDirectives(app)

  // 3. 全局共享组件（@vue3-mono/shared/components-pc）
  installComponents(app)

  // 4. 注册路由（须在 setupPlugins 前，Sentry 需要 router 实例）
  app.use(router)

  // 5. 注册全局插件（Element Plus、vue-i18n、Sentry 等）
  setupPlugins(app, router)

  // 6. 等待路由准备完成后挂载，避免首屏路由守卫未执行
  await router.isReady()

  app.mount('#app')

  // Web Vitals 性能监控（挂载后启动，避免影响首屏性能）
  initWebVitals({
    endpoint: import.meta.env.VITE_VITALS_ENDPOINT,
    dev: import.meta.env.DEV
  })
}

bootstrap()
