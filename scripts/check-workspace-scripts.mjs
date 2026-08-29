#!/usr/bin/env node
// @ts-check

/**
 * check-workspace-scripts: 堵住「门禁静默跳过」的两个洞
 *
 * ## 为什么需要它
 *
 * 1. 根 `typecheck` 是 `pnpm -r --parallel run --if-present typecheck`。`--if-present`
 *    的语义是「没有这个脚本就跳过」——**不报错**。新建的包忘了写 typecheck 脚本，
 *    门禁会安安静静地不检查它，输出里连一行提示都没有。
 * 2. `vitest.workspace.ts` 是一份**显式清单**。不在清单里的包，`pnpm test` 不会
 *    发现它的测试文件，同样没有任何报错——测试写了等于没写。
 *
 * 这两个洞的共性是「失败时表现为通过」，比直接报错危险得多。本脚本把它们变成
 * 显式失败：新增包时要么补上脚本/清单，要么在这里被拦住。
 *
 * ## 校验项（任一失败即 exit 1）
 *
 *  1) 每个 workspace 包都必须声明 `typecheck` 脚本
 *  2) 含 *.spec.ts / *.test.ts 的包必须声明 `test` 脚本
 *  3) 含测试文件的包必须出现在 vitest.workspace.ts 的清单里
 *  4) vitest.workspace.ts 里列出的路径必须真实存在且是 workspace 包
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const errors = []
const fail = msg => errors.push(msg)

// ---------- 枚举 workspace（与 check-refs.js 同一套解析）----------
const workspaceYaml = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8')
const entryLines = (workspaceYaml.split(/^packages:\s*$/m).slice(1)[0] ?? '')
  .split('\n')
  .map(l => l.trim())
  .filter(l => /^-\s+['"]/.test(l))
  .map(l => l.replace(/^-\s+(['"])([^'"\n]+)\1.*$/, '$2'))

/** @type {{ dir: string, path: string }[]} */
const workspaces = []
function addWorkspaceIfPkg(dir) {
  const full = join(ROOT, dir)
  if (!existsSync(full) || !statSync(full).isDirectory()) return
  if (!existsSync(join(full, 'package.json'))) return
  if (workspaces.some(w => w.dir === dir)) return
  workspaces.push({ dir, path: full })
}

for (const entry of entryLines) {
  if (entry.endsWith('/*')) {
    const parent = entry.slice(0, -2)
    const base = join(ROOT, parent)
    if (!existsSync(base)) continue
    for (const child of readdirSync(base)) addWorkspaceIfPkg(join(parent, child))
  } else {
    addWorkspaceIfPkg(entry)
  }
}

if (workspaces.length === 0) {
  console.error('✗ 没有枚举到任何 workspace —— pnpm-workspace.yaml 的解析可能坏了。')
  process.exit(1)
}

// ---------- 收集每个包的测试文件 ----------
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vitepress', 'coverage', '.git'])
function hasTestFile(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (hasTestFile(full)) return true
    } else if (/\.(spec|test)\.[cm]?[jt]sx?$/.test(name)) {
      return true
    }
  }
  return false
}

// ---------- vitest.workspace.ts 的清单 ----------
const vitestWorkspaceFile = join(ROOT, 'vitest.workspace.ts')
const vitestWorkspaceSrc = readFileSync(vitestWorkspaceFile, 'utf8')
const listed = [...vitestWorkspaceSrc.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(m => m[1])

if (listed.length === 0) {
  fail('vitest.workspace.ts 里没解析出任何项目路径 —— 格式变了？本脚本按 "./路径" 字面量匹配。')
}

for (const dir of listed) {
  if (!existsSync(join(ROOT, dir, 'package.json'))) {
    fail(`vitest.workspace.ts 列了 ./${dir}，但它不是一个 workspace 包（找不到 package.json）`)
  }
}

// ---------- 逐包校验 ----------
for (const ws of workspaces) {
  const pkg = JSON.parse(readFileSync(join(ws.path, 'package.json'), 'utf8'))
  const scripts = pkg.scripts ?? {}
  const label = `${pkg.name ?? ws.dir}（${ws.dir}）`

  if (!scripts.typecheck) {
    fail(
      `${label} 没有 typecheck 脚本。根 typecheck 带 --if-present，会静默跳过它 —— ` +
        `这个包等于没有类型检查。补一条 "typecheck": "tsc --noEmit -p tsconfig.json"。`
    )
  }

  if (!hasTestFile(ws.path)) continue

  if (!scripts.test) {
    fail(`${label} 有测试文件但没有 test 脚本。`)
  }
  if (!listed.includes(ws.dir)) {
    fail(
      `${label} 有测试文件，但不在 vitest.workspace.ts 的清单里 —— ` +
        `\`pnpm test\` 根本不会跑它，且不会报错。把 './${ws.dir}' 加进去。`
    )
  }
}

// ---------- 输出 ----------
if (errors.length > 0) {
  console.error(`✗ check-workspace-scripts 失败（${errors.length} 项）：\n`)
  for (const e of errors) console.error(`  · ${e}`)
  console.error('')
  process.exit(1)
}

console.log(
  `✅ check-workspace-scripts 通过：${workspaces.length} 个 workspace 均声明 typecheck；` +
    `${listed.length} 个项目已挂在 vitest.workspace.ts 上。`
)
