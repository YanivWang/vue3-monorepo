import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp, defineComponent, h, nextTick } from 'vue'
import type { Component } from 'vue'
import ErrorBoundary from './index.vue'

/** 单测不引入 Element Plus 全量，桩掉以消除 Unknown component 告警，并保留 title/插槽可断言 */
const ElResultStub: Component = {
  name: 'ElResultStub',
  props: { title: String, subTitle: String, icon: String },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'el-result-stub' }, [
        h('span', { class: 'el-result__title' }, props.title),
        h('span', { class: 'el-result__subtitle' }, props.subTitle),
        slots.extra?.()
      ])
  }
}

const ElButtonStub: Component = {
  name: 'ElButtonStub',
  setup(_, { slots }) {
    return () => h('button', { type: 'button', class: 'el-button-stub' }, slots.default?.())
  }
}

const errorBoundaryGlobal = {
  stubs: {
    ElResult: ElResultStub,
    ElButton: ElButtonStub
  }
}

// 在 render 中抛错，经 onErrorCaptured 更新状态后需 await nextTick() 再查 DOM
const ThrowingComponent = defineComponent({
  render() {
    throw new Error('测试错误')
  }
})

// 正常子组件
const NormalComponent = defineComponent({
  template: '<div class="normal">正常内容</div>'
})

describe('ErrorBoundary', () => {
  it('仅挂载抛错子组件时 errorHandler 应被调用', () => {
    const el = document.createElement('div')
    const errs: unknown[] = []
    const app = createApp(ThrowingComponent)
    app.config.errorHandler = e => {
      errs.push(e)
    }
    app.mount(el)
    expect(errs.length).toBeGreaterThan(0)
    app.unmount()
  })

  it('正常时渲染 slot 内容', () => {
    const wrapper = mount(ErrorBoundary, {
      global: errorBoundaryGlobal,
      slots: { default: NormalComponent }
    })
    expect(wrapper.find('.normal').exists()).toBe(true)
  })

  it('子组件抛错时显示降级 UI', async () => {
    // 抑制 console.error（Vue 内部会打印）
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(ErrorBoundary, {
      global: errorBoundaryGlobal,
      slots: { default: ThrowingComponent }
    })
    await nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    consoleSpy.mockRestore()
  })

  it('自定义 title prop', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = mount(ErrorBoundary, {
      global: errorBoundaryGlobal,
      props: { title: '加载失败' },
      slots: { default: ThrowingComponent }
    })
    await nextTick()

    expect(wrapper.text()).toContain('加载失败')
    consoleSpy.mockRestore()
  })
})
