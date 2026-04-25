import type { App } from 'vue'
import type { Router } from 'vue-router'

/**
 * Sentry 初始化配置
 *
 * 使用方式：
 *   1. 在 Sentry 控制台创建项目，获取 DSN
 *   2. 在 .env.production / .env.staging 中配置：
 *      VITE_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/0
 *      VITE_SENTRY_ENV=production
 *   3. Sentry 会自动捕获 Vue 组件错误 + 路由 breadcrumb
 *
 * Source Map 上报（可选）：
 *   在 vite.config.ts 的 build.sourcemap 为 true 时，
 *   安装 @sentry/vite-plugin 并在 plugins 中配置。
 */

interface SentryConfig {
  app: App
  router: Router
}

export async function setupSentry({ app, router }: SentryConfig): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_SENTRY_ENV ?? import.meta.env.MODE

  // DSN 未配置时跳过初始化（开发环境通常不需要上报）
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] DSN 未配置，跳过初始化。生产环境请设置 VITE_SENTRY_DSN。')
    }
    return
  }

  // 按需动态加载 Sentry，避免影响首屏包体积
  const Sentry = await import('@sentry/vue')

  Sentry.init({
    app,
    dsn,
    environment,
    release: import.meta.env.VITE_APP_VERSION,

    // 路由追踪：自动记录页面切换 transaction
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true
      })
    ],

    // 性能采样率：生产环境建议 0.1（10%），staging 可设 1.0（100%）
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session Replay 采样：正常 10%，发生错误时 100%
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // 忽略常见无关错误
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Network Error$/,
      /^Request aborted$/,
      /ChunkLoadError/
    ],

    // 屏蔽本地地址，避免开发/测试数据污染
    denyUrls: [/localhost/, /127\.0\.0\.1/, /\[::1\]/],

    beforeSend(event) {
      // 可在此处过滤 / 脱敏敏感字段
      return event
    }
  })
}
