import type { App } from 'vue'
import ErrorBoundary from './ErrorBoundary/index.vue'
import PageContainer from './PageContainer/index.vue'
import ProTable from './ProTable/index.vue'
import Skeleton from './Skeleton/index.vue'
import SvgIcon from './SvgIcon/index.vue'

export { ErrorBoundary, PageContainer, ProTable, Skeleton, SvgIcon }
export type { TableColumn } from './ProTable/index.vue'

export const components = [ErrorBoundary, PageContainer, ProTable, Skeleton, SvgIcon] as const

/**
 * 全量注册所有 PC 共享组件到 Vue app
 *
 * @example
 * import { installComponents } from '@vue3-mono/components-pc'
 * installComponents(app)
 */
export function installComponents(app: App): void {
  app.component('ErrorBoundary', ErrorBoundary)
  app.component('PageContainer', PageContainer)
  app.component('ProTable', ProTable)
  app.component('Skeleton', Skeleton)
  app.component('SvgIcon', SvgIcon)
}

export default { install: installComponents }
