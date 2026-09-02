/**
 * useECharts 的回归用例。
 *
 * 这个 hook 的实例会在三处被拆掉重建（容器出现/重新挂载、暗黑模式切换、手动 dispose），
 * 而「option 没跟着搬过去」的表现是**图表空白，不报错**——跟本仓库最忌讳的那类门禁洞
 * 是同一种失败方式。下面每条用例都对应一次真实踩过的写法：
 *
 *  - 在 `onMounted` 里直接 setOption（不 await nextTick）：曾经会被容器 watch 的
 *    dispose() 连实例一起扔掉，重建出来是空的；
 *  - 容器挂在 v-if 后面、setOption 先于元素出现：曾经被静默丢弃，元素出现后也不重放。
 *
 * echarts 用 vi.mock 换掉：这里要验的是「option 有没有被搬到新实例上」，
 * 不是 ECharts 自己的渲染。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, useTemplateRef, type Component } from 'vue'
import type { EChartsOption } from 'echarts'

/** 每次 echarts.init() 造出来的假实例，按创建顺序记下来，便于断言「第几个实例拿到了什么」 */
interface FakeChart {
  option: EChartsOption | null
  disposed: boolean
  setOption: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
  resize: ReturnType<typeof vi.fn>
  getOption: () => EChartsOption
}

const charts: FakeChart[] = []
/** 记录每次 init 传入的 theme，用于验证暗黑模式确实换了主题 */
const initThemes: (string | undefined)[] = []

vi.mock('echarts/core', () => ({
  init: (_el: HTMLElement, theme?: string) => {
    initThemes.push(theme)
    const chart: FakeChart = {
      option: null,
      disposed: false,
      setOption: vi.fn((option: EChartsOption, opts?: { notMerge?: boolean }) => {
        chart.option = opts?.notMerge ? option : { ...chart.option, ...option }
      }),
      dispose: vi.fn(() => {
        chart.disposed = true
      }),
      resize: vi.fn(),
      // 真实的 getOption() 返回合并后的完整状态；这里返回已存下的 option 即可
      getOption: () => chart.option ?? {},
    }
    charts.push(chart)
    return chart
  },
}))

const { useECharts } = await import('./useECharts')

/** 当前活着的（未被 dispose 的）最后一个实例 */
function liveChart(): FakeChart | undefined {
  return [...charts].reverse().find((c) => !c.disposed)
}

function mount(component: Component) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(component)
  app.mount(host)
  return app
}

beforeEach(() => {
  charts.length = 0
  initThemes.length = 0
})

describe('useECharts', () => {
  it('在 onMounted 里直接 setOption（不 await nextTick）也不会丢内容', async () => {
    const option: EChartsOption = { title: { text: '访问趋势' } }
    mount(
      defineComponent({
        setup() {
          const el = useTemplateRef<HTMLElement>('c')
          const { setOption } = useECharts(el)
          // 容器 watch 是 flush:'post'，会晚于这里执行并重建实例；
          // option 必须跟着搬到新实例上
          setOption(option)
          return () => h('div', { ref: 'c' })
        },
      }),
    )
    await nextTick()

    const live = liveChart()
    expect(live).toBeDefined()
    expect(live?.option).toMatchObject({ title: { text: '访问趋势' } })
  })

  it('容器晚于 setOption 出现（v-if）时，元素就位后会把 option 重放上去', async () => {
    const show = ref(false)
    let setOption!: (o: EChartsOption) => void

    mount(
      defineComponent({
        setup() {
          const el = useTemplateRef<HTMLElement>('c')
          const api = useECharts(el)
          setOption = api.setOption
          return () => (show.value ? h('div', { ref: 'c' }) : h('span'))
        },
      }),
    )
    await nextTick()

    // 容器还没出现：此时没有实例可写
    setOption({ title: { text: '延迟渲染' } })
    expect(charts).toHaveLength(0)

    show.value = true
    await nextTick()
    await nextTick()

    expect(liveChart()?.option).toMatchObject({ title: { text: '延迟渲染' } })
  })

  it('切换暗黑模式会用新主题重建实例，并保留已有 option', async () => {
    const isDark = ref(false)
    let setOption!: (o: EChartsOption) => void

    mount(
      defineComponent({
        setup() {
          const el = useTemplateRef<HTMLElement>('c')
          const api = useECharts(el, { isDark })
          setOption = api.setOption
          return () => h('div', { ref: 'c' })
        },
      }),
    )
    await nextTick()
    setOption({ title: { text: '保留我' } })

    isDark.value = true
    await nextTick()
    await nextTick()

    expect(initThemes.at(-1)).toBe('dark')
    expect(liveChart()?.option).toMatchObject({ title: { text: '保留我' } })
  })

  it('容器被卸载再挂回来时，图表内容会恢复', async () => {
    const show = ref(true)
    let setOption!: (o: EChartsOption) => void

    mount(
      defineComponent({
        setup() {
          const el = useTemplateRef<HTMLElement>('c')
          const api = useECharts(el)
          setOption = api.setOption
          return () => (show.value ? h('div', { ref: 'c' }) : h('span'))
        },
      }),
    )
    await nextTick()
    setOption({ title: { text: '来回切' } })

    show.value = false
    await nextTick()
    await nextTick()

    show.value = true
    await nextTick()
    await nextTick()

    expect(liveChart()?.option).toMatchObject({ title: { text: '来回切' } })
  })

  it('notMerge 的语义在容器就位前也成立：后一次整份覆盖前一次', async () => {
    const show = ref(false)
    let setOption!: (o: EChartsOption, notMerge?: boolean) => void

    mount(
      defineComponent({
        setup() {
          const el = useTemplateRef<HTMLElement>('c')
          const api = useECharts(el)
          setOption = api.setOption
          return () => (show.value ? h('div', { ref: 'c' }) : h('span'))
        },
      }),
    )
    await nextTick()

    setOption({ title: { text: '旧' }, backgroundColor: '#fff' })
    setOption({ title: { text: '新' } }, true)

    show.value = true
    await nextTick()
    await nextTick()

    expect(liveChart()?.option).toEqual({ title: { text: '新' } })
  })

  it('组件卸载时销毁实例', async () => {
    const app = mount(
      defineComponent({
        setup() {
          const el = useTemplateRef<HTMLElement>('c')
          useECharts(el)
          return () => h('div', { ref: 'c' })
        },
      }),
    )
    await nextTick()
    expect(charts).toHaveLength(1)

    app.unmount()
    expect(charts[0]?.disposed).toBe(true)
  })
})
