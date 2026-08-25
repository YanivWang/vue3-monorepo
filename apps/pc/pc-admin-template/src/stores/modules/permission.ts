import { defineStore } from 'pinia'
import { ref, shallowRef, h } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuRoute } from '@vue3-monorepo/shared/types'
import { getMenuRoutes } from '@/api/modules/menu'

/**
 * 动态加载 views 目录下所有页面组件
 * key 格式：../../views/xxx/index.vue
 */
const viewModules = import.meta.glob('../../views/**/*.vue')

/** 找不到组件时的降级占位页（使用 h() 避免运行时编译器依赖） */
const PlaceholderView = () =>
  Promise.resolve({
    name: 'PlaceholderView',
    setup() {
      return () =>
        h(
          'div',
          {
            style:
              'display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:12px;color:#909399'
          },
          [
            h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: 48,
              height: 48,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '1.5',
              innerHTML: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>'
            }),
            h('p', { style: 'font-size:14px;margin:0' }, '页面正在开发中...')
          ]
        )
    }
  })

function resolveComponent(component: string): () => Promise<unknown> {
  const key = `../../views/${component}.vue`
  return (viewModules[key] as () => Promise<unknown>) ?? PlaceholderView
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
   * 拉取菜单并生成动态路由对象（只做数据生成，不注册）
   * 注意：实际 `router.addRoute` 在 guards.ts 的 beforeEach 中完成
   */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const menuData = await getMenuRoutes()
    menus.value = menuData
    const routes = menuToRoutes(menuData)
    dynamicRoutes.value = routes
    isRoutesLoaded.value = true
    return routes
  }

  /** 登出时重置本 store；清理已注册路由由调用方负责（user store 的 resetState 调 `resetRouter()` 换 matcher） */
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
