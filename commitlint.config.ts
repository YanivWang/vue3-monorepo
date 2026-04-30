import type { UserConfig } from '@commitlint/types'

/**
 * Conventional Commits + monorepo scope
 *
 * scope 表示提交影响面，不都对应独立 pnpm 包。Workspace 含 `apps/pc/*`、`apps/h5/*`、`docs`、
 * `packages/shared`、`packages/request-core`、`packages/web-monitor`、`packages/js-bridge`；
 * `shared` 子路径导出（如 utils、components-pc）见 `packages/shared/package.json` 的 `exports`。
 *
 * 合法 scope（见下方 `scope-enum`，节选说明）：
 *   - 应用级：admin / h5 / docs
 *   - 共享包域：shared / utils / locale / hooks / request（约定）及 js-bridge（亦对应 `@vue3-monorepo/js-bridge` 变更）
 *   - PC 子域：components-pc / hooks-pc / directives-pc / request-pc
 *   - H5 子域：components-h5 / hooks-h5 / directives-h5 / request-h5
 *   - 工程化：repo / deps / docker
 *   - 另：`packages/request-core`、`packages/web-monitor` 等大改可用 `repo` 或 `request`/`deps` 等与团队约定对齐
 *
 * 示例：
 *   feat(h5): 接入 vconsole
 *   fix(request): 修复并发刷新 token 竞态
 *   chore(deps): 升级 vite 到 ^5.4
 *   chore(repo): 根 tsconfig paths 映射调整
 */
const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // Bug 修复
        'perf', // 性能优化
        'refactor', // 代码重构（既不是新功能也不是 Bug 修复）
        'style', // 代码格式（不影响功能）
        'test', // 测试相关
        'docs', // 文档更新
        'build', // 构建系统或依赖变更
        'ci', // CI/CD 配置变更
        'chore', // 其他（不修改 src 或 test 的杂项）
        'revert', // 回滚提交
        'wip' // 开发中（临时提交，不建议进入主干）
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'admin',
        'h5',
        'docs',
        'shared',
        'utils',
        'js-bridge',
        'request',
        'locale',
        'hooks',
        'components-pc',
        'hooks-pc',
        'directives-pc',
        'request-pc',
        'components-h5',
        'hooks-h5',
        'directives-h5',
        'request-h5',
        'repo',
        'deps',
        'docker'
      ]
    ],
    'scope-case': [0],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100]
  }
}

export default config
