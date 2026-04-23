import Cookies from 'js-cookie'

/** Token 存储 key，优先读取环境变量 */
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'access_token'

// ────────────────────────────────────────────────────────────
//  Token 操作（使用 Cookie 存储，可配合 HttpOnly 策略）
// ────────────────────────────────────────────────────────────

/** 获取 Token */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

/** 设置 Token，expires 单位：天，默认 1 天 */
export function setToken(token: string, expires = 1): void {
  Cookies.set(TOKEN_KEY, token, { expires })
}

/** 移除 Token */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY)
}

// ────────────────────────────────────────────────────────────
//  localStorage 封装（带 JSON 序列化 + 过期时间支持）
// ────────────────────────────────────────────────────────────

interface StorageItem<T> {
  value: T
  /** 过期时间戳（ms），undefined 表示永不过期 */
  expire?: number
}

/**
 * 设置 localStorage 数据
 * @param key   存储 key
 * @param value 存储值
 * @param ttl   过期时长（秒），不传则永久存储
 */
export function lsSet<T>(key: string, value: T, ttl?: number): void {
  const item: StorageItem<T> = {
    value,
    expire: ttl ? Date.now() + ttl * 1000 : undefined,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

/**
 * 获取 localStorage 数据，已过期时自动删除并返回 null
 */
export function lsGet<T>(key: string): T | null {
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

/** 删除 localStorage 数据 */
export function lsRemove(key: string): void {
  localStorage.removeItem(key)
}

/** 清空 localStorage */
export function lsClear(): void {
  localStorage.clear()
}

// ────────────────────────────────────────────────────────────
//  sessionStorage 封装（同 localStorage，但页面关闭即失效）
// ────────────────────────────────────────────────────────────

export function ssSet<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function ssGet<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function ssRemove(key: string): void {
  sessionStorage.removeItem(key)
}

export function ssClear(): void {
  sessionStorage.clear()
}
