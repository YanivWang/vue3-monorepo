#!/usr/bin/env node
/**
 * check-request-core：@vue3-monorepo/request-core 源码禁止出现 Element Plus / Vant 等
 * UI 反馈类 API 关键字（防回归），保证 HTTP 内核与 UI 解耦。由 pre-commit 与 verify:full 调用。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'packages/request-core/src')

const BANNED = [
  { re: /\bElMessage\b/, name: 'ElMessage' },
  { re: /\bElMessageBox\b/, name: 'ElMessageBox' },
  { re: /\bshowToast\b/, name: 'showToast' },
  { re: /\bshowDialog\b/, name: 'showDialog' },
  { re: /\bshowConfirmDialog\b/, name: 'showConfirmDialog' },
  { re: /\bshowNotify\b/, name: 'showNotify' },
  { re: /\bMessage\.(success|error|warning|info)\b/, name: 'Message.*' }
]

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts') && !name.endsWith('.test.ts')) acc.push(p)
  }
  return acc
}

let bad = false
for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8')
  for (const { re, name } of BANNED) {
    if (re.test(text)) {
      console.error(`[check-request-core] ${relative(ROOT, file)} 含禁止 UI 关键字: ${name}`)
      bad = true
    }
  }
}

if (bad) process.exit(1)
console.log('[check-request-core] OK — @vue3-monorepo/request-core（packages/request-core/src）无 UI 耦合字样')
