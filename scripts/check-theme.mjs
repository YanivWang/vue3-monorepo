#!/usr/bin/env node
/**
 * check-theme：校验主题生成产物与 theme-palette.json 是否同步。
 *
 * 做法：先把 AUTO-GENERATED 文件读进内存，重跑 `scripts/generate-theme.mjs`，
 * 再逐个比对生成前后的内容。有差异即说明产物被手改过、或改了 palette 忘了重新生成。
 *
 * 为什么不用 `git status`（本脚本此前的做法）：那是在跟 HEAD 比，任何**尚未提交**
 * 的合法改动都会被误报成「产物不同步」。2026-08-29 调整 prettier 配置后全仓重排，
 * 产物内容其实与生成器输出完全一致，却因为还没提交而让门禁红了一次。
 * 「生成前 vs 生成后」才是这个检查真正要问的问题，且不依赖 git 状态、
 * 在 CI 的浅克隆或非 git 环境下同样成立。
 *
 * 由根 `verify:full` 调用（`pnpm run check:theme`）。
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const generatedPaths = [
  'packages/shared/src/styles/tokens/_variables.scss',
  'packages/shared/src/styles/tokens/_brands.scss',
  'packages/shared/src/styles/tokens/_dark.scss',
  'packages/shared/src/styles/tokens/_dark-element.scss',
  'packages/shared/src/styles/brands.config.ts',
]

const read = (p) => readFileSync(join(root, p), 'utf8')
const before = new Map(generatedPaths.map((p) => [p, read(p)]))

execSync('node scripts/generate-theme.mjs', { cwd: root, stdio: 'inherit' })

const drifted = generatedPaths.filter((p) => read(p) !== before.get(p))

if (drifted.length > 0) {
  console.error(
    [
      'Theme generated files are out of sync with theme-palette.json.',
      'Run `pnpm generate:theme` and commit the updated files.',
      '',
      ...drifted.map((p) => `  M ${p}`),
    ].join('\n'),
  )
  process.exit(1)
}

console.log('Theme generated files are in sync with theme-palette.json')
