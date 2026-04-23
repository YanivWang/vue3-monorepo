import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { setupStore } from './stores'
import { registerPermission } from './directives/permission'

// Element Plus 图标全局注册
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Element Plus 预编译 CSS（须在自定义全局样式之前引入，方便覆盖）
import 'element-plus/dist/index.css'
// 全局样式（包含 reset、工具类等）
import './assets/styles/index.scss'

async function bootstrap(): Promise<void> {
  const app = createApp(App)

  // 1. 注册 Pinia
  setupStore(app)

  // 2. 权限指令（依赖 Pinia）
  registerPermission(app)

  // 3. 注册路由
  app.use(router)

  // 4. 全局注册 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 5. 等待路由准备完成后挂载，避免首屏路由守卫未执行
  await router.isReady()

  app.mount('#app')
}

bootstrap()
