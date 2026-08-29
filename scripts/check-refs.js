#!/usr/bin/env node
// @ts-check

/**
 * check-refs: 校验 monorepo 元数据一致性
 *
 * 覆盖校验项（任一失败即 exit 1）：
 *  1) 从 pnpm-workspace.yaml 枚举 workspace；数量不做固定常数约束（多 app 时无需手改本脚本）
 *  2) 每个 workspace 的 package.json name 必须唯一
 *  3) 每个 workspace 的 package.json name 必须与 tsconfig.base.json paths 一致（apps/*、docs 除外；packages 下各顶层 workspace 包须有映射；paths 中 @vue3-monorepo/shared/* 子路径别名不参与此条）
 *  4) tsconfig.base.json paths 目标 src/index.ts 在磁盘上必须真实存在
 *  5) 根 tsconfig.json 的 references 路径目录必须存在
 *  6) 每个包的 "workspace:*" 依赖目标必须存在于当前 workspace
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const errors = []
const log = (msg) => console.log(msg)
const fail = (msg) => errors.push(msg)

// ---------- 加载 pnpm-workspace packages 行 ----------
const workspaceYaml = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8')
const inPackages = workspaceYaml.split(/^packages:\s*$/m).slice(1)[0] ?? ''
const entryLines = inPackages
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /^-\s+['"]/.test(l))
  .map((l) => l.replace(/^-\s+(['"])([^'"\n]+)\1.*$/, '$2'))

// ---------- 枚举 workspace：foo/* 扫描子目录；无 * 的视为单包目录（如 docs） ----------
const workspaces = []
function addWorkspaceIfPkg(dir) {
  const full = join(ROOT, dir)
  const pkgJson = join(full, 'package.json')
  if (!existsSync(full) || !statSync(full).isDirectory() || !existsSync(pkgJson)) return
  if (workspaces.some((w) => w.dir === dir)) return
  workspaces.push({ dir, path: full, pkgJson })
}

for (const entry of entryLines) {
  if (entry.endsWith('/*')) {
    const parent = entry.slice(0, -2)
    const base = join(ROOT, parent)
    if (!existsSync(base)) continue
    for (const name of readdirSync(base)) {
      const rel = join(parent, name)
      const full = join(ROOT, rel)
      if (!statSync(full).isDirectory()) continue
      addWorkspaceIfPkg(rel)
    }
  } else {
    addWorkspaceIfPkg(entry)
  }
}

log(`[check-refs] 发现 ${workspaces.length} 个 workspace`)

// ---------- 读取各 workspace 的 name ----------
const pkgs = workspaces.map((ws) => {
  const pkg = JSON.parse(readFileSync(ws.pkgJson, 'utf8'))
  return {
    ...ws,
    name: pkg.name,
    deps: { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}), ...(pkg.peerDependencies || {}) },
  }
})

// ---------- 2) name 唯一 ----------
const seen = new Map()
for (const p of pkgs) {
  if (!p.name) {
    fail(`[check-refs] ${p.dir}/package.json 缺少 name 字段`)
    continue
  }
  if (seen.has(p.name)) {
    fail(`[check-refs] name 重复：${p.name}（${p.dir} vs ${seen.get(p.name)}）`)
  } else {
    seen.set(p.name, p.dir)
  }
}

// ---------- 3) package name 与 tsconfig.base paths 一一对应 ----------
const tsconfigBase = JSON.parse(readFileSync(join(ROOT, 'tsconfig.base.json'), 'utf8').replace(/\/\/.*$/gm, ''))
const paths = tsconfigBase.compilerOptions?.paths ?? {}
const pathKeys = Object.keys(paths).filter((k) => !k.endsWith('/*'))

const packageNames = pkgs.filter((p) => !p.dir.startsWith('apps/') && p.dir !== 'docs').map((p) => p.name)

for (const name of packageNames) {
  if (!pathKeys.includes(name)) {
    fail(`[check-refs] packages 包 ${name} 在 tsconfig.base.json paths 中缺失映射`)
  }
}
for (const key of pathKeys) {
  if (packageNames.includes(key)) continue
  // @vue3-monorepo/shared/* 子路径别名（如 styles/tokens.ts 与 styles/tokens/ 目录区分）
  if (key.startsWith('@vue3-monorepo/shared/')) continue
  fail(`[check-refs] tsconfig.base.json paths 的 ${key} 对应不到任何 workspace 包`)
}

// ---------- 4) paths 目标文件必须存在 ----------
// wildcard（以 /* 结尾）：只校验父目录；具体文件路径：校验 existsSync
for (const [alias, targets] of Object.entries(paths)) {
  for (const target of targets) {
    const isWildcard = target.endsWith('/*')
    const checkPath = isWildcard ? target.slice(0, -2) : target
    const abs = join(ROOT, checkPath)
    if (!existsSync(abs)) {
      fail(`[check-refs] tsconfig.base.json paths["${alias}"] 指向 ${target} 不存在`)
    }
  }
}

// ---------- 5) 根 tsconfig.json references 目录存在 ----------
const tsconfigRoot = JSON.parse(readFileSync(join(ROOT, 'tsconfig.json'), 'utf8').replace(/\/\/.*$/gm, ''))
for (const ref of tsconfigRoot.references ?? []) {
  const p = join(ROOT, ref.path)
  if (!existsSync(p)) {
    fail(`[check-refs] tsconfig.json references 路径 ${ref.path} 不存在`)
  }
}

// ---------- 6) workspace:* 依赖目标必须存在 ----------
const nameSet = new Set(pkgs.map((p) => p.name))
for (const p of pkgs) {
  for (const [dep, version] of Object.entries(p.deps)) {
    if (typeof version === 'string' && version.startsWith('workspace:')) {
      if (!nameSet.has(dep)) {
        fail(`[check-refs] ${p.name} 依赖 ${dep}@${version}，但 workspace 中不存在该包`)
      }
    }
  }
}

// ---------- 汇总 ----------
if (errors.length > 0) {
  console.error('\n❌ check-refs 失败：')
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}
console.log('✅ check-refs 通过')
