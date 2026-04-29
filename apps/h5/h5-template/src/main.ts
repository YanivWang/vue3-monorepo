import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { installComponents as installH5Components } from '@vue3-monorepo/shared/components-h5'
import { useBridge } from '@vue3-monorepo/shared/js-bridge'
import { useVConsole } from '@vue3-monorepo/shared/hooks-h5'

import App from './App.vue'
import { router } from './router'
import { i18n, loadInitialH5I18n } from './composables/useI18n'
import { registerDirectives } from './composables/registerDirectives'
import { startMock } from './mock'
import { useAppStore } from './stores'
import { bootstrapUserInfo } from './bootstrap/userInfo'
import { setupClientErrorReporting } from './plugins/clientErrorReport'
import { collectWebVitals } from './plugins/webVitalsReport'

//在vite里，这样写，目的是把这个scss模块当做 “副作用”执行-构建时会编译成css文件，并挂到整个应用上
//相当于给h5模版加了一个全局link的css样式，保证应用已启动就能加载这些样式
import './styles/index.scss'

async function bootstrap() {
  collectWebVitals()

  await startMock()

  useBridge()

  await loadInitialH5I18n()

  const app = createApp(App)
  setupClientErrorReporting(app)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.use(router)
  app.use(i18n)

  useAppStore().init()

  installH5Components(app)
  registerDirectives(app)

  await router.isReady()
  await bootstrapUserInfo()

  app.mount('#app')

  if (import.meta.env.DEV) useVConsole()
}

bootstrap()
