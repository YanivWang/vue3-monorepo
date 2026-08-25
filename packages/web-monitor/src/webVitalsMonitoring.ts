/**
 * Core Web Vitals 等性能指标的采集与上报。
 * 上报地址、调试开关、release / environment 由调用方通过 `configureWebVitalsSdk` 或 `WebMonitor.init` 传入；
 * HTTP 投递见同目录 `monitoringHttpTransport`。本模块不读取打包工具或仓库约定的环境变量。
 */
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'
import { getCurrentPagePath, postJsonReport } from './monitoringHttpTransport'

export type WebVitalPayload = {
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

export type WebVitalsSdkConfig = {
  webVitalsReportUrl?: string
  beforeWebVitalReport?: (payload: WebVitalPayload) => WebVitalPayload | null
  /** 写入载荷 `appVersion` */
  release?: string
  /** 写入载荷 `mode` */
  environment?: string
  /** `true` 时每条指标 `console.info`，并在开启上报 URL 时打印接入日志 */
  debug?: boolean
}

let sdkWebVitalsConfig: WebVitalsSdkConfig = {}

/** SDK / 测试用：以本次传入对象为准完全覆盖运行时配置（未传的键将不再有值） */
export function configureWebVitalsSdk(config: WebVitalsSdkConfig): void {
  sdkWebVitalsConfig = { ...config }
}

function effectiveWebVitalsReportUrl(): string {
  return (sdkWebVitalsConfig.webVitalsReportUrl ?? '').trim()
}

function toPayload(metric: Metric): WebVitalPayload {
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    page: getCurrentPagePath(),
    ts: Date.now(),
    appVersion: sdkWebVitalsConfig.release || undefined,
    mode: sdkWebVitalsConfig.environment ?? ''
  }
}

export function reportWebVital(metric: Metric): void {
  const built = toPayload(metric)
  // 注意用三元而非 `?? built`：`beforeWebVitalReport` 返回 null 表示「丢弃该条」，`??` 会把 null 换回 built
  const beforeHook = sdkWebVitalsConfig.beforeWebVitalReport
  const payload = beforeHook ? beforeHook(built) : built
  if (payload === null) return
  if (sdkWebVitalsConfig.debug) {
    console.info(`[Web Vitals] ${metric.name}`, payload)
  }
  const url = effectiveWebVitalsReportUrl()
  if (!url) return
  postJsonReport(JSON.stringify(payload), url)
}

let webVitalsCollectorsAttached = false

export function collectWebVitals(): void {
  if (webVitalsCollectorsAttached) {
    console.warn('[Web Vitals] collectWebVitals 已注册，跳过重复调用')
    return
  }
  webVitalsCollectorsAttached = true

  const url = effectiveWebVitalsReportUrl()
  if (url && sdkWebVitalsConfig.debug) {
    console.info('[Web Vitals] 上报已启用 →', url)
  }

  onFCP(reportWebVital)
  onLCP(reportWebVital)
  onCLS(reportWebVital)
  onTTFB(reportWebVital)
  onINP(reportWebVital)
}
