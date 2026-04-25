import type { Metric } from 'web-vitals'
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

/**
 * Web Vitals 指标评级阈值
 * 参考：https://web.dev/articles/vitals
 */
const THRESHOLDS: Record<string, [number, number]> = {
  CLS: [0.1, 0.25],
  INP: [200, 500],
  LCP: [2500, 4000],
  FCP: [1800, 3000],
  TTFB: [800, 1800]
}

export type Rating = 'good' | 'needs-improvement' | 'poor'

export function getRating(name: string, value: number): Rating {
  const [good, poor] = THRESHOLDS[name] ?? [Infinity, Infinity]
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

export interface InitWebVitalsOptions {
  /** 自定义上报函数；不传则使用默认（dev 控制台 / 生产 sendBeacon） */
  reporter?: (metric: Metric & { rating: Rating }) => void
  /** 生产环境上报端点；未传且 reporter 为空时只在 dev 打印 */
  endpoint?: string
  /** 是否 dev 模式，用于选择日志打印 vs 上报 */
  dev?: boolean
}

function defaultReporter(metric: Metric & { rating: Rating }, endpoint: string, dev: boolean): void {
  if (dev) {
    console.info(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
    return
  }
  if (!endpoint) return

  const payload = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
    url: typeof location !== 'undefined' ? location.href : '',
    timestamp: Date.now()
  })

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload)
  } else if (typeof fetch !== 'undefined') {
    fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(() => {})
  }
}

/**
 * 初始化 Web Vitals 收集（所有主要指标）
 *
 * @example 默认使用
 * initWebVitals({ endpoint: import.meta.env.VITE_VITALS_ENDPOINT, dev: import.meta.env.DEV })
 *
 * @example 自定义上报
 * initWebVitals({ reporter: metric => gtag('event', metric.name, { value: metric.value }) })
 */
export function initWebVitals(options: InitWebVitalsOptions = {}): void {
  const { reporter, endpoint = '', dev = false } = options

  const handler = (metric: Metric) => {
    const enriched = { ...metric, rating: getRating(metric.name, metric.value) }
    if (reporter) {
      reporter(enriched)
    } else {
      defaultReporter(enriched, endpoint, dev)
    }
  }

  onCLS(handler)
  onINP(handler)
  onLCP(handler)
  onFCP(handler)
  onTTFB(handler)
}
