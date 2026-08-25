#!/usr/bin/env node
/**
 * check-theme：校验主题生成产物与 theme-palette.json 是否同步。
 *
 * 做法：重新执行 `scripts/generate-theme.mjs`，再用 `git status --porcelain` 检查
 * 下列 AUTO-GENERATED 文件是否产生 diff；有 diff 即说明有人手改了产物或忘了重新生成。
 * 由根 `verify:full` 调用（`pnpm run check:theme`）。
 */
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const generatedPaths = [
  'packages/shared/src/styles/tokens/_variables.scss',
  'packages/shared/src/styles/tokens/_brands.scss',
  'packages/shared/src/styles/tokens/_dark.scss',
  'packages/shared/src/styles/tokens/_dark-element.scss',
  'packages/shared/src/styles/brands.config.ts'
]

execSync('node scripts/generate-theme.mjs', { cwd: root, stdio: 'inherit' })

const status = execSync(`git status --porcelain -- ${generatedPaths.join(' ')}`, {
  cwd: root,
  encoding: 'utf8'
})

if (status.trim()) {
  console.error(
    [
      'Theme generated files are out of sync with theme-palette.json.',
      'Run `pnpm generate:theme` and commit the updated files.',
      '',
      status.trim()
    ].join('\n')
  )
  process.exit(1)
}

console.log('Theme generated files are in sync with theme-palette.json')
