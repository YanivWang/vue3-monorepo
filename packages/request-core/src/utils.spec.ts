import { describe, expect, it, vi } from 'vitest'
import { createNormalizedError, getRequestKey, isSuccessPayload, retryDelay } from './utils'

describe('isSuccessPayload', () => {
  it('同时含 code 与 data 的对象才算业务响应体', () => {
    expect(isSuccessPayload({ code: 0, data: null })).toBe(true)
    expect(isSuccessPayload({ code: 0, message: 'ok', data: { id: 1 } })).toBe(true)
  })

  it('缺字段、非对象、null 一律不算', () => {
    expect(isSuccessPayload({ code: 0 })).toBe(false)
    expect(isSuccessPayload({ data: 1 })).toBe(false)
    expect(isSuccessPayload('{"code":0,"data":1}')).toBe(false)
    // typeof null === 'object'，这是这个守卫最容易漏的分支
    expect(isSuccessPayload(null)).toBe(false)
    expect(isSuccessPayload(undefined)).toBe(false)
  })
})

describe('retryDelay', () => {
  it('按 2^(n-1) 指数退避，且首次重试就等一个 baseDelay', async () => {
    vi.useFakeTimers()
    try {
      const seen: number[] = []
      vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
        seen.push(ms ?? 0)
        fn()
        return 0 as unknown as ReturnType<typeof setTimeout>
      }) as typeof setTimeout)

      await retryDelay(1, 1000)
      await retryDelay(2, 1000)
      await retryDelay(3, 1000)
      await retryDelay(1, 250)

      expect(seen).toEqual([1000, 2000, 4000, 250])
    } finally {
      vi.restoreAllMocks()
      vi.useRealTimers()
    }
  })
})

describe('createNormalizedError', () => {
  it('是真正的 Error（能被 instanceof 和 try/catch 正常处理）', () => {
    const err = createNormalizedError('boom')
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('boom')
  })

  it('init 里的字段会挂到错误对象上', () => {
    const err = createNormalizedError('unauthorized', { status: 401, code: 40100, type: 'auth' })
    expect(err.status).toBe(401)
    expect(err.code).toBe(40100)
    expect(err.type).toBe('auth')
  })
})

describe('getRequestKey', () => {
  it('显式 requestKey 优先', () => {
    expect(getRequestKey({ requestKey: 'custom', url: '/a', method: 'post' })).toBe('custom')
  })

  it('缺省由 METHOD:url 拼出，method 统一大写', () => {
    expect(getRequestKey({ url: '/api/user', method: 'post' })).toBe('POST:/api/user')
    expect(getRequestKey({ url: '/api/user', method: 'GET' })).toBe('GET:/api/user')
  })

  it('method / url 缺省时退化为 GET: ——不抛错', () => {
    expect(getRequestKey({})).toBe('GET:')
    expect(getRequestKey({ url: '/only-url' })).toBe('GET:/only-url')
  })
})
