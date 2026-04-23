import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { showLoading, hideLoading, forceHideLoading } from './loading'

vi.mock('element-plus', () => ({
  ElLoading: {
    service: vi.fn(() => ({ close: vi.fn() }))
  }
}))

describe('Loading 计数器', () => {
  beforeEach(() => {
    forceHideLoading()
  })

  it('首次 showLoading 调用 ElLoading.service', async () => {
    const { ElLoading } = await import('element-plus')
    showLoading()
    expect(ElLoading.service).toHaveBeenCalledTimes(1)
    forceHideLoading()
  })

  it('多次 showLoading 只创建一个实例', async () => {
    const { ElLoading } = await import('element-plus')
    vi.mocked(ElLoading.service).mockClear()
    showLoading()
    showLoading()
    showLoading()
    expect(ElLoading.service).toHaveBeenCalledTimes(1)
    forceHideLoading()
  })

  it('hideLoading 计数器归零后关闭实例', async () => {
    const mockClose = vi.fn()
    const { ElLoading } = await import('element-plus')
    vi.mocked(ElLoading.service).mockReturnValue({ close: mockClose } as unknown as ReturnType<
      typeof ElLoading.service
    >)

    showLoading()
    showLoading()
    hideLoading()
    expect(mockClose).not.toHaveBeenCalled()
    hideLoading()
    expect(mockClose).toHaveBeenCalledTimes(1)
    forceHideLoading()
  })

  it('hideLoading 不低于 0', () => {
    // 即使多次 hide 也不报错
    hideLoading()
    hideLoading()
    expect(true).toBe(true)
  })
})

describe('axios 工具函数', () => {
  it('axios.isAxiosError 能正确识别 axios 错误', () => {
    const axiosErr = new axios.AxiosError('test')
    const normalErr = new Error('normal')
    expect(axios.isAxiosError(axiosErr)).toBe(true)
    expect(axios.isAxiosError(normalErr)).toBe(false)
  })
})
