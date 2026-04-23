import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ErrorBoundary from './index.vue'

// 会抛出错误的子组件
const ThrowingComponent = defineComponent({
  setup() {
    throw new Error('测试错误')
  },
  render() {
    return h('div')
  }
})

// 正常子组件
const NormalComponent = defineComponent({
  template: '<div class="normal">正常内容</div>'
})

describe('ErrorBoundary', () => {
  it('正常时渲染 slot 内容', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: { default: NormalComponent }
    })
    expect(wrapper.find('.normal').exists()).toBe(true)
  })

  it('子组件抛错时显示降级 UI', () => {
    // 抑制 console.error（Vue 内部会打印）
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(ErrorBoundary, {
      slots: { default: ThrowingComponent }
    })

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    consoleSpy.mockRestore()
  })

  it('自定义 title prop', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(ErrorBoundary, {
      props: { title: '加载失败' },
      slots: { default: ThrowingComponent }
    })
    expect(wrapper.text()).toContain('加载失败')
    consoleSpy.mockRestore()
  })
})
