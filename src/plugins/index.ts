import type { App } from 'vue'
import { setupElementPlus } from './element-plus'
import { setupI18n } from '@/locales'
import { setupErrorHandler } from './errorHandler'

export function setupPlugins(app: App): void {
  // 错误处理最先注册，确保后续插件的错误都能被捕获
  setupErrorHandler(app)
  setupElementPlus(app)
  setupI18n(app)
}
