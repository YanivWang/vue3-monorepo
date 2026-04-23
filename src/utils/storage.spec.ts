import { describe, it, expect, beforeEach, vi } from 'vitest'
import { lsSet, lsGet, lsRemove, lsClear, ssSet, ssGet, ssRemove } from './storage'

describe('localStorage 工具函数', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('lsSet / lsGet 基本读写', () => {
    lsSet('key1', { name: 'test' })
    expect(lsGet('key1')).toEqual({ name: 'test' })
  })

  it('lsGet 返回 null（不存在的 key）', () => {
    expect(lsGet('nonexistent')).toBeNull()
  })

  it('lsSet 带 TTL，未过期时正常读取', () => {
    lsSet('ttl_key', 'hello', 10)
    expect(lsGet('ttl_key')).toBe('hello')
  })

  it('lsSet 带 TTL，过期后返回 null 并清除', () => {
    lsSet('expired_key', 'value', 1)
    // 模拟时间已过期
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000)
    expect(lsGet('expired_key')).toBeNull()
    expect(localStorage.getItem('expired_key')).toBeNull()
    vi.restoreAllMocks()
  })

  it('lsRemove 移除指定 key', () => {
    lsSet('del_key', 'data')
    lsRemove('del_key')
    expect(lsGet('del_key')).toBeNull()
  })

  it('lsClear 清空所有', () => {
    lsSet('a', 1)
    lsSet('b', 2)
    lsClear()
    expect(lsGet('a')).toBeNull()
    expect(lsGet('b')).toBeNull()
  })

  it('lsGet 遇到损坏数据返回 null 并清除', () => {
    localStorage.setItem('bad_json', '{ invalid json }')
    expect(lsGet('bad_json')).toBeNull()
    expect(localStorage.getItem('bad_json')).toBeNull()
  })
})

describe('sessionStorage 工具函数', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('ssSet / ssGet 基本读写', () => {
    ssSet('skey', [1, 2, 3])
    expect(ssGet('skey')).toEqual([1, 2, 3])
  })

  it('ssGet 返回 null（不存在的 key）', () => {
    expect(ssGet('missing')).toBeNull()
  })

  it('ssRemove 移除指定 key', () => {
    ssSet('rm_key', 'value')
    ssRemove('rm_key')
    expect(ssGet('rm_key')).toBeNull()
  })
})
