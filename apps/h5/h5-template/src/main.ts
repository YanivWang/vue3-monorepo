import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { installComponents as installH5Components } from '@vue3-mono/shared/components-h5'
import { useBridge } from '@vue3-mono/shared/bridge'
import { useVConsole } from '@vue3-mono/shared/hooks-h5'

import App from './App.vue'
import { router } from './router'
import { i18n } from './composables/useI18n'
import { registerDirectives } from './composables/registerDirectives'
import { startMock } from './mock'
import { useAppStore } from './stores'
import { initSentry } from './plugins/sentry'

import './styles/index.scss'

async function bootstrap() {
  await startMock()

  useBridge()

  const app = createApp(App)
  initSentry(app)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  app.use(router)
  app.use(i18n)

  useAppStore().init()

  installH5Components(app)
  registerDirectives(app)

  app.mount('#app')

  if (import.meta.env.DEV) useVConsole()
}

bootstrap()
