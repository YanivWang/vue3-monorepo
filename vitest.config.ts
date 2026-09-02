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
      // 2026-09-02 补完 hooks-pc/useECharts 回归用例后实测：
      //   stmts 13.62 / branch 11.23 / funcs 11.43 / lines 14.22
      //   （上一档是 2026-08-30 升级到 vitest 4 时的 12.34 / 10.15 / 10.58 / 12.94）
      //
      // ⚠️ 这组数比 vitest 3 时代（18.89 / 79.26 / 52.73 / 18.89）低很多，但**测试一条没少**
      // （当时 105 个用例全绿）。变的是量法：vitest 3 的 v8 provider 对「从未被加载过的文件」
      // 只能报 0% 行 + 100% 分支/函数——那 79% 的分支覆盖率是虚的。vitest 4 换成
      // ast-v8-to-istanbul，未加载文件的分支与函数被如实计为 0，数字才第一次可信。
      //
      // 所以这不是放宽阈值，是换了尺子后重新取水位。仍然是棘轮：只上不下，
      // 补了测试就跑 pnpm run test:coverage 看新水位再往上抬。
      thresholds: {
        lines: 14,
        statements: 13,
        functions: 11,
        branches: 11,
      },
    },
  },
})
