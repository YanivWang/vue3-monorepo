/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PREFIX: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_H5_VIEWPORT_WIDTH: string
  readonly VITE_ANALYZE: string
  readonly VITE_SOURCEMAP: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENV: string
  readonly VITE_APP_VERSION: string
  /** 完整 URL，接收 POST JSON（Web Vitals 指标）；未配置则仅本地调试、不上报 */
  readonly VITE_WEB_VITALS_REPORT_URL: string
  /** 设为 true 则每条指标打印 console；设为 false 则即使在 DEV 也不打印（仍上报）；未设则 DEV 下默认打印 */
  readonly VITE_WEB_VITALS_DEBUG: string
  /** 完整 URL，接收 POST JSON（前端错误）；未配置则仅 console（若开启 debug）、不上报 */
  readonly VITE_ERROR_REPORT_URL: string
  /** true=每条错误 console.error；false=DEV 也不打印（仍尝试上报）；未设则 DEV 默认打印 */
  readonly VITE_ERROR_REPORT_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
