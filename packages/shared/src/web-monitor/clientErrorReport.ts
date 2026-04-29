/**
 * 前端错误采集与上报：与 webVitalsReport 相同 HTTP 通道（sendBeacon / fetch keepalive）。
 * 受 `VITE_ERROR_REPORT_URL`、`VITE_ERROR_REPORT_DEBUG` 控制。
 */
import type { App, ComponentPublicInstance } from 'vue'

const reportUrl = (import.meta.env.VITE_ERROR_REPORT_URL ?? '').trim()
const dbgFlag = import.meta.env.VITE_ERROR_REPORT_DEBUG
const debug = dbgFlag === 'true' || (import.meta.env.DEV && dbgFlag !== 'false')

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

let additionalClientErrorListener: ((payload: ClientErrorPayload) => void) | undefined

/** 附加消费端（如自建日志、与 HTTP 上报并行）；不等同于替换 `VITE_ERROR_REPORT_URL`。 */
export function setAdditionalClientErrorListener(fn: ((payload: ClientErrorPayload) => void) | undefined): void {
  additionalClientErrorListener = fn
}

function currentPage(): string | undefined {
  return typeof location !== 'undefined' ? `${location.pathname}${location.search}` : undefined
}

function truncateStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined
  return stack.length > STACK_MAX ? `${stack.slice(0, STACK_MAX)}…` : stack
}

function postReport(body: string): void {
  if (!reportUrl) return
  try {
    const blob = new Blob([body], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.(reportUrl, blob)) {
      return
    }
  } catch {
    /* 回退到 fetch */
  }
  void fetch(reportUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {
    /* 静默失败 */
  })
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
  'IFRAME'
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
    page: currentPage(),
    ts: Date.now(),
    appVersion: import.meta.env.VITE_APP_VERSION || undefined,
    mode: import.meta.env.MODE
  }
}

export function reportClientError(partial: Omit<ClientErrorPayload, 'ts' | 'mode' | 'page' | 'appVersion'>): void {
  const payload = buildPayload(partial)
  if (debug) {
    console.error('[ClientError]', payload)
  }
  if (reportUrl) {
    postReport(JSON.stringify(payload))
  }
  additionalClientErrorListener?.(payload)
}

/**
 * 注册 Vue errorHandler（链式保留已有 handler）、window error、unhandledrejection。
 * 与 H5 一致：不在 `unhandledrejection` 上调用 `preventDefault`。
 */
export function setupClientErrorReporting(app: App, options?: SetupClientErrorReportingOptions): void {
  if (reportUrl && import.meta.env.DEV) {
    console.info('[ClientError] 上报已启用 →', reportUrl)
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
        const url = getFailedResourceUrl(target)
        reportClientError({
          kind: 'resource',
          message: `Failed to load resource <${tagName}>`,
          source: url || undefined,
          tagName
        })
        return
      }

      const ee = event as ErrorEvent
      const err = ee.error
      const message = err instanceof Error ? err.message : ee.message || ''
      const stack = err instanceof Error ? err.stack : undefined
      reportClientError({
        kind: 'js',
        message,
        stack,
        source: ee.filename || undefined,
        line: ee.lineno || undefined,
        col: ee.colno || undefined
      })
    },
    true
  )

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const { message, stack } = normalizeError(event.reason)
    reportClientError({ kind: 'unhandledrejection', message, stack })
  })
}
