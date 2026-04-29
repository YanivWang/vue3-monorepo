import type { App, ComponentPublicInstance } from 'vue'
import { ElMessage } from 'element-plus'

/** 错误上报函数类型，可替换为自建监控接口 */
type ErrorReporter = (payload: ErrorPayload) => void

export interface ErrorPayload {
  type: 'vue' | 'global' | 'promise' | 'resource'
  message: string
  stack?: string
  info?: string
  /** global：脚本 URL；resource：失败资源的 URL */
  url?: string
  line?: number
  col?: number
  /** resource：失败节点的标签名，如 IMG、SCRIPT */
  tagName?: string
}

/** 默认上报实现：生产环境可替换为 sendBeacon、自建接口等 */
function defaultReporter(payload: ErrorPayload): void {
  if (import.meta.env.DEV) {
    console.error('[ErrorHandler]', payload)
  }
  // 生产环境示例（取消注释并替换端点）：
  // navigator.sendBeacon('/api/error-report', JSON.stringify(payload))
}

let reporter: ErrorReporter = defaultReporter

/** 替换上报函数（接入自建或第三方监控时使用） */
export function setErrorReporter(fn: ErrorReporter): void {
  reporter = fn
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

/**
 * 全局异常处理插件
 * 覆盖：Vue 组件树错误、全局 JS 错误、静态资源加载失败、未捕获 Promise rejection
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

  // ── 2. 捕获阶段 error：静态资源加载失败 + 全局同步 JS 错误 ────────
  window.addEventListener(
    'error',
    (event: Event) => {
      const target = event.target
      if (target && target !== window && target instanceof Element && RESOURCE_TAG_NAMES.has(target.tagName)) {
        const tagName = target.tagName
        const url = getFailedResourceUrl(target)
        reporter({
          type: 'resource',
          message: `Failed to load resource <${tagName}>`,
          url: url || undefined,
          tagName
        })
        return
      }

      const ee = event as ErrorEvent
      const err = ee.error
      const message = err instanceof Error ? err.message : ee.message || ''
      const stack = err instanceof Error ? err.stack : undefined
      reporter({
        type: 'global',
        message,
        stack,
        url: ee.filename,
        line: ee.lineno,
        col: ee.colno
      })
    },
    true
  )

  // ── 3. 未捕获的 Promise rejection ─────────────────────────────
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const { message, stack } = normalizeError(event.reason)
    reporter({ type: 'promise', message, stack })
    // 阻止浏览器默认输出"Uncaught (in promise)"
    event.preventDefault()
  })
}
