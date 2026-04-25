import type { App } from 'vue'
import type { Router } from 'vue-router'
import { setupElementPlus } from './element-plus'
import { setupI18n } from '@/locales'
import { setupErrorHandler } from './errorHandler'
import { setupSentry } from './sentry'

export function setupPlugins(app: App, router: Router): void {
  // 错误处理最先注册，确保后续插件的错误都能被捕获
  setupErrorHandler(app)
  setupElementPlus(app)
  setupI18n(app)
  // Sentry 异步初始化（DSN 未配置时自动跳过）
  setupSentry({ app, router })
}
