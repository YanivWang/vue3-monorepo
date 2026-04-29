import type { App } from 'vue'
import { ElMessage } from 'element-plus'
import { setupClientErrorReporting } from '@vue3-monorepo/shared/web-monitor/client-error'
import { setupElementPlus } from './element-plus'
import { setupI18n } from '@/locales'

export function setupPlugins(app: App): void {
  setupClientErrorReporting(app, {
    afterVueError: err => {
      if (import.meta.env.DEV) {
        const message = err instanceof Error ? err.message : String(err)
        ElMessage.error(`[Vue 错误] ${message}`)
      }
    }
  })
  setupElementPlus(app)
  setupI18n(app)
}
