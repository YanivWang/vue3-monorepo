/**
 * Re-export：实现位于 `@vue3-monorepo/shared/web-monitor`，便于保留 `@/plugins/*` 引用路径。
 */
export {
  reportClientError,
  setupClientErrorReporting,
  setAdditionalClientErrorListener
} from '@vue3-monorepo/shared/web-monitor/client-error'
export type {
  ClientErrorKind,
  ClientErrorPayload,
  SetupClientErrorReportingOptions
} from '@vue3-monorepo/shared/web-monitor/client-error'
