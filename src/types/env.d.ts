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
  /** 业务层成功码，与响应体 `code` 字段一致，默认 200；部分后端用 0 时设为 0 */
  readonly VITE_API_SUCCESS_CODE: string
  /** 为 true 时由 vite-plugin-mock 在 devServer 层拦截 API 请求 */
  readonly VITE_USE_MOCK: string
  /** Token 刷新接口路径（相对于 baseURL），默认 /auth/refresh */
  readonly VITE_REFRESH_PATH: string
  /** 为 true 时 build 后自动打开 dist/stats.html 分析包体积 */
  readonly VITE_ANALYZE: string
  /** Web Vitals 上报接口地址（空字符串则不上报） */
  readonly VITE_VITALS_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
