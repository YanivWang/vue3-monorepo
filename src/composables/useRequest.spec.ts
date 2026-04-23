import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useRequest } from './useRequest'

// Element Plus ElMessage mock
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

function mountWithRequest<T>(requestFn: () => Promise<T>, options = {}) {
  let result: ReturnType<typeof useRequest>

  const wrapper = mount(
    defineComponent({
      setup() {
        result = useRequest(requestFn, options)
        return result
      },
      template: '<div />'
    })
  )
  return { wrapper, getResult: () => result }
}

describe('useRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初始状态：loading=false, data=undefined, error=null', () => {
    const { getResult } = mountWithRequest(() => Promise.resolve('ok'))
    const r = getResult()
    expect(r.loading.value).toBe(false)
    expect(r.data.value).toBeUndefined()
    expect(r.error.value).toBeNull()
  })

  it('run 触发请求，loading 正确变化', async () => {
    let resolve: (v: string) => void
    const fn = () =>
      new Promise<string>(res => {
        resolve = res
      })
    const { getResult } = mountWithRequest(fn)
    const r = getResult()

    const promise = r.run()
    expect(r.loading.value).toBe(true)

    resolve!('hello')
    await promise
    expect(r.loading.value).toBe(false)
    expect(r.data.value).toBe('hello')
  })

  it('immediate=true 时自动执行', async () => {
    const fn = vi.fn().mockResolvedValue(42)
    const { getResult } = mountWithRequest(fn, { immediate: true })
    await nextTick()
    await nextTick()
    expect(fn).toHaveBeenCalledOnce()
    expect(getResult().data.value).toBe(42)
  })

  it('请求失败时 error 正确赋值', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('网络错误'))
    const { getResult } = mountWithRequest(fn, { showError: false })
    await getResult().run()
    expect(getResult().error.value?.message).toBe('网络错误')
  })

  it('initialData 作为默认值', () => {
    const { getResult } = mountWithRequest(() => Promise.resolve([]), { initialData: ['default'] })
    expect(getResult().data.value).toEqual(['default'])
  })

  it('onSuccess 回调在成功后触发', async () => {
    const onSuccess = vi.fn()
    const fn = vi.fn().mockResolvedValue('result')
    const { getResult } = mountWithRequest(fn, { onSuccess })
    await getResult().run()
    expect(onSuccess).toHaveBeenCalledWith('result')
  })

  it('reset 重置到初始状态', async () => {
    const fn = vi.fn().mockResolvedValue('data')
    const { getResult } = mountWithRequest(fn, { initialData: 'init' })
    await getResult().run()
    expect(getResult().data.value).toBe('data')
    getResult().reset()
    expect(getResult().data.value).toBe('init')
    expect(getResult().error.value).toBeNull()
  })
})
