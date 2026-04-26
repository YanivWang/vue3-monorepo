import type { UserConfig } from '@commitlint/types'

/**
 * Conventional Commits + monorepo scope
 *
 * scope 表示提交影响面，不都对应独立 pnpm 包。本仓 workspace 仅
 * `apps/pc/*`、`apps/h5/*`、`docs`、`packages/shared`（@vue3-mono/shared 单包），
 * 与 shared 子路径导出（如 utils、request-core、components-pc 等）对应关系见
 * `packages/shared/package.json` 的 `exports`。
 *
 * 合法 scope（20 个）：
 *   - 应用级（3）：admin（PC 管理端 app）/ h5 / docs
 *   - 共享单包内 6 类：shared / utils / bridge / request / locale / hooks
 *   - PC 子域 4 项：components-pc / hooks-pc / directives-pc / request-pc
 *   - H5 子域 4 项：components-h5 / hooks-h5 / directives-h5 / request-h5
 *   - 工程化（3）：repo / deps / docker
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
        'bridge',
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
