import type { App, Component } from 'vue'
import PageContainer from './PageContainer/index.vue'
import ProList from './ProList/index.vue'
import SkeletonH5 from './SkeletonH5/index.vue'
import SvgIconH5 from './SvgIconH5/index.vue'
import SafeArea from './SafeArea/index.vue'
import NavBar from './NavBar/index.vue'
import ErrorBoundaryH5 from './ErrorBoundaryH5/index.vue'
import FilterDrawer from './FilterDrawer/index.vue'
import TabBarLayout from './TabBarLayout/index.vue'

export { PageContainer, ProList, SkeletonH5, SvgIconH5, SafeArea, NavBar, ErrorBoundaryH5, FilterDrawer, TabBarLayout }
export type { TabBarRouteItem } from './TabBarLayout/index.vue'
export type { ProListPageParams, ProListResult } from './ProList/index.vue'

// ProList 为泛型 <T> 组件，类型签名与 app.component 要求的 Component 不直接兼容，
// 这里仅在注册表中作一次断言
const ProListAsComponent = ProList as unknown as Component

export const components = [
  PageContainer,
  ProListAsComponent,
  SkeletonH5,
  SvgIconH5,
  SafeArea,
  NavBar,
  ErrorBoundaryH5,
  FilterDrawer,
  TabBarLayout
] as const

/**
 * 批量注册所有 H5 共享组件到 Vue app（以 `H5` 前缀 + 原名，避免和 Vant 裸名冲突）
 *
 * @example
 *   import { installComponents } from '@vue3-mono/components-h5'
 *   installComponents(app)
 *   // 可在模板内直接使用 <H5PageContainer /> <H5ProList /> ...
 */
export function installComponents(app: App): void {
  app.component('H5PageContainer', PageContainer)
  app.component('H5ProList', ProListAsComponent)
  app.component('H5Skeleton', SkeletonH5)
  app.component('H5SvgIcon', SvgIconH5)
  app.component('H5SafeArea', SafeArea)
  app.component('H5NavBar', NavBar)
  app.component('H5ErrorBoundary', ErrorBoundaryH5)
  app.component('H5FilterDrawer', FilterDrawer)
  app.component('H5TabBarLayout', TabBarLayout)
}

export default { install: installComponents }
