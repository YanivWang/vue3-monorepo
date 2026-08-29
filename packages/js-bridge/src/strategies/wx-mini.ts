import { H5Host } from '../host'
import type { BridgeAbility, BridgeStrategy } from '../types'
import { BridgeError } from '../types'
import {
  createClipboardBridge,
  createDefaultNavigation,
  createLocalStorageBridge,
  createMemoryEvent,
  createUnimplementedAuth,
  createUnimplementedDevice,
  notImplemented,
} from './base'

/**
 * 微信小程序 WebView 内嵌网页（jweixin-1.6.0）。
 *
 * 说明：
 *   1. 微信 WebView 内网页无法直接调用 wx.login 等小程序原生 API；需与小程序宿主页面
 *      约定 postMessage 协议，真正的登录流程在小程序侧完成，H5 这里仅负责触发跳转。
 *   2. 本策略不强制引入 jweixin；在 `window.wx` 存在时使用 JSSDK 功能，否则 fallback。
 *   3. auth.login：默认调用 wx.miniProgram.navigateTo 到登录页面，小程序收到后处理。
 */

interface WxJsSdk {
  miniProgram?: {
    navigateTo?: (opts: { url: string }) => void
    redirectTo?: (opts: { url: string }) => void
    postMessage?: (opts: { data: unknown }) => void
    getEnv?: (cb: (res: { miniprogram: boolean }) => void) => void
  }
  scanQRCode?: (opts: {
    needResult?: 0 | 1
    scanType?: Array<'qrCode' | 'barCode'>
    success?: (res: { resultStr: string }) => void
    fail?: (err: unknown) => void
  }) => void
  chooseImage?: (opts: {
    count?: number
    sizeType?: Array<'original' | 'compressed'>
    sourceType?: Array<'album' | 'camera'>
    success?: (res: { localIds: string[] }) => void
    fail?: (err: unknown) => void
  }) => void
  previewImage?: (opts: { current?: string; urls: string[] }) => void
  chooseWXPay?: (opts: Record<string, unknown>) => void
}

declare global {
  interface Window {
    wx?: WxJsSdk
    WeixinJSBridge?: unknown
  }
}

function getWx(): WxJsSdk | undefined {
  return typeof window !== 'undefined' ? window.wx : undefined
}

export interface WxMiniStrategyOptions {
  /**
   * 小程序登录页面的路径（与小程序团队约定），默认 `/pages/login/index`
   * auth.login 会触发 wx.miniProgram.navigateTo({ url })
   */
  loginPath?: string
}

export function createWxMiniStrategy(options: WxMiniStrategyOptions = {}): BridgeStrategy {
  const host = H5Host.WECHAT_MINI
  const { loginPath = '/pages/login/index' } = options

  const abilities = new Set<BridgeAbility>([
    'navigation.back',
    'navigation.openExternal',
    'navigation.setTitle',
    'storage.get',
    'storage.set',
    'storage.remove',
    'auth.login',
    'ui.toast',
    'ui.previewImage',
    'ui.scanCode',
    'ui.chooseImage',
    'event.on',
    'event.off',
    'event.emit',
    'payment.pay',
    'clipboard.write',
    'clipboard.read',
  ])

  const wx = getWx()

  return {
    host,
    abilities,
    navigation: createDefaultNavigation(host),
    storage: createLocalStorageBridge(host),
    auth: {
      ...createUnimplementedAuth(host),
      async login() {
        const sdk = getWx()
        if (!sdk?.miniProgram?.navigateTo) {
          throw new BridgeError('微信 JSSDK 未加载，无法触发小程序登录', {
            method: 'auth.login',
            host,
            code: 'WX_SDK_MISSING',
          })
        }
        sdk.miniProgram.navigateTo({ url: loginPath })
        return Promise.reject(
          new BridgeError('已跳转小程序登录页，H5 侧需监听 postMessage 回传 code', {
            method: 'auth.login',
            host,
            code: 'NAVIGATE_TO_MINI',
          }),
        )
      },
    },
    ui: {
      async toast({ message, duration = 2000 }) {
        if (typeof window === 'undefined') return
        const el = document.createElement('div')
        el.textContent = message
        Object.assign(el.style, {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '14px',
          zIndex: '9999',
        })
        document.body.appendChild(el)
        await new Promise((r) => setTimeout(r, duration))
        el.remove()
      },
      loading: notImplemented('ui.loading', host),
      hideLoading: notImplemented('ui.hideLoading', host),
      chooseImage(opts = {}) {
        return new Promise((resolve, reject) => {
          if (!wx?.chooseImage)
            return reject(
              new BridgeError('wx.chooseImage 不可用', {
                method: 'ui.chooseImage',
                host,
                code: 'WX_SDK_MISSING',
              }),
            )
          wx.chooseImage({
            count: opts.count ?? 1,
            sizeType: opts.sizeType ?? ['compressed'],
            sourceType: opts.sourceType ?? ['album', 'camera'],
            success: (res) => resolve({ tempFilePaths: res.localIds }),
            fail: (err) => reject(new BridgeError('选择图片失败', { method: 'ui.chooseImage', host, cause: err })),
          })
        })
      },
      async previewImage(opts) {
        if (wx?.previewImage) {
          wx.previewImage({
            urls: opts.urls,
            current: typeof opts.current === 'string' ? opts.current : opts.urls[opts.current ?? 0],
          })
          return
        }
        if (typeof window !== 'undefined') {
          const idx = typeof opts.current === 'number' ? opts.current : 0
          const url = opts.urls[idx] ?? opts.urls[0]
          if (url) window.open(url, '_blank', 'noopener,noreferrer')
        }
      },
      scanCode() {
        return new Promise((resolve, reject) => {
          if (!wx?.scanQRCode)
            return reject(
              new BridgeError('wx.scanQRCode 不可用', {
                method: 'ui.scanCode',
                host,
                code: 'WX_SDK_MISSING',
              }),
            )
          wx.scanQRCode({
            needResult: 1,
            scanType: ['qrCode', 'barCode'],
            success: (res) => resolve({ result: res.resultStr }),
            fail: (err) => reject(new BridgeError('扫码失败', { method: 'ui.scanCode', host, cause: err })),
          })
        })
      },
      async vibrate() {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15)
      },
    },
    event: createMemoryEvent(),
    payment: {
      pay(params) {
        return new Promise((resolve, reject) => {
          if (!wx?.chooseWXPay)
            return reject(
              new BridgeError('wx.chooseWXPay 不可用', {
                method: 'payment.pay',
                host,
                code: 'WX_SDK_MISSING',
              }),
            )
          wx.chooseWXPay({
            ...params,
            success: (raw: unknown) => resolve({ success: true, raw }),
            fail: (err: unknown) =>
              reject(new BridgeError('微信支付失败', { method: 'payment.pay', host, cause: err })),
          })
        })
      },
    },
    device: createUnimplementedDevice(host),
    clipboard: createClipboardBridge(host),
  }
}
