import type { H5Host } from '@vue3-mono/shared'
import type {
  BridgeAbility,
  BridgeAuth,
  BridgeClipboard,
  BridgeDevice,
  BridgeEvent,
  BridgeNavigation,
  BridgePayment,
  BridgeStorage,
  BridgeStrategy,
  BridgeUI
} from '../types'
import { BridgeError } from '../types'

/**
 * 生成一个"统一抛 BridgeError"的 method。
 * 宿主未实现或安全限制时作为 fallback。
 */
export function notImplemented(method: string, host: H5Host): (...args: unknown[]) => Promise<never> {
  return () =>
    Promise.reject(
      new BridgeError(`[bridge] ${method} 在宿主 ${host} 下未实现`, { method, host, code: 'NOT_IMPLEMENTED' })
    )
}

/** 事件总线默认实现（纯内存，无 native） */
export function createMemoryEvent(): BridgeEvent {
  const map = new Map<string, Set<(p: unknown) => void>>()
  return {
    on(event, handler) {
      if (!map.has(event)) map.set(event, new Set())
      map.get(event)!.add(handler as (p: unknown) => void)
    },
    off(event, handler) {
      if (!handler) {
        map.delete(event)
        return
      }
      map.get(event)?.delete(handler as (p: unknown) => void)
    },
    emit(event, payload) {
      map.get(event)?.forEach(h => h(payload))
    }
  }
}

/** 生成 navigation 默认实现（浏览器环境兜底） */
export function createDefaultNavigation(host: H5Host): BridgeNavigation {
  return {
    back(delta = 1) {
      if (typeof window !== 'undefined' && typeof history !== 'undefined') {
        history.go(-Math.abs(delta))
        return Promise.resolve()
      }
      return notImplemented('navigation.back', host)()
    },
    close() {
      if (typeof window !== 'undefined' && typeof window.close === 'function') {
        window.close()
        return Promise.resolve()
      }
      return notImplemented('navigation.close', host)()
    },
    openExternal(url: string) {
      if (typeof window !== 'undefined') {
        window.location.href = url
        return Promise.resolve()
      }
      return notImplemented('navigation.openExternal', host)()
    },
    setTitle(title: string) {
      if (typeof document !== 'undefined') {
        document.title = title
        return Promise.resolve()
      }
      return notImplemented('navigation.setTitle', host)()
    }
  }
}

/** 基于 localStorage 的 storage 兜底 */
export function createLocalStorageBridge(host: H5Host): BridgeStorage {
  const available = typeof localStorage !== 'undefined'
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      if (!available) throw new BridgeError('localStorage 不可用', { method: 'storage.get', host })
      const raw = localStorage.getItem(key)
      if (raw == null) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return raw as unknown as T
      }
    },
    async set(key: string, value: unknown) {
      if (!available) throw new BridgeError('localStorage 不可用', { method: 'storage.set', host })
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    },
    async remove(key: string) {
      if (!available) throw new BridgeError('localStorage 不可用', { method: 'storage.remove', host })
      localStorage.removeItem(key)
    }
  }
}

/** 其它模块的 "全部未实现" 默认壳，便于策略按需覆盖 */
export function createUnimplementedAuth(host: H5Host): BridgeAuth {
  return {
    login: notImplemented('auth.login', host),
    getUserProfile: notImplemented('auth.getUserProfile', host),
    logout: notImplemented('auth.logout', host)
  }
}

export function createUnimplementedUI(host: H5Host): BridgeUI {
  return {
    toast: notImplemented('ui.toast', host),
    loading: notImplemented('ui.loading', host),
    hideLoading: notImplemented('ui.hideLoading', host),
    chooseImage: notImplemented('ui.chooseImage', host),
    previewImage: notImplemented('ui.previewImage', host),
    scanCode: notImplemented('ui.scanCode', host),
    vibrate: notImplemented('ui.vibrate', host)
  }
}

export function createUnimplementedPayment(host: H5Host): BridgePayment {
  return { pay: notImplemented('payment.pay', host) }
}

export function createUnimplementedDevice(host: H5Host): BridgeDevice {
  return {
    getInfo: notImplemented('device.getInfo', host),
    getLocation: notImplemented('device.getLocation', host)
  }
}

/** Clipboard 兜底（使用 navigator.clipboard，支持 HTTPS） */
export function createClipboardBridge(host: H5Host): BridgeClipboard {
  return {
    async write(text: string) {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
      }
      throw new BridgeError('剪贴板不可用', { method: 'clipboard.write', host, code: 'UNAVAILABLE' })
    },
    async read() {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        return navigator.clipboard.readText()
      }
      throw new BridgeError('剪贴板不可用', { method: 'clipboard.read', host, code: 'UNAVAILABLE' })
    }
  }
}

/** 聚合一个 BridgeStrategy 的便捷函数 */
export function composeStrategy(strategy: BridgeStrategy): BridgeStrategy {
  return strategy
}

export function listAllAbilities(): BridgeAbility[] {
  return [
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
  ]
}
