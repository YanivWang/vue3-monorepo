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
  /** 为 true 时开启 Source Map（staging 环境调试用） */
  readonly VITE_SOURCEMAP: string
  /** 应用版本号（可由 CI 注入，供发布与埋点等使用） */
  readonly VITE_APP_VERSION: string
  /** Web Vitals POST URL，在 `main.ts` 中传入 `WebMonitor.init` */
  readonly VITE_WEB_VITALS_REPORT_URL: string
  readonly VITE_WEB_VITALS_DEBUG: string
  /** 前端错误 POST URL，在 `main.ts` 中传入 `WebMonitor.init` */
  readonly VITE_ERROR_REPORT_URL: string
  readonly VITE_ERROR_REPORT_DEBUG: string
  /** 为 `false` 时关闭客户端错误监控（`integrations.clientErrors`）；未设：开启 */
  readonly VITE_WEB_MONITOR_CLIENT_ERRORS?: string
  /** 为 `false` 时关闭 Web Vitals（`integrations.webVitals`）；未设：开启 */
  readonly VITE_WEB_MONITOR_WEB_VITALS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** 供 `tsc` / IDE 解析 `.vue` 导入（`vue-tsc` 会在此基础上做 SFC 类型推导） */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
