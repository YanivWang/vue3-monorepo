#!/usr/bin/env node
// @ts-check

/**
 * check-audit：依赖安全公告的棘轮门禁——存量不要求清零，但不许再涨。
 *
 * ## 为什么不是「跑一下 pnpm audit 就完事」
 *
 * 接入当天 high 级公告有 31 条，全部来自 dev 依赖的传递依赖（mockjs、ajv→fast-uri、
 * esbuild 等），清零需要一串 major 升级，不该阻塞当下。但如果因此不做门禁，新引入的
 * 漏洞同样没人拦。所以按 ID 记基线：**基线里的容忍，基线外的一律失败**。
 *
 * `critical` 级不进基线（`--update` 也拒绝写入）：那一档必须当场处理，
 * 否则一次 `--update` 就能把真问题洗成「历史包袱」。
 *
 * ## 为什么显式指定 registry
 *
 * 私有源 / 国内镜像（npmmirror 等）没有实现 audit 端点，直接跑会报
 * ERR_PNPM_AUDIT_ENDPOINT_NOT_EXISTS。这里固定走官方源查公告，与安装用哪个源无关。
 *
 * ## 离线怎么办
 *
 * 查不到公告时**直接失败**，不会「查不动就当通过」——那正是这一类门禁最常见的死法。
 * 确实需要离线跑全量校验时，显式 `SKIP_AUDIT=1 pnpm run verify:full`，
 * 让跳过是一个有意识的动作，而不是悄悄发生的。
 *
 * ## 用法
 *
 *   pnpm run check:audit           # CI 与 verify:full 用
 *   pnpm run check:audit:update    # 升级依赖清掉一批后，收紧基线
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const BASELINE_PATH = resolve(scriptDir, 'audit-baseline.json')
const UPDATE = process.argv.includes('--update')
const REGISTRY = 'https://registry.npmjs.org'

if (process.env.SKIP_AUDIT === '1') {
  console.log('⚠ SKIP_AUDIT=1，已跳过依赖安全公告检查（离线逃生口，不要写进 CI）。')
  process.exit(0)
}

// ── 跑 pnpm audit ────────────────────────────────────────────────────
/** @type {string} */
let raw
try {
  raw = execFileSync('pnpm', ['audit', '--audit-level', 'high', '--registry', REGISTRY, '--json'], {
    cwd: resolve(scriptDir, '..'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
} catch (e) {
  // 有公告时 pnpm 以非零码退出，JSON 仍在 stdout —— 这是正常路径
  raw = `${e.stdout ?? ''}`
  if (!raw.trim()) {
    console.error('✗ 无法获取依赖安全公告（网络不通，或 registry 没有 audit 端点）。')
    console.error(`  本脚本固定查询 ${REGISTRY}。`)
    console.error('  确需离线跑：SKIP_AUDIT=1 pnpm run verify:full')
    process.exit(1)
  }
}

/** @type {{ advisories?: Record<string, { github_advisory_id?: string, severity?: string, module_name?: string, title?: string }> }} */
let parsed
try {
  parsed = JSON.parse(raw)
} catch {
  console.error('✗ pnpm audit 的输出不是合法 JSON，无法判定。原始输出前 500 字：')
  console.error(raw.slice(0, 500))
  process.exit(1)
}

const advisories = Object.values(parsed.advisories ?? {})
const current = new Map(
  advisories
    .filter((a) => a.severity === 'high' || a.severity === 'critical')
    .map((a) => [
      a.github_advisory_id ?? `${a.module_name}:${a.title}`,
      { severity: a.severity, module: a.module_name, title: a.title },
    ]),
)

// ── 写基线 ───────────────────────────────────────────────────────────
if (UPDATE) {
  const criticals = [...current].filter(([, v]) => v.severity === 'critical')
  if (criticals.length > 0) {
    console.error('✗ 拒绝把 critical 级公告写进基线，请先升级依赖：')
    for (const [id, v] of criticals) console.error(`  · ${id} ${v.module} — ${v.title}`)
    process.exit(1)
  }
  const next = {
    note: '按 GHSA ID 记录的存量高危公告；critical 不入基线。收紧用 pnpm run check:audit:update',
    updatedAt: new Date().toISOString().slice(0, 10),
    allow: Object.fromEntries(
      [...current].sort(([a], [b]) => a.localeCompare(b)).map(([id, v]) => [id, `${v.module} — ${v.title}`]),
    ),
  }
  const before = existsSync(BASELINE_PATH)
    ? Object.keys(JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).allow ?? {}).length
    : 0
  writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`✓ 基线已更新：${before} → ${current.size} 条高危公告。`)
  process.exit(0)
}

// ── 校验 ─────────────────────────────────────────────────────────────
if (!existsSync(BASELINE_PATH)) {
  console.error(`✗ 找不到基线文件 ${BASELINE_PATH}，先跑 pnpm run check:audit:update。`)
  process.exit(1)
}
const allow = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).allow ?? {}

const added = [...current].filter(([id]) => !(id in allow))
const criticals = [...current].filter(([, v]) => v.severity === 'critical')

if (criticals.length > 0) {
  console.error(`✗ 存在 ${criticals.length} 条 critical 级公告，必须当场处理（不接受基线豁免）：`)
  for (const [id, v] of criticals) console.error(`  · ${id} ${v.module} — ${v.title}`)
}
if (added.length > 0) {
  console.error(`✗ 新增 ${added.length} 条基线外的高危公告：`)
  for (const [id, v] of added) console.error(`  · ${id} [${v.severity}] ${v.module} — ${v.title}`)
  console.error('\n  升级对应依赖；确认无法处理时再 pnpm run check:audit:update 收进基线。')
}
if (criticals.length > 0 || added.length > 0) process.exit(1)

const fixed = Object.keys(allow).filter((id) => !current.has(id))
if (fixed.length > 0) {
  console.log(`✅ 依赖安全公告通过：${current.size} 条存量，无新增。`)
  console.log(`   另有 ${fixed.length} 条已消失，可跑 pnpm run check:audit:update 收紧基线。`)
} else {
  console.log(`✅ 依赖安全公告通过：${current.size} 条存量，无新增。`)
}
