import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface TabItem {
  /** 路由名称 */
  name: string
  /** 完整路径（含 query/hash，用作唯一 key） */
  path: string
  /** 显示标题 */
  title: string
  /** 图标 */
  icon?: string
  /** 是否固定（不允许关闭） */
  affix?: boolean
  /** 是否开启 keep-alive */
  keepAlive?: boolean
}

/**
 * Tab 标签页 Store
 */
export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([])
  const activeTab = ref<string>('')

  /** 添加 tab（已存在则仅激活） */
  function addTab(route: RouteLocationNormalizedLoaded): void {
    if (!route.meta?.title || route.meta?.hidden) return

    const tab: TabItem = {
      name: route.name as string,
      path: route.fullPath,
      title: route.meta.title as string,
      icon: route.meta.icon as string | undefined,
      affix: route.meta.affix,
      keepAlive: route.meta.keepAlive
    }

    if (!tabs.value.some(t => t.path === tab.path)) {
      tabs.value.push(tab)
    }
    activeTab.value = tab.path
  }

  /** 关闭指定 tab（affix 不可关闭） */
  function removeTab(path: string): string {
    const index = tabs.value.findIndex(t => t.path === path)
    if (index < 0 || tabs.value[index].affix) return activeTab.value

    tabs.value.splice(index, 1)

    // 如果关闭的是当前激活 tab，激活相邻 tab
    if (activeTab.value === path && tabs.value.length > 0) {
      const next = tabs.value[Math.min(index, tabs.value.length - 1)]
      activeTab.value = next.path
      return next.path
    }

    return activeTab.value
  }

  /** 关闭其他 tab（保留 affix） */
  function removeOtherTabs(path: string): void {
    tabs.value = tabs.value.filter(t => t.path === path || t.affix)
    activeTab.value = path
  }

  /** 关闭所有 tab（保留 affix） */
  function removeAllTabs(): string {
    tabs.value = tabs.value.filter(t => t.affix)
    const first = tabs.value[0]
    if (first) {
      activeTab.value = first.path
      return first.path
    }
    activeTab.value = '/'
    return '/'
  }

  function setActiveTab(path: string): void {
    activeTab.value = path
  }

  /** 登出时清空 */
  function resetTabs(): void {
    tabs.value = []
    activeTab.value = ''
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    removeOtherTabs,
    removeAllTabs,
    setActiveTab,
    resetTabs
  }
})
