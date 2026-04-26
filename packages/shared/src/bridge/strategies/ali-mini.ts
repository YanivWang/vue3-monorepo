import { H5Host } from '@vue3-mono/shared/enums'
import type { BridgeAbility, BridgeStrategy } from '../types'
import { BridgeError } from '../types'
import {
  createClipboardBridge,
  createDefaultNavigation,
  createLocalStorageBridge,
  createMemoryEvent,
  createUnimplementedAuth,
  createUnimplementedDevice,
  notImplemented
} from './base'

/**
 * 支付宝小程序 WebView 策略（ap.js / my 对象）。
 *
 * - 支付宝 web-view 内网页仅暴露 `my.postMessage / my.navigateTo` 等有限 API
 * - auth.login 触发小程序侧登录（my.navigateTo 到登录页）
 */

interface ApSdk {
  postMessage?: (data: unknown) => void
  navigateTo?: (opts: { url: string }) => void
  tradePay?: (opts: { tradeNO: string; success?: (r: unknown) => void; fail?: (e: unknown) => void }) => void
}

declare global {
  interface Window {
    my?: ApSdk
    AlipayJSBridge?: unknown
  }
}

function getMy(): ApSdk | undefined {
  return typeof window !== 'undefined' ? window.my : undefined
}

export interface AlipayMiniStrategyOptions {
  /** 小程序登录页路径，默认 `/pages/login/index` */
  loginPath?: string
}

export function createAlipayMiniStrategy(options: AlipayMiniStrategyOptions = {}): BridgeStrategy {
  const host = H5Host.ALIPAY_MINI
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
    'event.on',
    'event.off',
    'event.emit',
    'payment.pay',
    'clipboard.write',
    'clipboard.read'
  ])

  return {
    host,
    abilities,
    navigation: createDefaultNavigation(host),
    storage: createLocalStorageBridge(host),
    auth: {
      ...createUnimplementedAuth(host),
      async login() {
        const sdk = getMy()
        if (!sdk?.navigateTo) {
          throw new BridgeError('支付宝 JSSDK 未加载，无法触发小程序登录', {
            method: 'auth.login',
            host,
            code: 'AP_SDK_MISSING'
          })
        }
        sdk.navigateTo({ url: loginPath })
        return Promise.reject(
          new BridgeError('已跳转小程序登录页，H5 侧需监听 postMessage 回传', {
            method: 'auth.login',
            host,
            code: 'NAVIGATE_TO_MINI'
          })
        )
      }
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
          zIndex: '9999'
        })
        document.body.appendChild(el)
        await new Promise(r => setTimeout(r, duration))
        el.remove()
      },
      loading: notImplemented('ui.loading', host),
      hideLoading: notImplemented('ui.hideLoading', host),
      chooseImage: notImplemented('ui.chooseImage', host),
      async previewImage(opts) {
        if (typeof window !== 'undefined') {
          const idx = typeof opts.current === 'number' ? opts.current : 0
          const url = opts.urls[idx] ?? opts.urls[0]
          if (url) window.open(url, '_blank', 'noopener,noreferrer')
        }
      },
      scanCode: notImplemented('ui.scanCode', host),
      async vibrate() {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15)
      }
    },
    event: createMemoryEvent(),
    payment: {
      pay(params) {
        return new Promise((resolve, reject) => {
          const sdk = getMy()
          if (!sdk?.tradePay)
            return reject(
              new BridgeError('my.tradePay 不可用', {
                method: 'payment.pay',
                host,
                code: 'AP_SDK_MISSING'
              })
            )
          sdk.tradePay({
            tradeNO: (params.tradeNO as string | undefined) ?? params.orderId,
            success: (raw: unknown) => resolve({ success: true, raw }),
            fail: (err: unknown) =>
              reject(new BridgeError('支付宝支付失败', { method: 'payment.pay', host, cause: err }))
          })
        })
      }
    },
    device: createUnimplementedDevice(host),
    clipboard: createClipboardBridge(host)
  }
}
