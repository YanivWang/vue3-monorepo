import { describe, it, expect, beforeEach } from 'vitest'
import { h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { __resetHistoryStack } from '@vue3-monorepo/shared/hooks-core'
import { useHistoryStackH5, __resetHistoryStackH5ForTests } from './useHistoryStackH5'

const Blank = { render: () => h('div') }

const routes = [
  { path: '/', name: 'Home', component: Blank },
  { path: '/list', name: 'List', component: Blank },
  { path: '/theme', name: 'Theme', component: Blank },
]

beforeEach(() => {
  __resetHistoryStack()
  __resetHistoryStackH5ForTests()
})

async function setupStackOnlyRouter() {
  const router = createRouter({
    history: createWebHistory('/'),
    routes,
  })
  const stack = useHistoryStackH5({ autoBind: false })
  stack.bind(router)
  await router.push({ name: 'Home' })
  return { router, stack }
}

describe('useHistoryStackH5', () => {
  it('首屏 from 无 name 时入栈目标路由', async () => {
    __resetHistoryStack()
    __resetHistoryStackH5ForTests()
    const router = createRouter({
      history: createWebHistory('/'),
      routes,
    })
    const stack = useHistoryStackH5({ autoBind: false })
    stack.bind(router)
    await router.push({ name: 'Home' })
    expect(stack.stack.value.map((s) => s.name)).toEqual(['Home'])
  })

  it('history push → 栈 push（新页面叠在栈顶）', async () => {
    const { router, stack } = await setupStackOnlyRouter()
    await router.push({ name: 'List' })
    expect(stack.stack.value.map((s) => s.name)).toEqual(['Home', 'List'])
  })

  it('history replace → 栈 replace（替换栈顶）', async () => {
    const { router, stack } = await setupStackOnlyRouter()
    await router.push({ name: 'List' })
    await router.replace({ name: 'Theme' })
    expect(stack.stack.value.map((s) => s.name)).toEqual(['Home', 'Theme'])
  })

  it('popstate（后退）→ 栈 pop 到目标 name', async () => {
    const { router, stack } = await setupStackOnlyRouter()
    await router.push({ name: 'List' })
    expect(stack.stack.value.map((s) => s.name)).toEqual(['Home', 'List'])
    router.back()
    await router.isReady()
    await new Promise((r) => setTimeout(r, 0))
    expect(router.currentRoute.value.name).toBe('Home')
    expect(stack.stack.value.map((s) => s.name)).toEqual(['Home'])
  })

  it('detectNavigationAction 可覆盖 Hint', async () => {
    const router = createRouter({
      history: createWebHistory('/'),
      routes,
    })
    const stack = useHistoryStackH5({
      autoBind: false,
      detectNavigationAction: (_to, _from, hint) => (hint === 'push' ? 'replace' : hint),
    })
    stack.bind(router)
    await router.push({ name: 'Home' })
    await router.push({ name: 'List' })
    expect(stack.stack.value.map((s) => s.name)).toEqual(['List'])
  })
})
