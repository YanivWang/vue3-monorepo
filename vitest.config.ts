import { defineConfig } from 'vitest/config'

/**
 * 根级 Vitest 配置：**只放全仓共享的选项**（当前是覆盖率）。
 * 各项目自身的 environment / include 在 `vitest.workspace.ts` 列出的
 * 每个包的 `vitest.config.ts` 里，互不覆盖。
 *
 * 覆盖率阈值的定位是**防退化，不是追指标**：数值取自接入当天的实际水位并向下
 * 取整，任何 PR 把它拖低就红。想提高就跑 `pnpm run test:coverage` 看实际值，
 * 再把下面的数字往上抬——只上不下。
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // 只统计真正参与运行时的源码：构建脚本、mock、类型声明、入口 barrel 不计入
      include: ['apps/*/*/src/**/*.{ts,vue}', 'packages/*/src/**/*.{ts,vue}'],
      exclude: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts', '**/types/**', '**/mock/**', '**/index.ts'],
      // 2026-08-29 接入当天实测：stmts 12.52 / branch 53.70 / funcs 23.47 / lines 12.52
      // 这个水位很低，阈值的作用是「不许再掉」，不代表覆盖率已经合格。
      thresholds: {
        lines: 12,
        statements: 12,
        functions: 23,
        branches: 53,
      },
    },
  },
})
