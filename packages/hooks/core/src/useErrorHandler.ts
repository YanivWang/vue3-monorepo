import { shallowRef, type ShallowRef } from 'vue'

export interface UseErrorHandlerOptions {
  /** 是否在控制台输出，默认 true */
  log?: boolean
  /** 自定义文案 */
  format?: (err: unknown) => string
}

export interface UseErrorHandlerReturn {
  /** 最后一次错误引用 */
  lastError: ShallowRef<unknown>
  /**
   * 归一化错误为展示文案，并可选记录 lastError / console
   * @param context 日志前缀，如 `[useRequest]`
   */
  handle: (err: unknown, context?: string) => string
  clear: () => void
}

function defaultFormat(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

/**
 * UI 无关错误处理：归一化文案 + 可选日志（不直接弹 UI）
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { log = true, format = defaultFormat } = options
  const lastError = shallowRef<unknown>(null)

  function handle(err: unknown, context?: string): string {
    lastError.value = err
    const msg = format(err)
    if (log && typeof console !== 'undefined' && console.error) {
      if (context) console.error(context, err)
      else console.error(err)
    }
    return msg
  }

  function clear() {
    lastError.value = null
  }

  return { lastError, handle, clear }
}
