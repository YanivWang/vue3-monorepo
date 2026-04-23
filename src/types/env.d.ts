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
  readonly VITE_REFRESH_TOKEN_KEY: string
  /** 业务层成功码，与响应体 `code` 字段一致，默认 200；部分后端为 0 时设为 0 */
  readonly VITE_API_SUCCESS_CODE: string
  /** 为 true 时走 src/mock 内建数据，不请求真实 HTTP */
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
