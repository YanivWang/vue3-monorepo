import { defineConfig } from 'vitest/config'

/**
 * 根级 Vitest 配置：项目清单 + 全仓共享的覆盖率设置。
 *
 * `projects` 取代了旧的 `vitest.workspace.ts`（vitest 3 起弃用，下个大版本移除）。
 * 各项目自身的 environment / include 仍在各包的 `vitest.config.ts` 里，互不覆盖。
 *
 * ⚠️ 这份清单是显式的：**不在列表里的包，写了测试也不会被 `pnpm test` 发现**，
 * 且不会有任何报错。scripts/check-workspace-scripts.mjs 会校验
 * 「每个含测试文件的 workspace 包都出现在这里」，新增包时不会再漏。
 *
 * 覆盖率阈值的定位是**防退化，不是追指标**：数值取自接入当天的实际水位并向下
 * 取整，任何 PR 把它拖低就红。想提高就跑 `pnpm run test:coverage` 看实际值，
 * 再把下面的数字往上抬——只上不下。
 */
export default defineConfig({
  test: {
    projects: [
      './apps/pc/pc-admin-template',
      './apps/h5/h5-template',
      './packages/shared',
      './packages/js-bridge',
      './packages/request-core',
      './packages/web-monitor',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // 只统计真正参与运行时的源码：构建脚本、mock、类型声明、入口 barrel 不计入
      include: ['apps/*/*/src/**/*.{ts,vue}', 'packages/*/src/**/*.{ts,vue}'],
      exclude: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts', '**/types/**', '**/mock/**', '**/index.ts'],
      // 2026-08-29 补完 shared/utils 单测后实测（vitest 3 口径）：
      //   stmts 18.89 / branch 79.26 / funcs 52.73 / lines 18.89
      // 向下取整作为阈值，只上不下。行覆盖率仍被大量未测的 .vue 视图拖着，
      // 但函数与分支覆盖已经有实际约束力。补了测试就跑 pnpm run test:coverage
      // 看新水位，再把下面的数字往上抬。
      thresholds: {
        lines: 18,
        statements: 18,
        functions: 52,
        branches: 79,
      },
    },
  },
})
