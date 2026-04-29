import { H5Host } from '@vue3-monorepo/shared/enums'
import type { BridgeAbility, BridgeStrategy } from '../types'
import { BridgeError } from '../types'
import { createClipboardBridge, createLocalStorageBridge, createMemoryEvent } from './base'

/**
 * 原生 App（iOS WKWebView / Android WebView）策略。
 *
 * 设计：
 *   - 调用约定：window.__nativeBridge__.call(method, payload) → Promise<result>
 *     或通过 iOS webkit.messageHandlers / Android prompt / addJavascriptInterface
 *   - 我们做统一抽象：优先使用 `window.__nativeBridge__` 注入的 call；
 *     若无则 fallback 到 iOS webkit / Android 原生接口；再无则抛 BridgeError
 *   - native 侧回调通过 window.__nativeBridgeCallback__(callId, result, err) 返回
 *
 * 业务侧只需在 native 中注入 window.__nativeBridge__，不需要关心策略内部。
 */

interface NativeBridgeInjector {
  call: (method: string, payload?: unknown) => Promise<unknown>
}

interface WebKitMessageHandler {
  postMessage(data: unknown): void
}

interface WebKitMessageHandlers {
  nativeBridge?: WebKitMessageHandler
  [name: string]: WebKitMessageHandler | undefined
}

declare global {
  interface Window {
    __nativeBridge__?: NativeBridgeInjector
    __nativeBridgeCallback__?: (callId: string, result?: unknown, error?: string) => void
    webkit?: { messageHandlers?: WebKitMessageHandlers }
    AndroidBridge?: { call?: (method: string, payload: string) => string | void }
  }
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** 构造统一 native call：优先使用业务注入，fallback 到 iOS/Android 原生通道 */
function createNativeCaller(host: H5Host): (method: string, payload?: unknown) => Promise<unknown> {
  return (method, payload) => {
    if (typeof window === 'undefined') {
      return Promise.reject(new BridgeError('非浏览器环境', { method, host, code: 'NO_WINDOW' }))
    }

    if (window.__nativeBridge__?.call) {
      return window.__nativeBridge__.call(method, payload)
    }

    return new Promise((resolve, reject) => {
      const callId = uuid()
      // native 侧回调
      const prev = window.__nativeBridgeCallback__
      window.__nativeBridgeCallback__ = (id, result, err) => {
        if (id !== callId) {
          prev?.(id, result, err)
          return
        }
        window.__nativeBridgeCallback__ = prev
        if (err) reject(new BridgeError(err, { method, host, code: 'NATIVE_ERROR' }))
        else resolve(result)
      }

      const msg = { method, payload, callId }

      // iOS WKWebView
      const wk = window.webkit?.messageHandlers?.nativeBridge
      if (wk?.postMessage) {
        wk.postMessage(msg)
        return
      }

      // Android addJavascriptInterface
      if (window.AndroidBridge?.call) {
        try {
          window.AndroidBridge.call(method, JSON.stringify(msg))
          return
        } catch (e) {
          reject(new BridgeError('AndroidBridge 调用失败', { method, host, cause: e }))
          return
        }
      }

      reject(
        new BridgeError('未检测到 native 桥接通道（__nativeBridge__ / webkit / AndroidBridge）', {
          method,
          host,
          code: 'NO_CHANNEL'
        })
      )
    })
  }
}

export interface NativeAppStrategyOptions {
  /**
   * 可选：覆盖 caller 实现（测试 / 自定义约定使用）
   */
  caller?: (method: string, payload?: unknown) => Promise<unknown>
}

export function createNativeAppStrategy(options: NativeAppStrategyOptions = {}): BridgeStrategy {
  const host = H5Host.NATIVE_APP
  const call = options.caller ?? createNativeCaller(host)

  const abilities = new Set<BridgeAbility>([
    'navigation.back',
    'navigation.close',
    'navigation.openExternal',
    'navigation.setTitle',
    'storage.get',
    'storage.set',
    'storage.remove',
    'auth.login',
    'auth.getUserProfile',
    'auth.logout',
    'ui.toast',
    'ui.loading',
    'ui.hideLoading',
    'ui.chooseImage',
    'ui.previewImage',
    'ui.scanCode',
    'ui.vibrate',
    'event.on',
    'event.off',
    'event.emit',
    'payment.pay',
    'device.getInfo',
    'device.getLocation',
    'clipboard.write',
    'clipboard.read'
  ])

  return {
    host,
    abilities,
    navigation: {
      async back(delta = 1) {
        await call('navigation.back', { delta })
      },
      async close() {
        await call('navigation.close')
      },
      async openExternal(url: string) {
        await call('navigation.openExternal', { url })
      },
      async setTitle(title: string) {
        await call('navigation.setTitle', { title })
        if (typeof document !== 'undefined') document.title = title
      }
    },
    storage: createLocalStorageBridge(host),
    auth: {
      async login(params) {
        const raw = (await call('auth.login', params)) as {
          credential?: string
          openId?: string
        } | null
        if (!raw?.credential) {
          throw new BridgeError('native 返回缺少 credential', {
            method: 'auth.login',
            host,
            code: 'INVALID_RESPONSE'
          })
        }
        return { credential: raw.credential, openId: raw.openId, raw }
      },
      async getUserProfile() {
        return ((await call('auth.getUserProfile')) ?? {}) as Record<string, unknown>
      },
      async logout() {
        await call('auth.logout')
      }
    },
    ui: {
      async toast(opts) {
        await call('ui.toast', opts)
      },
      async loading(title) {
        await call('ui.loading', { title })
      },
      async hideLoading() {
        await call('ui.hideLoading')
      },
      async chooseImage(opts) {
        const r = (await call('ui.chooseImage', opts)) as {
          tempFilePaths?: string[]
          tempFiles?: Array<{ path: string; size: number }>
        } | null
        return { tempFilePaths: r?.tempFilePaths ?? [], tempFiles: r?.tempFiles }
      },
      async previewImage(opts) {
        await call('ui.previewImage', opts)
      },
      async scanCode() {
        const r = (await call('ui.scanCode')) as { result?: string } | null
        return { result: r?.result ?? '' }
      },
      async vibrate(short = true) {
        await call('ui.vibrate', { short })
      }
    },
    event: createMemoryEvent(),
    payment: {
      async pay(params) {
        const raw = await call('payment.pay', params)
        return { success: true, raw }
      }
    },
    device: {
      async getInfo() {
        const r = (await call('device.getInfo')) as Record<string, unknown> | null
        return {
          platform: ((r?.platform as 'ios' | 'android' | 'web') ?? 'unknown') as 'ios' | 'android' | 'web' | 'unknown',
          ...r
        }
      },
      async getLocation() {
        const r = (await call('device.getLocation')) as {
          latitude?: number
          longitude?: number
          accuracy?: number
        } | null
        if (r?.latitude == null || r.longitude == null) {
          throw new BridgeError('native 返回位置信息不完整', {
            method: 'device.getLocation',
            host,
            code: 'INVALID_RESPONSE'
          })
        }
        return { latitude: r.latitude, longitude: r.longitude, accuracy: r.accuracy }
      }
    },
    clipboard: createClipboardBridge(host)
  }
}
