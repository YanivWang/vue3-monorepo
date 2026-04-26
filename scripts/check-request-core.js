#!/usr/bin/env node
/**
 * P3.4a：@vue3-mono/shared/request-core 核心包禁止出现任何 UI 框架 API 字样（防回归）
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'packages/shared/src/request-core')

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
console.log('[check-request-core] OK — packages/shared/src/request-core 无 UI 耦合字样')
