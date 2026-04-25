#!/usr/bin/env node
// @ts-check

/**
 * check-refs: 校验 monorepo 元数据一致性
 *
 * 覆盖校验项（任一失败即 exit 1）：
 *  1) pnpm-workspace.yaml 的 packages glob 扫描出的实际 workspace 数量 = 17
 *  2) 每个 workspace 的 package.json name 必须唯一
 *  3) 每个 workspace 的 package.json name 必须与 tsconfig.base.json paths 的 @vue3-mono/<x> 映射一一对应（apps/* 除外）
 *  4) tsconfig.base.json paths 目标 src/index.ts 在磁盘上必须真实存在
 *  5) 根 tsconfig.json 的 references 路径目录必须存在
 *  6) 每个包的 "workspace:*" 依赖目标必须存在于当前 workspace
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const errors = []
const log = msg => console.log(msg)
const fail = msg => errors.push(msg)

// ---------- 加载 workspace glob ----------
const workspaceYaml = readFileSync(join(ROOT, 'pnpm-workspace.yaml'), 'utf8')
const globLines = workspaceYaml
  .split('\n')
  .map(l => l.trim())
  .filter(l => /^-\s+(['"])[^'"\n]*\*[^'"\n]*\1/.test(l))
  .map(l => l.replace(/^-\s+(['"])([^'"\n]+)\1.*$/, '$2'))

// ---------- 枚举 workspace（glob 浅解析：支持任意深度 foo/bar/*/.../*） ----------
const workspaces = []
for (const glob of globLines) {
  if (!glob.endsWith('/*')) {
    fail(`[check-refs] 不支持的 glob: ${glob}（本脚本仅识别尾部为 /* 的形式）`)
    continue
  }
  const parent = glob.slice(0, -2) // 去掉末尾 '/*'
  const base = join(ROOT, parent)
  if (!existsSync(base)) continue
  for (const name of readdirSync(base)) {
    const full = join(base, name)
    if (!statSync(full).isDirectory()) continue
    const pkgJson = join(full, 'package.json')
    if (!existsSync(pkgJson)) continue
    const dir = relative(ROOT, full)
    if (workspaces.some(w => w.dir === dir)) continue // pnpm 允许但我们去重
    workspaces.push({ dir, path: full, pkgJson })
  }
}

const EXPECTED = 17
if (workspaces.length !== EXPECTED) {
  fail(`[check-refs] workspace 数量 ${workspaces.length} ≠ 预期 ${EXPECTED}（3 apps + 6 基础 + 4 PC + 4 H5）`)
}
log(`[check-refs] 发现 ${workspaces.length} 个 workspace`)

// ---------- 读取各 workspace 的 name ----------
const pkgs = workspaces.map(ws => {
  const pkg = JSON.parse(readFileSync(ws.pkgJson, 'utf8'))
  return {
    ...ws,
    name: pkg.name,
    deps: { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}), ...(pkg.peerDependencies || {}) }
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
const pathKeys = Object.keys(paths).filter(k => !k.endsWith('/*'))

const packageNames = pkgs.filter(p => !p.dir.startsWith('apps/')).map(p => p.name)

for (const name of packageNames) {
  if (!pathKeys.includes(name)) {
    fail(`[check-refs] packages 包 ${name} 在 tsconfig.base.json paths 中缺失映射`)
  }
}
for (const key of pathKeys) {
  if (!packageNames.includes(key)) {
    fail(`[check-refs] tsconfig.base.json paths 的 ${key} 对应不到任何 workspace 包`)
  }
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
const nameSet = new Set(pkgs.map(p => p.name))
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
