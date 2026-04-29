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
import { WebMonitor, buildWebMonitorInit, type WebMonitorInitEnvFields } from '@vue3-monorepo/shared/web-monitor'

function webMonitorEnvFromVite(): WebMonitorInitEnvFields {
  const clientErrors = import.meta.env.VITE_WEB_MONITOR_CLIENT_ERRORS !== 'false'
  const webVitals = import.meta.env.VITE_WEB_MONITOR_WEB_VITALS !== 'false'
  const shared = {
    errorReportUrl: import.meta.env.VITE_ERROR_REPORT_URL,
    webVitalsReportUrl: import.meta.env.VITE_WEB_VITALS_REPORT_URL,
    release: import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.MODE,
    clientErrorDebug:
      import.meta.env.VITE_ERROR_REPORT_DEBUG === 'true' ||
      (import.meta.env.DEV && import.meta.env.VITE_ERROR_REPORT_DEBUG !== 'false'),
    webVitalsDebug:
      import.meta.env.VITE_WEB_VITALS_DEBUG === 'true' ||
      (import.meta.env.DEV && import.meta.env.VITE_WEB_VITALS_DEBUG !== 'false')
  }
  if (clientErrors && webVitals) {
    return shared
  }
  if (!clientErrors && !webVitals) {
    return { ...shared, integrations: { webVitals: false, clientErrors: false } }
  }
  if (!webVitals) {
    return { ...shared, integrations: { webVitals: false, clientErrors: true } }
  }
  return { ...shared, integrations: { clientErrors: false, webVitals: true } }
}

//在vite里，这样写，目的是把这个scss模块当做 “副作用”执行-构建时会编译成css文件，并挂到整个应用上
//相当于给h5模版加了一个全局link的css样式，保证应用已启动就能加载这些样式
import './styles/index.scss'

async function bootstrap() {
  await startMock()

  useBridge()

  await loadInitialH5I18n()

  const app = createApp(App)
  WebMonitor.init(buildWebMonitorInit(app, webMonitorEnvFromVite()))

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
