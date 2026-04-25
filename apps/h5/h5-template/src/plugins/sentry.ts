import type { App } from 'vue'
import * as Sentry from '@sentry/vue'

let enabled = false

/**
 * Sentry 骨架：仅当配置了 `VITE_SENTRY_DSN` 时初始化。
 */
export function initSentry(app: App): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()
  if (!dsn) return

  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || undefined,
    sendDefaultPii: false
  })
  enabled = true
}

export function captureException(error: unknown): void {
  if (!enabled) return
  Sentry.captureException(error)
}
