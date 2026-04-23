import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuRoute } from '@/types/api'
import { getMenuRoutes } from '@/api/modules/menu'

/**
 * 动态加载 views 目录下所有页面组件
 * key 格式：../../views/xxx/index.vue
 */
const viewModules = import.meta.glob('../../views/**/*.vue')

function resolveComponent(component: string): (() => Promise<unknown>) | undefined {
  const key = `../../views/${component}.vue`
  return viewModules[key] as (() => Promise<unknown>) | undefined
}

function menuToRoutes(menus: MenuRoute[]): RouteRecordRaw[] {
  return menus.map(menu => {
    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.name,
      meta: { ...menu.meta },
      children: menu.children ? menuToRoutes(menu.children) : []
    }

    if (menu.component) {
      const comp = resolveComponent(menu.component)
      if (comp) route.component = comp
    }

    if (menu.redirect) {
      route.redirect = menu.redirect
    }

    return route
  })
}

/**
 * 权限 Store：负责从后端获取菜单树，动态注册路由
 */
export const usePermissionStore = defineStore('permission', () => {
  /** 后端返回的原始菜单树（用于渲染侧栏） */
  const menus = ref<MenuRoute[]>([])
  /** 已注册的动态路由记录（用于 logout 时清理） */
  const dynamicRoutes = shallowRef<RouteRecordRaw[]>([])
  /** 是否已完成动态路由加载 */
  const isRoutesLoaded = ref(false)

  /**
   * 拉取菜单、生成并注册动态路由
   * 注意：路由实际 addRoute 操作在 guards.ts 中完成，此处只做数据生成
   */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const menuData = await getMenuRoutes()
    menus.value = menuData
    const routes = menuToRoutes(menuData)
    dynamicRoutes.value = routes
    isRoutesLoaded.value = true
    return routes
  }

  /** 登出时重置，调用方（guards/user store）负责 router.removeRoute */
  function resetRoutes(): void {
    menus.value = []
    dynamicRoutes.value = []
    isRoutesLoaded.value = false
  }

  return {
    menus,
    dynamicRoutes,
    isRoutesLoaded,
    generateRoutes,
    resetRoutes
  }
})
