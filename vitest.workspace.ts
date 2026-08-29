/**
 * Vitest Workspace 定义（projects 模式）
 *
 * 参考：https://vitest.dev/guide/workspace.html
 *
 * ⚠️ 这份清单是显式的：**不在列表里的包，写了测试也不会被 `pnpm test` 发现**，
 * 且不会有任何报错。scripts/check-workspace-scripts.mjs 会校验
 * 「每个含测试文件的 workspace 包都出现在这里」，新增包时不会再漏。
 */
export default [
  './apps/pc/pc-admin-template',
  './apps/h5/h5-template',
  './packages/shared',
  './packages/js-bridge',
  './packages/request-core',
  './packages/web-monitor',
]
