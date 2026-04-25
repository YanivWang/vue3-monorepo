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
 * - tabs 列表由业务层在 App 启动时调用 setTabs 注册
 * - activeName 由当前路由同步（在 App.vue 或 layout 中 watch route）
 */
export const useTabsStore = defineStore('h5-tabs', () => {
  const tabs = ref<TabItem[]>([
    { name: 'Home', path: '/home', label: '首页', icon: 'home-o', requiresAuth: true },
    { name: 'List', path: '/list', label: '长列表', icon: 'list-switching-o', requiresAuth: true },
    { name: 'Theme', path: '/theme', label: '主题', icon: 'brush-o' },
    { name: 'Mine', path: '/mine', label: '我的', icon: 'user-o', requiresAuth: true }
  ])
  const activeName = ref<string>('Home')

  const active = computed(() => tabs.value.find(t => t.name === activeName.value) ?? tabs.value[0])

  function setTabs(items: TabItem[]): void {
    tabs.value = items
  }

  function setActive(name: string): void {
    activeName.value = name
  }

  return { tabs, activeName, active, setTabs, setActive }
})
