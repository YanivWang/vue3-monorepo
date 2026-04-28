/**
 * Web Vitals 采集与上报：由 `main.ts` 在应用启动时调用 `collectWebVitals()`。
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

/**
 * 将 `web-vitals` 的 {@link Metric} 转为可序列化、便于后端或日志消费的扁平结构。
 * `page` 为 pathname + search；`ts` 为客户端毫秒时间戳。
 */
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

/**
 * 向已配置的 `reportUrl` 发送 JSON 请求体。
 * 优先 `sendBeacon`（页面卸载时更可靠）；未成功则 `fetch` + `keepalive`；失败静默，不抛错。
 */
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

/**
 * 单条指标处理：`toPayload` → 若开启 debug 则 `console.info` → 若配置了 `VITE_WEB_VITALS_REPORT_URL` 则 `postReport` 序列化上报。
 */
export function reportWebVital(metric: Metric): void {
  const payload = toPayload(metric)
  if (debug) {
    console.info(`[Web Vitals] ${metric.name}`, payload)
  }
  if (!reportUrl) return
  postReport(JSON.stringify(payload))
}

/**
 * 注册 FCP、LCP、CLS、TTFB、INP 五项采集，回调均为 {@link reportWebVital}。
 */
export function collectWebVitals(): void {
  if (reportUrl && import.meta.env.DEV) {
    console.info('[Web Vitals] 上报已启用 →', reportUrl)
  }

  // First Contentful Paint 首次内容绘制
  // 浏览器渲染出的第一块内容(文字，图片)等
  // 用户感知 “页面有内容了”，白屏结束了 ≤1.8优秀
  onFCP(reportWebVital)

  // Largest Contentful Paint 最大内容绘制
  // 视口内最大元素被绘制，通常是大标题，大图片，主要内容渲染完毕
  // 用户感触页面渲染完毕了 ≤2.5 优秀
  onLCP(reportWebVital)

  // Cumulative Layout Shift 累计位移偏移
  // 页面加载过程中元素位置偏移量的累加，图片没有尺寸，字体替换，动态插入广告会让CLS变高
  // 用户感触页面抖动 ≤0.1 优秀
  // 反应页面稳定性
  onCLS(reportWebVital)

  // Time to First Byte 首字节时间
  // 从浏览器发出请求，到收到第一个字节，这个时间。
  // 该指标反应了服务器响应速度和网络延时，是其它指标的地基
  onTTFB(reportWebVital)

  // Interaction to Next Paint 交互到下次绘制耗时(交互响应耗时)
  // 用户点击按钮，输入框聚焦交互完成后，浏览器响应的时间
  // 反应了用户交互的响应速度，越小越好(体验越好)
  onINP(reportWebVital)
}
