import type { App } from 'vue'
import { createPinia } from 'pinia'

const pinia = createPinia()

/** 注册 Pinia 插件 */
export function setupStore(app: App): void {
  app.use(pinia)
}

export default pinia

// 统一导出所有 store
export * from './modules/user'
export * from './modules/app'
