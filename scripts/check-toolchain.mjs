#!/usr/bin/env node
// @ts-check

/**
 * check-toolchain：Node / pnpm 版本只允许有一个真源。
 *
 * ## 为什么需要它
 *
 * 「单一真源」写在文档里是拦不住漂移的。本仓库真实踩过：
 * 把 `.nvmrc` / `engines` / `packageManager` 一起抬到 Node 22 + pnpm 11 之后，
 * 三个 Dockerfile 仍停在 `node:20-alpine` + `corepack prepare pnpm@10.17.0`。
 * 结果不是「用了旧版本」，是**镜像直接构建不出来**：
 *   - corepack 以 package.json 的 packageManager 为准，`prepare pnpm@10` 的钉子没用，
 *     实际拉的是 pnpm 11；
 *   - pnpm 11 依赖 Node 22 的内建模块，跑在 node:20 上当场 ERR_UNKNOWN_BUILTIN_MODULE；
 *   - 就算绕过这一步，`.npmrc` 的 engine-strict 也会因 engines.node >=22 直接拒绝安装。
 *
 * 而 CI 只跑 `verify:full`，不构建镜像 —— 于是全绿，问题一直躺着。
 *
 * ## 校验项（任一失败即 exit 1）
 *
 *  1) `.nvmrc` 的版本满足 package.json 的 `engines.node`
 *  2) `packageManager` 的 pnpm 版本满足 `engines.pnpm`，且就是 pnpm
 *  3) 每个 Dockerfile 的 `FROM node:<x>` 大版本与 `.nvmrc` 一致
 *  4) Dockerfile 不得把 pnpm 版本写死成与 `packageManager` 不同的值
 *     （`corepack enable` 后由 packageManager 决定版本，写死只会制造第二个真源）
 *  5) workflow 用 `node-version-file: '.nvmrc'` 而不是硬编码 `node-version`
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** @type {string[]} */
const errors = []
const fail = (/** @type {string} */ msg) => errors.push(msg)

const read = (/** @type {string} */ p) => readFileSync(join(ROOT, p), 'utf8')

// ---------- 真源 ----------
const nvmrc = read('.nvmrc').trim().replace(/^v/, '')
const pkg = JSON.parse(read('package.json'))
const engines = pkg.engines ?? {}
const packageManager = String(pkg.packageManager ?? '')

/** `1.2.3` → [1,2,3]；解析不出来返回 null */
const parseVersion = (/** @type {string} */ v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v.trim())
  return m ? /** @type {[number, number, number]} */ ([+m[1], +m[2], +m[3]]) : null
}

const compare = (/** @type {[number,number,number]} */ a, /** @type {[number,number,number]} */ b) =>
  a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

/**
 * 只支持本仓库实际使用的 `>=x.y.z` 与精确 `x.y.z` 两种写法。
 * 遇到看不懂的范围**直接报错**，而不是当成通过 —— 这类脚本最容易死在
 * 「解析不了就跳过」上。
 * @returns {true | string} true 表示满足，字符串是失败原因
 */
function satisfies(version, range, label) {
  const v = parseVersion(version)
  if (!v) return `${label} 的版本 "${version}" 不是 x.y.z 形式，无法校验`
  const r = range.trim()
  const exact = parseVersion(r)
  if (exact) return compare(v, exact) === 0 ? true : `${label} ${version} ≠ engines 要求的 ${r}`
  const ge = /^>=\s*(\d+\.\d+\.\d+)$/.exec(r)
  if (ge) {
    const min = /** @type {[number,number,number]} */ (parseVersion(ge[1]))
    return compare(v, min) >= 0 ? true : `${label} ${version} 不满足 engines 的 ${r}`
  }
  return `engines 里的 "${r}" 用了本脚本没覆盖的 semver 写法。请扩展 scripts/check-toolchain.mjs 的 satisfies()，不要留一个看不懂就放行的口子。`
}

// ---------- 1) .nvmrc vs engines.node ----------
if (!engines.node) {
  fail('package.json 缺少 engines.node —— 版本约束没有真源，.npmrc 的 engine-strict 也就形同虚设。')
} else {
  const r = satisfies(nvmrc, String(engines.node), '.nvmrc')
  if (r !== true) fail(r)
}

// ---------- 2) packageManager vs engines.pnpm ----------
const pmMatch = /^([a-z]+)@(\d+\.\d+\.\d+)/.exec(packageManager)
if (!pmMatch) {
  fail(`package.json 的 packageManager "${packageManager}" 不是 "<name>@<x.y.z>" 形式。`)
} else if (pmMatch[1] !== 'pnpm') {
  fail(`packageManager 是 ${pmMatch[1]}，但仓库 preinstall 挂了 only-allow pnpm。`)
} else if (engines.pnpm) {
  const r = satisfies(pmMatch[2], String(engines.pnpm), 'packageManager 的 pnpm')
  if (r !== true) fail(r)
}
const pnpmVersion = pmMatch?.[2] ?? null
const nodeMajor = nvmrc.split('.')[0]

// ---------- 3~4) Dockerfile ----------
/** @type {string[]} */
const dockerfiles = []
const collectDockerfiles = (/** @type {string} */ dir) => {
  const abs = join(ROOT, dir)
  if (!existsSync(abs)) return
  for (const name of readdirSync(abs)) {
    const rel = join(dir, name)
    if (statSync(join(ROOT, rel)).isDirectory()) collectDockerfiles(rel)
    else if (name === 'Dockerfile' || name.startsWith('Dockerfile.')) dockerfiles.push(rel)
  }
}
collectDockerfiles('docker')

if (dockerfiles.length === 0) {
  fail('docker/ 下没找到任何 Dockerfile —— 目录结构变了？本脚本按 docker/**/Dockerfile 收集。')
}

for (const file of dockerfiles) {
  const text = read(file)

  const fromNode = [...text.matchAll(/^FROM\s+node:([^\s]+)/gm)].map((m) => m[1])
  if (fromNode.length === 0) {
    // 纯 nginx 之类的镜像没有 node 阶段，跳过即可
    continue
  }
  for (const tag of fromNode) {
    const major = tag.split('.')[0].split('-')[0]
    if (major !== nodeMajor) {
      fail(
        `${file}: FROM node:${tag} 与 .nvmrc（${nvmrc}）不是同一个大版本。` +
          ` engines.node 是 ${String(engines.node)} 且 .npmrc 开了 engine-strict，` +
          `版本对不上时镜像会在 pnpm install 阶段直接失败。`,
      )
    }
  }

  const pinned = [...text.matchAll(/corepack\s+prepare\s+pnpm@(\d+\.\d+\.\d+)/g)].map((m) => m[1])
  for (const v of pinned) {
    if (v !== pnpmVersion) {
      fail(
        `${file}: corepack prepare pnpm@${v} 与 packageManager（pnpm@${pnpmVersion}）不一致。` +
          ` corepack 在项目目录内以 packageManager 为准，这个钉子不会生效，只会让人以为镜像用的是 ${v}。` +
          ` 去掉版本、只留 corepack enable。`,
      )
    }
  }
}

// ---------- 5) workflow 不得硬编码 node 版本 ----------
const workflowDir = '.github/workflows'
if (existsSync(join(ROOT, workflowDir))) {
  for (const name of readdirSync(join(ROOT, workflowDir))) {
    if (!/\.ya?ml$/.test(name)) continue
    const rel = join(workflowDir, name)
    const text = read(rel)
    const hardcoded = [...text.matchAll(/^\s*node-version:\s*['"]?([^'"\s#]+)/gm)].map((m) => m[1])
    for (const v of hardcoded) {
      fail(`${rel}: 硬编码了 node-version: ${v}。改用 node-version-file: '.nvmrc'，让 CI 与本地共用一个真源。`)
    }
  }
}

// ---------- 输出 ----------
if (errors.length > 0) {
  console.error(`✗ check-toolchain 失败（${errors.length} 项）：\n`)
  for (const e of errors) console.error(`  · ${e}`)
  console.error(
    '\n  Node / pnpm 版本的真源是 .nvmrc 与 package.json 的 engines / packageManager。' +
      '\n  改版本时这几处要一起动，Dockerfile 与 workflow 只许引用、不许各写各的。\n',
  )
  process.exit(1)
}

console.log(
  `✅ check-toolchain 通过：Node ${nvmrc} / pnpm ${pnpmVersion} 单一真源一致` +
    `（${dockerfiles.length} 个 Dockerfile 与 workflow 均未另立版本）。`,
)
