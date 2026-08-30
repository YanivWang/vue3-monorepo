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
  // 用 vitest 的假定时器推进时间，而不是 spy 掉全局 setTimeout：
  // 后者要跟 DOM / Node 两套 setTimeout 类型声明较劲，而且测的是「调用参数」
  // 而非「真的等了这么久」。这里断言的是「差 1ms 不 resolve、到点才 resolve」。
  const cases = [
    { times: 1, baseDelay: 1000, expected: 1000 },
    { times: 2, baseDelay: 1000, expected: 2000 },
    { times: 3, baseDelay: 1000, expected: 4000 },
    { times: 1, baseDelay: 250, expected: 250 },
  ]

  it.each(cases)('第 $times 次重试、base=$baseDelay 时等 $expected ms', async ({ times, baseDelay, expected }) => {
    vi.useFakeTimers()
    try {
      const settled = vi.fn()
      void retryDelay(times, baseDelay).then(settled)

      await vi.advanceTimersByTimeAsync(expected - 1)
      expect(settled).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1)
      expect(settled).toHaveBeenCalledOnce()
    } finally {
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
