import type { App } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 开启持久化插件（各 Store 通过 persist 选项声明持久化策略）
pinia.use(createPersistedState())

/** 注册 Pinia 插件 */
export function setupStore(app: App): void {
  app.use(pinia)
}

export default pinia

// 统一导出所有 store
export * from './modules/user'
export * from './modules/app'
export * from './modules/permission'
export * from './modules/tabs'
