/// <reference types="vite/client" />

/**
 * Vite 环境变量类型声明
 * 扩展 ImportMetaEnv 接口以获得类型提示
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PREFIX: string
  readonly VITE_TOKEN_KEY: string
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
