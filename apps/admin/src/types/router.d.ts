import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 页面图标（Element Plus 图标名称） */
    icon?: string
    /** 是否在菜单中隐藏，默认 false */
    hidden?: boolean
    /** 是否开启页面缓存 keep-alive，默认 false */
    keepAlive?: boolean
    /** 为 false 时无需登录可访问，默认 true */
    requiresAuth?: boolean
    /** 访问所需权限码，非空时用户须至少具备其中一项 */
    permissions?: string[]
    /** 访问所需角色，非空时用户须至少具备其中一项 */
    roles?: string[]
    /** 面包屑中显示的名称，默认取 title */
    breadcrumb?: string
    /** 是否固定在 Tab 栏（不可关闭），默认 false */
    affix?: boolean
    /** 仅有一个子路由时是否始终显示父级，默认 false */
    alwaysShow?: boolean
  }
}

export {}
