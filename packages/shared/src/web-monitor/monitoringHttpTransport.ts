/**
 * 监控数据的 HTTP 投递：JSON 体经 sendBeacon，失败则 fetch + keepalive。
 * 供 `webVitalsMonitoring` 与 `clientErrorMonitoring` 内部复用；不对外导出。
 */
export function getCurrentPagePath(): string | undefined {
  return typeof location !== 'undefined' ? `${location.pathname}${location.search}` : undefined
}

export function postJsonReport(body: string, url: string): void {
  if (!url) return
  try {
    const blob = new Blob([body], { type: 'application/json' })
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.(url, blob)) {
      return
    }
  } catch {
    /* 回退到 fetch */
  }
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {
    /* 静默失败，避免影响业务 */
  })
}
