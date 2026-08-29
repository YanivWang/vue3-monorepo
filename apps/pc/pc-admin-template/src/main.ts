import { createApp } from 'vue'
import { ElMessage } from 'element-plus'
import { WebMonitor, buildWebMonitorInit, type WebMonitorInitEnvFields } from '@vue3-monorepo/web-monitor'
import App from './App.vue'
import router from './router'
import { loadInitialAdminI18n } from '@/locales'
import { setupStore } from './stores'
import { setupPlugins } from './plugins'
import { registerDirectives } from './directives'
import { installComponents } from '@vue3-monorepo/shared/components-pc'

// Element Plus 预编译 CSS（须在自定义全局样式之前引入，方便覆盖）
import 'element-plus/dist/index.css'
// Element Plus 暗黑模式 CSS 变量（须在 dist/index.css 之后引入）
import 'element-plus/theme-chalk/dark/css-vars.css'
// 全局样式（包含 reset、工具类、暗黑变量覆盖等）
import './assets/styles/index.scss'

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
      (import.meta.env.DEV && import.meta.env.VITE_WEB_VITALS_DEBUG !== 'false'),
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

async function bootstrap(): Promise<void> {
  const app = createApp(App)
  WebMonitor.init(
    buildWebMonitorInit(app, {
      ...webMonitorEnvFromVite(),
      afterVueError: (err) => {
        if (import.meta.env.DEV) {
          const message = err instanceof Error ? err.message : String(err)
          ElMessage.error(`[Vue 错误] ${message}`)
        }
      },
    }),
  )

  // 1. 注册 Pinia（须最先，其他模块依赖它）
  setupStore(app)

  // 2. 异步注入当前语言与 fallback 的 shared 词条（语言包懒加载 chunk）
  await loadInitialAdminI18n()

  // 3. 全局指令（依赖 Pinia）
  registerDirectives(app)

  // 4. 全局共享组件（@vue3-monorepo/shared/components-pc）
  installComponents(app)

  // 5. 注册路由（须在 setupPlugins 前）
  app.use(router)

  // 6. 注册全局插件（Element Plus、vue-i18n 等）
  setupPlugins(app)

  // 7. 等待路由准备完成后挂载，避免首屏路由守卫未执行
  await router.isReady()

  app.mount('#app')
}

bootstrap().catch((err) => {
  // 入口启动失败若不接住，只会变成一个没有任何线索的白屏
  console.error('[bootstrap] 应用启动失败', err)
})
