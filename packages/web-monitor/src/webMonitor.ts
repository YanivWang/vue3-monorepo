/**
 * 类 Sentry.init 心智的统一观测入口：一次 `init` 注册 Web Vitals + 前端错误（Vue / 全局）。
 * 不依赖 @sentry/*；上报地址、release、environment、调试开关等均由集成方在调用处传入，本包不读取环境变量或构建注入项。
 */
import type { App } from 'vue'
import type { ClientErrorPayload } from './clientErrorMonitoring'
import { configureClientErrorSdk, reportClientError, setupClientErrorReporting } from './clientErrorMonitoring'
import type { SetupClientErrorReportingOptions } from './clientErrorMonitoring'
import type { WebVitalPayload } from './webVitalsMonitoring'
import { collectWebVitals, configureWebVitalsSdk } from './webVitalsMonitoring'

export type WebMonitorIntegrations = {
  /** 默认 `true` */
  webVitals?: boolean
  /** Vue errorHandler + window error / unhandledrejection / 资源失败；默认 `true` */
  clientErrors?: boolean
}

type WebMonitorInitShared = {
  app: App
  /** 写入两类载荷的 `mode` */
  environment?: string
  /** 写入两类载荷的 `appVersion` */
  release?: string
  /** `true` 时打印 `[ClientError]` 与接入日志（有 URL 时） */
  clientErrorDebug?: boolean
  /** `true` 时打印每条 Web Vitals 与接入日志（有 URL 时） */
  webVitalsDebug?: boolean
  beforeErrorReport?: (payload: ClientErrorPayload) => ClientErrorPayload | null
  beforeWebVitalReport?: (payload: WebVitalPayload) => WebVitalPayload | null
  afterVueError?: SetupClientErrorReportingOptions['afterVueError']
}

/** 默认同时启用错误 + Web Vitals，或未显式关闭任一侧：`errorReportUrl` / `webVitalsReportUrl` 均必填。 */
export type WebMonitorInitOptionsBoth = WebMonitorInitShared & {
  errorReportUrl: string
  webVitalsReportUrl: string
  integrations?: undefined | Record<string, never> | { webVitals?: true; clientErrors?: true }
}

/** 仅关闭 Web Vitals：须提供 `errorReportUrl`。 */
export type WebMonitorInitOptionsVitalsOff = WebMonitorInitShared & {
  errorReportUrl: string
  webVitalsReportUrl?: string
  integrations: { webVitals: false; clientErrors?: true }
}

/** 仅关闭客户端错误：须提供 `webVitalsReportUrl`。 */
export type WebMonitorInitOptionsErrorsOff = WebMonitorInitShared & {
  webVitalsReportUrl: string
  errorReportUrl?: string
  integrations: { clientErrors: false; webVitals?: true }
}

/** 两侧均关闭：不要求上报 URL。 */
export type WebMonitorInitOptionsBothOff = WebMonitorInitShared & {
  errorReportUrl?: string
  webVitalsReportUrl?: string
  integrations: { webVitals: false; clientErrors: false }
}

export type WebMonitorInitOptions =
  | WebMonitorInitOptionsBoth
  | WebMonitorInitOptionsVitalsOff
  | WebMonitorInitOptionsErrorsOff
  | WebMonitorInitOptionsBothOff

/**
 * 与 `app` 一并传入 `WebMonitor.init` 的字段（不含 `app`）。
 * 监控能力仅通过 **`WebMonitor.init` + `integrations`** 开关；业务代码请仅从 **`@vue3-monorepo/web-monitor`** 入口导入，勿绕过入口依赖包内其它源码文件。
 */
export type WebMonitorInitEnvFields = Omit<WebMonitorInitOptions, 'app'>

/** 将 `app` 与 `WebMonitorInitEnvFields` 合并为 `WebMonitor.init` 入参（避免对联合类型做对象展开时推断失准）。 */
export function buildWebMonitorInit(app: App, fields: WebMonitorInitEnvFields): WebMonitorInitOptions {
  return { app, ...fields } as WebMonitorInitOptions
}

function assertReportingUrls(options: WebMonitorInitOptions): void {
  const integrations = options.integrations ?? {}
  const useVitals = integrations.webVitals !== false
  const useErrors = integrations.clientErrors !== false

  if (useErrors && !String(options.errorReportUrl ?? '').trim()) {
    throw new Error(
      'WebMonitor.init：启用客户端错误监控（integrations.clientErrors !== false）时须传入非空的 errorReportUrl',
    )
  }
  if (useVitals && !String(options.webVitalsReportUrl ?? '').trim()) {
    throw new Error(
      'WebMonitor.init：启用 Web Vitals（integrations.webVitals !== false）时须传入非空的 webVitalsReportUrl',
    )
  }
}

function applyRuntimeOptions(options: WebMonitorInitOptions): void {
  const {
    errorReportUrl,
    webVitalsReportUrl,
    environment,
    release,
    beforeErrorReport,
    beforeWebVitalReport,
    clientErrorDebug,
    webVitalsDebug,
  } = options

  configureClientErrorSdk({
    errorReportUrl,
    beforeErrorReport,
    release,
    environment,
    debug: clientErrorDebug,
  })
  configureWebVitalsSdk({
    webVitalsReportUrl,
    beforeWebVitalReport,
    release,
    environment,
    debug: webVitalsDebug,
  })
}

export const WebMonitor = {
  /**
   * 先注册 Web Vitals 监听器，再注册 Vue / 浏览器错误。
   * 宜在 `createApp` 之后尽快调用；重复调用会刷新 SDK 配置，但监听器仅挂载一次。
   *
   * 默认同时开启错误与 Vitals 时 **`errorReportUrl`、`webVitalsReportUrl` 均为必填**（非空字符串）；若关闭其一，可只保留开启侧 URL（详见 `WebMonitorInitOptions` 联合类型）。
   */
  init(options: WebMonitorInitOptions): void {
    assertReportingUrls(options)
    applyRuntimeOptions(options)

    const integrations = options.integrations ?? {}
    const useVitals = integrations.webVitals !== false
    const useErrors = integrations.clientErrors !== false

    if (useVitals) {
      collectWebVitals()
    }
    if (useErrors) {
      setupClientErrorReporting(options.app, {
        afterVueError: options.afterVueError,
      })
    }
  },

  /** 手动上报客户端错误（与 `reportClientError` 相同） */
  reportError: reportClientError,
} as const
