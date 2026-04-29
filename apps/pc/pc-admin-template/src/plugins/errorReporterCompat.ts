import {
  setAdditionalClientErrorListener,
  type ClientErrorPayload
} from '@vue3-monorepo/shared/web-monitor/client-error'

/** 与历史 `errorHandler` 插件一致的上报载荷形态（字段 `type` 区别于共享包 `kind`）。 */
export interface ErrorPayload {
  type: 'vue' | 'global' | 'promise' | 'resource'
  message: string
  stack?: string
  info?: string
  url?: string
  line?: number
  col?: number
  tagName?: string
}

function clientToLegacy(p: ClientErrorPayload): ErrorPayload {
  const type: ErrorPayload['type'] =
    p.kind === 'js'
      ? 'global'
      : p.kind === 'unhandledrejection'
        ? 'promise'
        : p.kind === 'resource'
          ? 'resource'
          : 'vue'

  return {
    type,
    message: p.message,
    stack: p.stack,
    info: p.vueInfo,
    url: p.source,
    line: p.line,
    col: p.col,
    tagName: p.tagName
  }
}

/**
 * 附加错误消费（与 `VITE_ERROR_REPORT_URL` 上报并行）。
 * 优先配置环境变量接入 ingest；此方法便于对接沿用旧字段 `ErrorPayload` 的自定义逻辑。
 */
export function setErrorReporter(fn: (payload: ErrorPayload) => void): void {
  setAdditionalClientErrorListener(p => fn(clientToLegacy(p)))
}
