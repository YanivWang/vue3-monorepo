/**
 * Vitest Workspace 定义（projects 模式）
 *
 * - 每个目录路径会让 Vitest 搜索对应项目下的 vitest.config.{ts,js} 或默认规则
 *   命中的测试文件（__tests__/ + *.{spec,test}.ts）
 * - 未带 config 的 package 也能被识别，默认扫描 src/ 下的 spec/test 文件
 * - 根命令 `pnpm test` 统一由此驱动；各 package 不再定义 test 脚本
 *
 * 参考：https://vitest.dev/guide/workspace.html
 */
export default [
  // apps
  './apps/pc/pc-admin-template',
  './apps/h5/h5-template',

  // 4 基座
  './packages/shared',
  './packages/utils',
  './packages/bridge',
  './packages/locale',

  './packages/request/core',
  './packages/hooks/core',

  // PC UI 4 包
  './packages/components/pc',
  './packages/hooks/pc',
  './packages/directives/pc',
  './packages/request/pc',

  // H5 UI 4 包
  './packages/components/h5',
  './packages/hooks/h5',
  './packages/directives/h5',
  './packages/request/h5'
]
