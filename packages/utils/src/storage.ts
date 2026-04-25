import Cookies from 'js-cookie'

/**
 * 通用存储工具（Cookie / localStorage / sessionStorage）
 * - Cookie 封装默认用于 Token 存储，可搭配 HttpOnly 策略
 * - localStorage 支持 JSON 序列化 + 可选过期时间（秒）
 * - sessionStorage 支持 JSON 序列化
 *
 * 具体 key 定义应在消费方（apps/packages/shared/enums/StorageKey）管理，
 * 本模块只提供行为。Token 封装保留可直接按 key 调用的顶层 API，方便 request 包使用。
 */

// ────────────────────────────────────────────────────────────
//  Cookie 通用 API
// ────────────────────────────────────────────────────────────

export const cookie = {
  get: (key: string) => Cookies.get(key),
  set: (key: string, value: string, expires = 1) => Cookies.set(key, value, { expires }),
  remove: (key: string) => Cookies.remove(key)
}

// ────────────────────────────────────────────────────────────
//  localStorage 封装（带 JSON + 过期 TTL）
// ────────────────────────────────────────────────────────────

interface StorageItem<T> {
  value: T
  /** 过期时间戳（ms），undefined 表示永不过期 */
  expire?: number
}

/**
 * 设置 localStorage 数据
 * @param key 存储 key
 * @param value 存储值
 * @param ttl 过期时长（秒），不传则永久存储
 */
export function lsSet<T>(key: string, value: T, ttl?: number): void {
  if (typeof localStorage === 'undefined') return
  const item: StorageItem<T> = {
    value,
    expire: ttl ? Date.now() + ttl * 1000 : undefined
  }
  localStorage.setItem(key, JSON.stringify(item))
}

/** 获取 localStorage 数据，过期自动删除并返回 null */
export function lsGet<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const item = JSON.parse(raw) as StorageItem<T>
    if (item.expire !== undefined && Date.now() > item.expire) {
      localStorage.removeItem(key)
      return null
    }
    return item.value
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export function lsRemove(key: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(key)
}

export function lsClear(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.clear()
}

// ────────────────────────────────────────────────────────────
//  sessionStorage 封装
// ────────────────────────────────────────────────────────────

export function ssSet<T>(key: string, value: T): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function ssGet<T>(key: string): T | null {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function ssRemove(key: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(key)
}

export function ssClear(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.clear()
}

// ────────────────────────────────────────────────────────────
//  Token Helper Factory（传入 key 以创建独立实例）
// ────────────────────────────────────────────────────────────

export interface TokenStorage {
  getToken(): string | undefined
  setToken(token: string, expires?: number): void
  removeToken(): void
  getRefreshToken(): string | undefined
  setRefreshToken(token: string, expires?: number): void
  removeRefreshToken(): void
}

export interface CreateTokenStorageOptions {
  tokenKey: string
  refreshTokenKey: string
  /** token 默认有效天数，默认 1 */
  tokenExpires?: number
  /** refresh token 默认有效天数，默认 7 */
  refreshExpires?: number
}

/**
 * 根据 key 构造一组 Token 存取器（两端通用：底层仍基于 js-cookie）
 */
export function createTokenStorage(options: CreateTokenStorageOptions): TokenStorage {
  const { tokenKey, refreshTokenKey, tokenExpires = 1, refreshExpires = 7 } = options
  return {
    getToken: () => cookie.get(tokenKey),
    setToken: (token, expires = tokenExpires) => cookie.set(tokenKey, token, expires),
    removeToken: () => cookie.remove(tokenKey),
    getRefreshToken: () => cookie.get(refreshTokenKey),
    setRefreshToken: (token, expires = refreshExpires) => cookie.set(refreshTokenKey, token, expires),
    removeRefreshToken: () => cookie.remove(refreshTokenKey)
  }
}
