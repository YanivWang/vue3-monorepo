/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PREFIX: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_H5_VIEWPORT_WIDTH: string
  /**
   * 为 `true` 时，在「我的」页显示进入「测试错误上报」（`/dev/error-collect`）的入口。
   */
  readonly VITE_H5_SHOW_ERROR_REPORT_TEST?: string
  readonly VITE_ANALYZE: string
  readonly VITE_SOURCEMAP: string
  readonly VITE_APP_VERSION: string
  /** Web Vitals POST URL，在 `main.ts` 中传入 `WebMonitor.init` */
  readonly VITE_WEB_VITALS_REPORT_URL: string
  /** true/false/未设：见 `src/main.ts` 内 `webMonitorEnvFromVite` */
  readonly VITE_WEB_VITALS_DEBUG: string
  /** 前端错误 POST URL，在 `main.ts` 中传入 `WebMonitor.init` */
  readonly VITE_ERROR_REPORT_URL: string
  /** true/false/未设：见 `src/main.ts` 内 `webMonitorEnvFromVite` */
  readonly VITE_ERROR_REPORT_DEBUG: string
  /**
   * 为 `false` 时关闭客户端错误监控（`WebMonitor.init` → `integrations.clientErrors`）。
   * 未设或其它值：保持开启（与 `VITE_WEB_MONITOR_WEB_VITALS` 可同时用来只开一侧）。
   */
  readonly VITE_WEB_MONITOR_CLIENT_ERRORS?: string
  /**
   * 为 `false` 时关闭 Web Vitals（`integrations.webVitals`）。
   * 未设或其它值：保持开启。
   */
  readonly VITE_WEB_MONITOR_WEB_VITALS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
