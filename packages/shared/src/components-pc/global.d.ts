import type ErrorBoundary from './ErrorBoundary/index.vue'
import type PageContainer from './PageContainer/index.vue'
import type ProTable from './ProTable/index.vue'
import type Skeleton from './Skeleton/index.vue'
import type SvgIcon from './SvgIcon/index.vue'

/**
 * @vue3-mono/shared/components-pc 通过 installComponents(app) 注册到 Vue 全局。
 * 此文件扩展 vue 的 GlobalComponents，使 admin 模板中直接使用 <ProTable /> 等标签时
 * 能获得 IDE 类型提示 + vue-tsc strictTemplates 兼容。
 */
declare module 'vue' {
  export interface GlobalComponents {
    ErrorBoundary: typeof ErrorBoundary
    PageContainer: typeof PageContainer
    ProTable: typeof ProTable
    Skeleton: typeof Skeleton
    SvgIcon: typeof SvgIcon
  }
}

export {}
