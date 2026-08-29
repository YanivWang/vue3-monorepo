import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTokenStorage, lsGet, lsRemove, lsSet, ssGet, ssRemove, ssSet } from './storage'

describe('localStorage 封装', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.useRealTimers())

  it('原样存取任意可 JSON 化的值', () => {
    lsSet('obj', { a: 1, b: [1, 2] })
    expect(lsGet('obj')).toEqual({ a: 1, b: [1, 2] })
    lsSet('num', 0)
    expect(lsGet('num')).toBe(0)
    lsSet('bool', false)
    expect(lsGet('bool')).toBe(false)
  })

  it('未设置的 key 返回 null', () => {
    expect(lsGet('missing')).toBeNull()
  })

  it('不传 ttl 时不写入过期时间，永不过期', () => {
    vi.useFakeTimers()
    lsSet('forever', 'v')
    vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 365)
    expect(lsGet('forever')).toBe('v')
  })

  it('ttl 内可读，过期后返回 null', () => {
    vi.useFakeTimers()
    lsSet('tmp', 'v', 60)
    vi.advanceTimersByTime(59_000)
    expect(lsGet('tmp')).toBe('v')
    vi.advanceTimersByTime(2_000)
    expect(lsGet('tmp')).toBeNull()
  })

  it('过期的 key 会被顺手删掉，不留垃圾', () => {
    vi.useFakeTimers()
    lsSet('tmp', 'v', 1)
    vi.advanceTimersByTime(2_000)
    lsGet('tmp')
    expect(localStorage.getItem('tmp')).toBeNull()
  })

  it('损坏的 JSON 返回 null 并清掉，不抛异常', () => {
    localStorage.setItem('broken', '{not json')
    expect(() => lsGet('broken')).not.toThrow()
    expect(lsGet('broken')).toBeNull()
    expect(localStorage.getItem('broken')).toBeNull()
  })

  it('lsRemove 删除指定 key', () => {
    lsSet('k', 'v')
    lsRemove('k')
    expect(lsGet('k')).toBeNull()
  })
})

describe('sessionStorage 封装', () => {
  beforeEach(() => sessionStorage.clear())

  it('存取与删除', () => {
    ssSet('k', { a: 1 })
    expect(ssGet('k')).toEqual({ a: 1 })
    ssRemove('k')
    expect(ssGet('k')).toBeNull()
  })

  it('损坏的 JSON 返回 null 而不是抛异常', () => {
    sessionStorage.setItem('broken', 'oops')
    expect(ssGet('broken')).toBeNull()
  })

  it('没有 TTL 概念——sessionStorage 的生命周期交给浏览器', () => {
    ssSet('k', 'v')
    expect(JSON.parse(sessionStorage.getItem('k') ?? 'null')).toBe('v')
  })
})

describe('createTokenStorage', () => {
  const store = createTokenStorage({ tokenKey: 'tk', refreshTokenKey: 'rtk' })

  afterEach(() => {
    store.removeToken()
    store.removeRefreshToken()
  })

  it('access / refresh token 互不干扰', () => {
    store.setToken('access-1')
    store.setRefreshToken('refresh-1')
    expect(store.getToken()).toBe('access-1')
    expect(store.getRefreshToken()).toBe('refresh-1')

    store.removeToken()
    expect(store.getToken()).toBeUndefined()
    expect(store.getRefreshToken()).toBe('refresh-1')
  })

  it('两个实例用不同 key 时不会串数据', () => {
    const other = createTokenStorage({ tokenKey: 'tk2', refreshTokenKey: 'rtk2' })
    store.setToken('a')
    other.setToken('b')
    expect(store.getToken()).toBe('a')
    expect(other.getToken()).toBe('b')
    other.removeToken()
  })

  it('未设置时返回 undefined', () => {
    expect(store.getToken()).toBeUndefined()
  })
})
