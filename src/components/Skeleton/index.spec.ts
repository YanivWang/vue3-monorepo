import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from './index.vue'

describe('Skeleton', () => {
  it('loading=true 时显示骨架屏', () => {
    const wrapper = mount(Skeleton, { props: { loading: true } })
    expect(wrapper.find('.skeleton').exists()).toBe(true)
  })

  it('loading=false 时显示 slot 内容', () => {
    const wrapper = mount(Skeleton, {
      props: { loading: false },
      slots: { default: '<p class="content">真实内容</p>' }
    })
    expect(wrapper.find('.content').exists()).toBe(true)
    expect(wrapper.find('.skeleton').exists()).toBe(false)
  })

  it('variant=avatar 渲染头像骨架', () => {
    const wrapper = mount(Skeleton, { props: { loading: true, variant: 'avatar' } })
    expect(wrapper.find('.skeleton__avatar').exists()).toBe(true)
  })

  it('variant=card 渲染卡片骨架', () => {
    const wrapper = mount(Skeleton, { props: { loading: true, variant: 'card' } })
    expect(wrapper.find('.skeleton__card').exists()).toBe(true)
  })

  it('rows 控制文字行数', () => {
    const wrapper = mount(Skeleton, { props: { loading: true, rows: 5 } })
    expect(wrapper.findAll('.skeleton__block').length).toBe(5)
  })

  it('animated=false 时无动画 class', () => {
    const wrapper = mount(Skeleton, { props: { loading: true, animated: false } })
    expect(wrapper.find('.skeleton--animated').exists()).toBe(false)
  })
})
