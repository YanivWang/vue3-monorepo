import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from './stores'
import { setupPlugins } from './plugins'
import { registerPermission } from './directives/permission'

// Element Plus 预编译 CSS（须在自定义全局样式之前引入，方便覆盖）
import 'element-plus/dist/index.css'
// 全局样式（包含 reset、工具类等）
import './assets/styles/index.scss'

async function bootstrap(): Promise<void> {
  const app = createApp(App)

  // 1. 注册 Pinia（须最先，其他模块依赖它）
  setupStore(app)

  // 2. 权限指令（依赖 Pinia）
  registerPermission(app)

  // 3. 注册全局插件（Element Plus 图标、vue-i18n 等）
  setupPlugins(app)

  // 4. 注册路由
  app.use(router)

  // 5. 等待路由准备完成后挂载，避免首屏路由守卫未执行
  await router.isReady()

  app.mount('#app')
}

bootstrap()
