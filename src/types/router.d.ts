import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
    /** 为 false 时与未登录可访问，默认需登录 */
    requiresAuth?: boolean
    /**
     * 访问所需权限码；非空时用户须至少具备其中一项
     *（与 v-permission 的「或」规则一致，可按业务改为「且」）
     */
    permissions?: string[]
  }
}

export {}
