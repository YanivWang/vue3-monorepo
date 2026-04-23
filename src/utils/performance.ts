import type { Metric } from 'web-vitals'
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

/**
 * Web Vitals 指标评级阈值
 * 参考：https://web.dev/articles/vitals
 */
const THRESHOLDS: Record<string, [number, number]> = {
  CLS: [0.1, 0.25], // good < 0.1, needs-improvement < 0.25, poor >= 0.25
  INP: [200, 500], // ms
  LCP: [2500, 4000], // ms
  FCP: [1800, 3000], // ms
  TTFB: [800, 1800] // ms
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const [good, poor] = THRESHOLDS[name] ?? [Infinity, Infinity]
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

/**
 * 将指标上报到分析服务
 * 生产环境替换为实际的上报逻辑（如 navigator.sendBeacon / fetch）
 */
function sendToAnalytics(metric: Metric): void {
  const rating = getRating(metric.name, metric.value)

  if (import.meta.env.DEV) {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
    console.info(`[Web Vitals] ${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${rating})`)
    return
  }

  // 生产环境示例（取消注释并替换端点）：
  // navigator.sendBeacon('/api/performance', JSON.stringify({
  //   name: metric.name,
  //   value: metric.value,
  //   rating,
  //   id: metric.id,
  //   navigationType: metric.navigationType,
  //   url: location.href
  // }))
}

/**
 * 初始化 Web Vitals 收集
 * @param reporter 自定义上报函数，不传则使用内置实现
 *
 * @example
 * // main.ts 中调用
 * initWebVitals()
 *
 * @example
 * // 接入 GA4
 * initWebVitals(metric => {
 *   gtag('event', metric.name, { value: metric.value })
 * })
 */
export function initWebVitals(reporter?: (metric: Metric) => void): void {
  const handler = reporter ?? sendToAnalytics
  onCLS(handler)
  onINP(handler)
  onLCP(handler)
  onFCP(handler)
  onTTFB(handler)
}
