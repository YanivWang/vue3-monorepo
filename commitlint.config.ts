import type { UserConfig } from '@commitlint/types'

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
    'scope-case': [0],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100]
  }
}

export default config
