/**
 * Web Vitals 采集与上报：由各应用 `main.ts` 在启动 early 调用 `collectWebVitals()`。
 * 行为受 `VITE_WEB_VITALS_REPORT_URL`、`VITE_WEB_VITALS_DEBUG` 控制。
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'

const reportUrl = (import.meta.env.VITE_WEB_VITALS_REPORT_URL ?? '').trim()
/** 每条指标是否 console：显式 true 全开；显式 false 则 DEV 下也不刷日志（仍会上报）；未配置则 DEV 下打印便于联调 */
const dbgFlag = import.meta.env.VITE_WEB_VITALS_DEBUG
const debug = dbgFlag === 'true' || (import.meta.env.DEV && dbgFlag !== 'false')

type WebVitalPayload = {
  name: Metric['name']
  value: number
  rating: Metric['rating']
  delta: number
  id: string
  navigationType: string | undefined
  page: string | undefined
  ts: number
  appVersion: string | undefined
  mode: string
}

function toPayload(metric: Metric): WebVitalPayload {
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    page: typeof location !== 'undefined' ? `${location.pathname}${location.search}` : undefined,
    ts: Date.now(),
    appVersion: import.meta.env.VITE_APP_VERSION || undefined,
    mode: import.meta.env.MODE
  }
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
    /* 静默失败，避免影响业务 */
  })
}

export function reportWebVital(metric: Metric): void {
  const payload = toPayload(metric)
  if (debug) {
    console.info(`[Web Vitals] ${metric.name}`, payload)
  }
  if (!reportUrl) return
  postReport(JSON.stringify(payload))
}

export function collectWebVitals(): void {
  if (reportUrl && import.meta.env.DEV) {
    console.info('[Web Vitals] 上报已启用 →', reportUrl)
  }

  onFCP(reportWebVital)
  onLCP(reportWebVital)
  onCLS(reportWebVital)
  onTTFB(reportWebVital)
  onINP(reportWebVital)
}
