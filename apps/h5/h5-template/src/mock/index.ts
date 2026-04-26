import { detectHost } from '@vue3-mono/shared/utils'
import { H5Host } from '@vue3-mono/shared/enums'

/**
 * H5 运行时 Mock 启动：
 *
 * - `apps/h5/mock/**` 下的文件由 vite-plugin-mock 在 **dev server 层** 拦截请求，
 *   适用于浏览器宿主；小程序 / Native WebView 走宿主代理到真实接口时不会命中。
 *
 * - 如需"非浏览器宿主 + 本地 mock"的组合（例如在 APP WebView 里调试），
 *   可在此处动态 import 一个 msw worker 并仅在 `detectHost() === BROWSER` 时启动。
 *
 * 当前策略：
 *   · 浏览器  + DEV + VITE_USE_MOCK=true → vite-plugin-mock 自动生效，无需额外动作
 *   · 非浏览器宿主 → 不做任何 mock，直接命中真实接口
 */
export async function startMock(): Promise<void> {
  if (!import.meta.env.DEV) return
  if (import.meta.env.VITE_USE_MOCK !== 'true') return

  const host = detectHost()
  if (host !== H5Host.BROWSER) {
    console.info('[mock] 非浏览器宿主，跳过 Mock。host=', host)
    return
  }
  console.info('[mock] Vite dev server 已启用 vite-plugin-mock')
}
