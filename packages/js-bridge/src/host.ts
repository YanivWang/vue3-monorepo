/**
 * H5 运行宿主与 UA 检测（**`@vue3-monorepo/js-bridge`** 内单一真相；**`@vue3-monorepo/shared/enums`**、**`@vue3-monorepo/shared/utils`** 仅再导出）。
 */

/** H5 运行宿主 */
export enum H5Host {
  BROWSER = 'browser',
  WECHAT_MINI = 'wx-mini',
  ALIPAY_MINI = 'ali-mini',
  NATIVE_APP = 'native-app',
}

export interface HostDetection {
  host: H5Host
  userAgent: string
}

/**
 * 浏览器环境下检测当前 UA；非浏览器环境（SSR / Node）返回 BROWSER
 */
export function detectHost(userAgent?: string): H5Host {
  const ua =
    userAgent ??
    (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string' ? navigator.userAgent : '')

  const lowered = ua.toLowerCase()
  if (lowered.includes('micromessenger')) return H5Host.WECHAT_MINI
  if (lowered.includes('alipay') || lowered.includes('aliapp')) return H5Host.ALIPAY_MINI
  if (lowered.includes('yourappschema') || /appwebview/.test(lowered)) return H5Host.NATIVE_APP
  return H5Host.BROWSER
}

/** 是否运行于 WebView（任意非浏览器宿主） */
export function isInWebview(userAgent?: string): boolean {
  const host = detectHost(userAgent)
  return host !== H5Host.BROWSER
}

/** 便捷：是否浏览器 */
export function isBrowser(userAgent?: string): boolean {
  return detectHost(userAgent) === H5Host.BROWSER
}
