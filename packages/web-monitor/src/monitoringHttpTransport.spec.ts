import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentPagePath, postJsonReport } from './monitoringHttpTransport'

const URL_ = 'https://example.test/report'

describe('getCurrentPagePath', () => {
  it('拼接 pathname + search', () => {
    expect(getCurrentPagePath()).toBe(`${location.pathname}${location.search}`)
  })
})

describe('postJsonReport', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('url 为空时直接返回，不发任何请求', () => {
    const beacon = vi.fn(() => true)
    vi.spyOn(navigator, 'sendBeacon').mockImplementation(beacon)

    postJsonReport('{"a":1}', '')

    expect(beacon).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sendBeacon 成功时不再走 fetch', () => {
    vi.spyOn(navigator, 'sendBeacon').mockReturnValue(true)

    postJsonReport('{"a":1}', URL_)

    expect(navigator.sendBeacon).toHaveBeenCalledOnce()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sendBeacon 返回 false 时回退到 fetch + keepalive', () => {
    vi.spyOn(navigator, 'sendBeacon').mockReturnValue(false)

    postJsonReport('{"a":1}', URL_)

    expect(fetch).toHaveBeenCalledOnce()
    const [url, init] = vi.mocked(fetch).mock.calls[0]!
    expect(url).toBe(URL_)
    expect(init).toMatchObject({ method: 'POST', keepalive: true, body: '{"a":1}' })
  })

  it('sendBeacon 抛异常时同样回退到 fetch，不把异常抛给业务', () => {
    vi.spyOn(navigator, 'sendBeacon').mockImplementation(() => {
      throw new Error('beacon exploded')
    })

    expect(() => postJsonReport('{"a":1}', URL_)).not.toThrow()
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('fetch 自身 reject 时静默吞掉——监控不能反过来打断业务', async () => {
    vi.spyOn(navigator, 'sendBeacon').mockReturnValue(false)
    const rejection = vi.fn()
    process.on('unhandledRejection', rejection)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline'))),
    )

    expect(() => postJsonReport('{"a":1}', URL_)).not.toThrow()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(rejection).not.toHaveBeenCalled()
    process.off('unhandledRejection', rejection)
  })
})
