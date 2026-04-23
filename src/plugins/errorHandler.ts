import type { App, ComponentPublicInstance } from 'vue'
import { ElMessage } from 'element-plus'

/** 错误上报函数类型，可替换为 Sentry / 自建监控接口 */
type ErrorReporter = (payload: ErrorPayload) => void

export interface ErrorPayload {
  type: 'vue' | 'global' | 'promise'
  message: string
  stack?: string
  info?: string
  url?: string
  line?: number
  col?: number
}

/** 默认上报实现：生产环境可替换为 sendBeacon 或 Sentry */
function defaultReporter(payload: ErrorPayload): void {
  if (import.meta.env.DEV) {
    console.error('[ErrorHandler]', payload)
  }
  // 生产环境示例（取消注释并替换端点）：
  // navigator.sendBeacon('/api/error-report', JSON.stringify(payload))
}

let reporter: ErrorReporter = defaultReporter

/** 替换上报函数（如需接入 Sentry 等第三方） */
export function setErrorReporter(fn: ErrorReporter): void {
  reporter = fn
}

function normalizeError(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) return { message: err.message, stack: err.stack }
  return { message: String(err) }
}

/**
 * 全局异常处理插件
 * 覆盖：Vue 组件树错误、全局 JS 错误、未捕获 Promise rejection
 */
export function setupErrorHandler(app: App): void {
  // ── 1. Vue 组件树内错误 ────────────────────────────────────────
  app.config.errorHandler = (err: unknown, _instance: ComponentPublicInstance | null, info: string) => {
    const { message, stack } = normalizeError(err)
    reporter({ type: 'vue', message, stack, info })

    if (import.meta.env.DEV) {
      ElMessage.error(`[Vue 错误] ${message}`)
    }
  }

  // ── 2. 全局同步 JS 错误 ────────────────────────────────────────
  window.onerror = (event: string | Event, source?: string, lineno?: number, colno?: number, error?: Error) => {
    const message = error?.message ?? String(event)
    const stack = error?.stack
    reporter({ type: 'global', message, stack, url: source, line: lineno, col: colno })
    // 返回 true 阻止浏览器默认控制台报错（可选）
    return false
  }

  // ── 3. 未捕获的 Promise rejection ─────────────────────────────
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const { message, stack } = normalizeError(event.reason)
    reporter({ type: 'promise', message, stack })
    // 阻止浏览器默认输出"Uncaught (in promise)"
    event.preventDefault()
  })
}
