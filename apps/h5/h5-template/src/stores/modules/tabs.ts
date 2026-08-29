import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface TabItem {
  /** 路由 name */
  name: string
  /** 路由路径 */
  path: string
  /** 显示文案（i18n key 或静态文案） */
  label: string
  /** 图标（vant 图标 name 或 SvgIcon name） */
  icon?: string
  /** 是否需要登录态 */
  requiresAuth?: boolean
}

/**
 * 底部 TabBar 状态 store（独立于 admin 的 tabsViews）。
 *
 * - tabs 默认内置模板的 4 个入口，业务层可调用 setTabs 整体覆盖
 * - activeName 由 `layouts/TabLayout.vue` watch 当前路由 name 后调用 setActive 同步
 */
export const useTabsStore = defineStore('h5-tabs', () => {
  /** `label` 为 vue-i18n 文案 key（如 nav.home），由布局层 `t(label)` 渲染 */
  const tabs = ref<TabItem[]>([
    { name: 'Home', path: '/home', label: 'nav.home', icon: 'home-o', requiresAuth: true },
    { name: 'List', path: '/list', label: 'nav.list', icon: 'todo-list-o', requiresAuth: true },
    { name: 'Theme', path: '/theme', label: 'nav.theme', icon: 'brush-o' },
    { name: 'Mine', path: '/mine', label: 'nav.mine', icon: 'user-o', requiresAuth: true },
  ])
  const activeName = ref<string>('Home')

  const active = computed(() => tabs.value.find((t) => t.name === activeName.value) ?? tabs.value[0])

  function setTabs(items: TabItem[]): void {
    tabs.value = items
  }

  function setActive(name: string): void {
    activeName.value = name
  }

  return { tabs, activeName, active, setTabs, setActive }
})
