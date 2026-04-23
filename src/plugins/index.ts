import type { App } from 'vue'
import { setupElementPlus } from './element-plus'
import { setupI18n } from '@/locales'

export function setupPlugins(app: App): void {
  setupElementPlus(app)
  setupI18n(app)
}
