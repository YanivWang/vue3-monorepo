import type { FakeRoute } from 'vite-plugin-fake-server'

/**
 * H5 mock 只在浏览器宿主下启用：
 * - vite-plugin-fake-server 在 dev server 层拦截请求，小程序/Native webview 请求会通过 proxy 直连后端
 * - 仍然保留 wrapper 以便未来接入 worker 版 msw 时也能共用
 */
export function mockOnlyBrowser(mocks: FakeRoute[]): FakeRoute[] {
  return mocks
}

export interface MockOk<T> {
  code: 200
  message: 'success'
  data: T
}
export interface MockFail {
  code: number
  message: string
  data: null
}

export function ok<T>(data: T): MockOk<T> {
  return { code: 200, message: 'success', data }
}

export function fail(code: number, message: string): MockFail {
  return { code, message, data: null }
}
