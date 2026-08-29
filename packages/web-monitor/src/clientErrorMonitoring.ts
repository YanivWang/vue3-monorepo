/**
 * 浏览器端运行时错误监控（Vue / window / 资源失败）：采集、序列化与上报。
 * HTTP 投递与 `webVitalsMonitoring` 共用 `monitoringHttpTransport`（sendBeacon / fetch keepalive）。
 * 上报地址、调试开关、release / environment 由调用方通过 `configureClientErrorSdk` 或 `WebMonitor.init` 传入；
 * 本模块不读取打包工具或仓库约定的环境变量。
 */
import type { App, ComponentPublicInstance } from 'vue'
import { getCurrentPagePath, postJsonReport } from './monitoringHttpTransport'

const STACK_MAX = 16 * 1024

export type ClientErrorKind = 'vue' | 'js' | 'unhandledrejection' | 'resource'

export type ClientErrorPayload = {
  kind: ClientErrorKind
  message: string
  stack?: string
  source?: string
  line?: number
  col?: number
  tagName?: string
  vueInfo?: string
  page?: string
  ts: number
  appVersion?: string
  mode: string
}

export type SetupClientErrorReportingOptions = {
  /**
   * 在 `reportClientError` 之后调用；例如 PC Admin 在 DEV 下用 Element Plus 提示 Vue 运行时错误。
   */
  afterVueError?: (err: unknown, info: string) => void
}

export type ClientErrorSdkConfig = {
  errorReportUrl?: string
  beforeErrorReport?: (payload: ClientErrorPayload) => ClientErrorPayload | null
  /** 写入载荷 `appVersion` */
  release?: string
  /** 写入载荷 `mode` */
  environment?: string
  /** `true` 时每条错误 `console.error('[ClientError]', payload)`，并在开启上报 URL 时打印接入日志 */
  debug?: boolean
}

let sdkClientErrorConfig: ClientErrorSdkConfig = {}

/** SDK / 测试用：以本次传入对象为准完全覆盖运行时配置（未传的键将不再有值） */
export function configureClientErrorSdk(config: ClientErrorSdkConfig): void {
  sdkClientErrorConfig = { ...config }
}

let additionalClientErrorListener: ((payload: ClientErrorPayload) => void) | undefined

/** 附加消费端（如自建日志、与 HTTP 上报并行）；不等同于替换上报 URL。 */
export function setAdditionalClientErrorListener(fn: ((payload: ClientErrorPayload) => void) | undefined): void {
  additionalClientErrorListener = fn
}

function effectiveErrorReportUrl(): string {
  return (sdkClientErrorConfig.errorReportUrl ?? '').trim()
}

function truncateStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined
  return stack.length > STACK_MAX ? `${stack.slice(0, STACK_MAX)}…` : stack
}

function normalizeError(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack }
  return { message: String(err) }
}

const RESOURCE_TAG_NAMES = new Set([
  'IMG',
  'SCRIPT',
  'LINK',
  'VIDEO',
  'AUDIO',
  'SOURCE',
  'TRACK',
  'OBJECT',
  'EMBED',
  'IFRAME',
])

function getFailedResourceUrl(el: Element): string {
  if (el instanceof HTMLLinkElement) return el.href || ''
  if (el instanceof HTMLScriptElement || el instanceof HTMLImageElement) return el.src || ''
  if (el instanceof HTMLMediaElement) return el.currentSrc || el.src || ''
  if (el instanceof HTMLSourceElement || el instanceof HTMLTrackElement) return el.src || ''
  if (el instanceof HTMLObjectElement) return el.data || ''
  if (el instanceof HTMLEmbedElement || el instanceof HTMLIFrameElement) return el.src || ''
  return ''
}

function buildPayload(partial: Omit<ClientErrorPayload, 'ts' | 'mode' | 'page' | 'appVersion'>): ClientErrorPayload {
  return {
    ...partial,
    stack: truncateStack(partial.stack),
    page: getCurrentPagePath(),
    ts: Date.now(),
    appVersion: sdkClientErrorConfig.release || undefined,
    mode: sdkClientErrorConfig.environment ?? '',
  }
}

export function reportClientError(partial: Omit<ClientErrorPayload, 'ts' | 'mode' | 'page' | 'appVersion'>): void {
  const built = buildPayload(partial)
  // 注意用三元而非 `?? built`：`beforeErrorReport` 返回 null 表示「丢弃该条」，`??` 会把 null 换回 built
  const beforeHook = sdkClientErrorConfig.beforeErrorReport
  const payload = beforeHook ? beforeHook(built) : built
  if (payload === null) return
  if (sdkClientErrorConfig.debug) {
    console.error('[ClientError]', payload)
  }
  const url = effectiveErrorReportUrl()
  if (url) {
    postJsonReport(JSON.stringify(payload), url)
  }
  additionalClientErrorListener?.(payload)
}

let clientErrorListenersAttached = false

/**
 * 注册 Vue errorHandler（链式保留已有 handler）、window error、unhandledrejection。
 * 不在 `unhandledrejection` 上调用 `preventDefault`（保持浏览器默认行为）。
 * 重复调用会被忽略（适用于 `WebMonitor.init` 单例语义）。
 */
export function setupClientErrorReporting(app: App, options?: SetupClientErrorReportingOptions): void {
  if (clientErrorListenersAttached) {
    console.warn('[ClientError] setupClientErrorReporting 已注册，跳过重复调用')
    return
  }
  clientErrorListenersAttached = true

  const url = effectiveErrorReportUrl()
  if (url && sdkClientErrorConfig.debug) {
    console.info('[ClientError] 上报已启用 →', url)
  }

  const afterVueError = options?.afterVueError
  const prevHandler = app.config.errorHandler
  app.config.errorHandler = (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
    if (typeof prevHandler === 'function') {
      prevHandler(err, _instance, info)
    }
    const { message, stack } = normalizeError(err)
    reportClientError({ kind: 'vue', message, stack, vueInfo: info })
    afterVueError?.(err, info)
  }

  window.addEventListener(
    'error',
    (event: Event) => {
      const target = event.target
      if (target && target !== window && target instanceof Element && RESOURCE_TAG_NAMES.has(target.tagName)) {
        const tagName = target.tagName
        const resourceUrl = getFailedResourceUrl(target)
        reportClientError({
          kind: 'resource',
          message: `Failed to load resource <${tagName}>`,
          source: resourceUrl || undefined,
          tagName,
        })
        return
      }

      const ee = event as ErrorEvent
      const err: unknown = ee.error
      const message = err instanceof Error ? err.message : ee.message || ''
      const stack = err instanceof Error ? err.stack : undefined
      reportClientError({
        kind: 'js',
        message,
        stack,
        source: ee.filename || undefined,
        line: ee.lineno || undefined,
        col: ee.colno || undefined,
      })
    },
    true,
  )

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const { message, stack } = normalizeError(event.reason)
    reportClientError({ kind: 'unhandledrejection', message, stack })
  })
}
