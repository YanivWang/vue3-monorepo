import { H5Host } from '../host'
import type { BridgeAbility, BridgeStrategy } from '../types'
import { BridgeError } from '../types'
import {
  createClipboardBridge,
  createDefaultNavigation,
  createLocalStorageBridge,
  createMemoryEvent,
  createUnimplementedAuth,
  createUnimplementedPayment,
  notImplemented
} from './base'

/**
 * 浏览器策略：
 * - navigation 使用 history.go / document.title
 * - storage 使用 localStorage
 * - auth 无原生登录，login 抛 BridgeError（要求业务侧走表单登录）
 * - ui.toast / previewImage / vibrate 用原生 DOM、window.open、navigator.vibrate 兜底；
 *   loading / hideLoading / chooseImage / scanCode 未实现，真实项目一般由 Vant/Element 覆盖
 * - device 用 navigator.userAgent / geolocation 实现；payment 标记未实现
 */
export function createBrowserStrategy(): BridgeStrategy {
  const host = H5Host.BROWSER

  const abilities = new Set<BridgeAbility>([
    'navigation.back',
    'navigation.close',
    'navigation.openExternal',
    'navigation.setTitle',
    'storage.get',
    'storage.set',
    'storage.remove',
    'ui.toast',
    'ui.previewImage',
    'ui.vibrate',
    'event.on',
    'event.off',
    'event.emit',
    'clipboard.write',
    'clipboard.read',
    'device.getInfo',
    'device.getLocation'
  ])

  return {
    host,
    abilities,
    navigation: createDefaultNavigation(host),
    storage: createLocalStorageBridge(host),
    auth: {
      ...createUnimplementedAuth(host),
      login() {
        return Promise.reject(
          new BridgeError('浏览器宿主不支持原生登录，请使用表单登录', {
            method: 'auth.login',
            host,
            code: 'NO_NATIVE_AUTH'
          })
        )
      }
    },
    ui: {
      async toast({ message, duration = 2000, icon }) {
        if (typeof window === 'undefined') return
        const el = document.createElement('div')
        el.setAttribute('role', 'status')
        el.textContent = (icon === 'success' ? '✓ ' : icon === 'fail' ? '✕ ' : '') + message
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
          pointerEvents: 'none'
        } satisfies Partial<CSSStyleDeclaration>)
        document.body.appendChild(el)
        await new Promise(r => setTimeout(r, duration))
        el.remove()
      },
      loading: notImplemented('ui.loading', host),
      hideLoading: notImplemented('ui.hideLoading', host),
      chooseImage: notImplemented('ui.chooseImage', host),
      async previewImage({ urls, current }) {
        if (typeof window === 'undefined') return
        const idx = typeof current === 'number' ? current : current ? Math.max(0, urls.indexOf(current)) : 0
        const url = urls[idx] ?? urls[0]
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      },
      scanCode: notImplemented('ui.scanCode', host),
      async vibrate(short = true) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(short ? 15 : 400)
        }
      }
    },
    event: createMemoryEvent(),
    payment: createUnimplementedPayment(host),
    device: {
      async getInfo() {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
        const platform: 'ios' | 'android' | 'web' = /iphone|ipad|ios/i.test(ua)
          ? 'ios'
          : /android/i.test(ua)
            ? 'android'
            : 'web'
        return { platform, model: undefined, system: ua }
      },
      getLocation() {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          return Promise.reject(
            new BridgeError('geolocation 不可用', {
              method: 'device.getLocation',
              host,
              code: 'UNAVAILABLE'
            })
          )
        }
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            pos =>
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              }),
            err =>
              reject(
                new BridgeError(err.message || '定位失败', {
                  method: 'device.getLocation',
                  host,
                  code: err.code,
                  cause: err
                })
              )
          )
        })
      }
    },
    clipboard: createClipboardBridge(host)
  }
}
