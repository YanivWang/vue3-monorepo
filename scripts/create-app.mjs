#!/usr/bin/env node
// @ts-check
/**
 * 交互式（或全参数）在 apps/pc 或 apps/h5 下从模板生成新 workspace 应用，并接好根脚本文档/ vitest/ tsconfig。
 * 使用：pnpm run create-app
 */

import { readFileSync, writeFileSync, existsSync, cpSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')

const TEMPLATES = {
  h5: {
    rel: 'apps/h5/h5-template',
    defaultPort: 5174
  },
  admin: {
    rel: 'apps/pc/pc-admin-template',
    defaultPort: 5173
  }
}

const RESERVED_PREFIXES = new Set([
  'dev',
  'typecheck',
  'test',
  'lint',
  'format',
  'build',
  'prepare',
  'preinstall',
  'check',
  'verify',
  'clean',
  'docker',
  'admin',
  'h5',
  'docs',
  'type-check',
  'test:run',
  'create-app'
])

function shouldCopyPath(src) {
  const p = src.replace(/\\/g, '/')
  if (/(^|\/)node_modules(\/|$)/.test(p)) return false
  if (/(^|\/)dist(\/|$)/.test(p)) return false
  if (/(^|\/)\.turbo(\/|$)/.test(p)) return false
  if (/(^|\/)(coverage|\.git)(\/|$)/.test(p)) return false
  return true
}

function parseArg(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') out.help = true
    else if (a === '--append-build') out.appendBuild = true
    else if (a.startsWith('--') && a.includes('=')) {
      const eq = a.indexOf('=')
      const k = a.slice(2, eq)
      out[k === 'append-build' ? 'appendBuild' : k] = a.slice(eq + 1)
    } else if (a.startsWith('--')) {
      const k = a.slice(2)
      const key = k === 'append-build' ? 'appendBuild' : k
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        out[key] = next
        i++
      } else {
        out[key] = true
      }
    }
  }
  return out
}

async function main() {
  const args = parseArg(process.argv.slice(2))
  if (args.help) {
    console.log(`用法:
  pnpm run create-app

  或（非交互，须一次给齐）:
  pnpm run create-app --type h5|admin --dir <目录名> --name <@vue3-monorepo/包名> --prefix <根脚本短前缀> --port <端口> [--append-build]

选项:
  --append-build  将新应用的 :build 接到根 build 中（在 docs:build 之前）
  -h, --help      显示本说明
`)
    process.exit(0)
  }

  let type = /** @type {('h5'|'admin')|undefined} */ (args.type)
  let dirName = args.dir ? String(args.dir) : undefined
  let packageName = args.name ? String(args.name) : undefined
  let shortPrefix = args.prefix ? String(args.prefix) : undefined
  let port = args.port !== undefined ? Number(args.port) : undefined
  let appendBuild = args.appendBuild === true

  const hasAll = type && dirName && packageName && shortPrefix && port !== undefined && !Number.isNaN(port)

  if (!hasAll) {
    const t = await prompts(
      {
        type: 'select',
        name: 'type',
        message: '选择应用类型',
        choices: [
          { title: 'H5（Vant、Bridge 等，基于 h5-template）', value: 'h5' },
          { title: 'PC Admin（Element Plus 等，基于 pc-admin-template）', value: 'admin' }
        ],
        initial: 0
      },
      { onCancel: () => process.exit(1) }
    )
    if (!t.type) process.exit(1)
    type = t.type

    // 以下「如 pc-portal / h5-shop」与 initial 仅为交互占位示例名，非仓库固定应用
    const dirHint = type === 'admin' ? '将创建在 apps/pc/ 下，如 pc-portal' : '将创建在 apps/h5/ 下，如 h5-shop'
    const dirInitial = type === 'admin' ? 'pc-portal' : 'h5-shop'

    const d = await prompts(
      {
        type: 'text',
        name: 'dirName',
        message: `新应用目录名（${dirHint}）`,
        initial: dirInitial,
        validate: s => {
          if (!/^[a-z][a-z0-9-]*$/.test(String(s).trim())) {
            return '仅小写字母、数字、连字符，且以字母开头'
          }
          return true
        }
      },
      { onCancel: () => process.exit(1) }
    )
    if (!d.dirName) process.exit(1)
    dirName = String(d.dirName).trim()

    const sensibleName = `@vue3-monorepo/${dirName}`

    const n = await prompts(
      {
        type: 'text',
        name: 'packageName',
        message: 'npm 包名（name 字段）',
        initial: sensibleName,
        validate: s => {
          if (!/^@vue3-monorepo\/[a-z0-9-]+$/.test(String(s).trim())) {
            return '须匹配 @vue3-monorepo/小写连字符名'
          }
          return true
        }
      },
      { onCancel: () => process.exit(1) }
    )
    if (!n.packageName) process.exit(1)
    packageName = String(n.packageName).trim()

    const pr = await prompts(
      {
        type: 'text',
        name: 'shortPrefix',
        message: '根 package.json 脚本前缀（将生成 前缀:dev、前缀:build 等）',
        initial: dirName,
        validate: s => {
          if (!/^[a-z][a-z0-9-]*$/.test(String(s).trim())) {
            return '仅小写字母、数字、连字符，且以字母开头'
          }
          return true
        }
      },
      { onCancel: () => process.exit(1) }
    )
    if (!pr.shortPrefix) process.exit(1)
    shortPrefix = String(pr.shortPrefix).trim()

    const defPort = 5176
    const p = await prompts(
      {
        type: 'number',
        name: 'port',
        message: 'Vite dev 端口（勿与 5173/5174/5175 等冲突）',
        initial: defPort,
        min: 1024,
        max: 65535
      },
      { onCancel: () => process.exit(1) }
    )
    if (p.port == null) process.exit(1)
    port = Number(p.port)

    const ab = await prompts(
      {
        type: 'confirm',
        name: 'appendBuild',
        message: '将新应用加入根 build 链（在 docs:build 之前执行 :build）？',
        initial: false
      },
      { onCancel: () => process.exit(1) }
    )
    appendBuild = Boolean(ab.appendBuild)
  } else {
    if (type !== 'h5' && type !== 'admin') {
      console.error('--type 须为 h5 或 admin')
      process.exit(1)
    }
    if (!/^[a-z][a-z0-9-]*$/.test(String(dirName))) {
      console.error('无效的 --dir')
      process.exit(1)
    }
    if (!/^@vue3-monorepo\/[a-z0-9-]+$/.test(String(packageName))) {
      console.error('无效的 --name')
      process.exit(1)
    }
    if (!/^[a-z][a-z0-9-]*$/.test(String(shortPrefix))) {
      console.error('无效的 --prefix')
      process.exit(1)
    }
    if (typeof port !== 'number' || Number.isNaN(port) || port < 1024 || port > 65535) {
      console.error('无效的 --port')
      process.exit(1)
    }
  }

  if (type !== 'h5' && type !== 'admin') {
    console.error('type 须为 h5 或 admin')
    process.exit(1)
  }
  if (typeof port !== 'number' || Number.isNaN(port) || port < 1024 || port > 65535) {
    console.error('port 未设置或不在 1024–65535 范围内')
    process.exit(1)
  }
  const devPort = port

  const base = type === 'h5' ? 'apps/h5' : 'apps/pc'
  const targetRel = join(base, /** @type {string} */ (dirName))
  const targetAbs = join(ROOT, targetRel)
  const srcAbs = join(ROOT, TEMPLATES[/** @type {'h5'|'admin'} */ (type)].rel)

  if (existsSync(targetAbs)) {
    console.error(`目标已存在，中止: ${targetRel}`)
    process.exit(1)
  }

  const rootPkgPath = join(ROOT, 'package.json')
  const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'))
  const scripts = rootPkg.scripts ?? {}

  // 两个模板都带 test 脚本，根别名对称生成
  const newScriptKeys = [
    `${shortPrefix}:dev`,
    `${shortPrefix}:build`,
    `${shortPrefix}:typecheck`,
    `${shortPrefix}:test`
  ]

  for (const k of newScriptKeys) {
    if (k in scripts) {
      console.error(`根 package.json 已存在脚本: ${k}，请换 --prefix 或先删除冲突。`)
      process.exit(1)
    }
  }
  if (RESERVED_PREFIXES.has(String(shortPrefix))) {
    console.error(`短前缀与保留名冲突: ${shortPrefix}`)
    process.exit(1)
  }

  console.log(`复制模板 ${TEMPLATES[type].rel} → ${targetRel} ...`)
  cpSync(srcAbs, targetAbs, {
    recursive: true,
    filter: src => shouldCopyPath(src)
  })

  const pkgPath = join(targetAbs, 'package.json')
  const newPkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  newPkg.name = /** @type {string} */ (packageName)
  newPkg.description =
    type === 'admin'
      ? `PC 管理后台（由 create-app 自 pc-admin-template 生成）`
      : `H5 应用（由 create-app 自 h5-template 生成）`
  writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2) + '\n', 'utf8')

  const oldTemplateRel = TEMPLATES[/** @type {'h5'|'admin'} */ (type)].rel
  const vitePath = join(targetAbs, 'vite.config.ts')
  let viteText = readFileSync(vitePath, 'utf8')
  viteText = viteText.replace(/port:\s*\d+/, `port: ${devPort}`)
  writeFileSync(vitePath, viteText, 'utf8')

  const readmePath = join(targetAbs, 'README.md')
  if (existsSync(readmePath)) {
    let readme = readFileSync(readmePath, 'utf8')
    readme = readme.split(oldTemplateRel).join(targetRel.replace(/\\/g, '/'))
    readme = readme.replace(/^# @vue3-monorepo\/(admin|h5)\b/m, `# ${packageName}`)
    writeFileSync(readmePath, readme, 'utf8')
  }

  // 根 package.json 脚本
  const filterArg = (/** @type {string} */ name) => `pnpm --filter ${name} `
  const pkgName = /** @type {string} */ (packageName)
  scripts[`${shortPrefix}:dev`] = filterArg(pkgName) + 'dev'
  scripts[`${shortPrefix}:build`] = filterArg(pkgName) + 'build'
  scripts[`${shortPrefix}:typecheck`] = filterArg(pkgName) + 'typecheck'
  scripts[`${shortPrefix}:test`] = filterArg(pkgName) + 'test'
  rootPkg.scripts = scripts

  if (appendBuild) {
    const b = String(scripts.build || '')
    if (b.includes(`${shortPrefix}:build`)) {
      // already
    } else {
      // insert " && pnpm run prefix:build" before docs:build
      if (b.includes('docs:build')) {
        rootPkg.scripts.build = b.replace('pnpm run docs:build', `pnpm run ${shortPrefix}:build && pnpm run docs:build`)
      } else {
        rootPkg.scripts.build =
          b + (b.endsWith('&&') || b.length === 0 ? ' ' : ' && ') + `pnpm run ${shortPrefix}:build`
      }
    }
  }

  writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n', 'utf8')

  // 根 tsconfig.json（带注释的 JSONC：用块插入）
  const tsconfigRootPath = join(ROOT, 'tsconfig.json')
  let tsconfigText = readFileSync(tsconfigRootPath, 'utf8')
  const insertBlock = `    { "path": "./${targetRel.replace(/\\/g, '/')}" },
    { "path": "./${targetRel.replace(/\\/g, '/')}/tsconfig.node.json" },
`
  if (tsconfigText.includes(`"./${targetRel.replace(/\\/g, '/')}"`)) {
    console.warn('根 tsconfig.json 似乎已含该 path，跳过插入')
  } else {
    const marker = `    { "path": "./docs" },`
    if (!tsconfigText.includes(marker)) {
      console.error('根 tsconfig.json 中未找到预期标记（// docs 的 reference），请手改。')
    } else {
      tsconfigText = tsconfigText.replace(marker, insertBlock + marker)
      writeFileSync(tsconfigRootPath, tsconfigText, 'utf8')
    }
  }

  // vitest.workspace.ts
  const vwsPath = join(ROOT, 'vitest.workspace.ts')
  let vws = readFileSync(vwsPath, 'utf8')
  const vwsPathRel = './' + targetRel.replace(/\\/g, '/')
  if (vws.includes(`'${vwsPathRel}'`)) {
    console.warn('vitest.workspace.ts 已含该路径，跳过')
  } else {
    // 数组可能被 prettier 折成单行或多行，两种写法都插到 `export default [` 之后的首位
    const multiline = /export default \[[^\S\n]*\n([^\S\n]*)/
    if (multiline.test(vws)) {
      vws = vws.replace(multiline, (match, indent) => `${match}'${vwsPathRel}',\n${indent}`)
    } else {
      vws = vws.replace('export default [', `export default ['${vwsPathRel}', `)
    }
    if (!vws.includes(vwsPathRel)) {
      console.error('未能自动写入 vitest.workspace.ts，请手改: export default 数组中增加 ' + vwsPathRel)
    } else {
      writeFileSync(vwsPath, vws, 'utf8')
    }
  }

  const rel = relative(ROOT, targetAbs) || targetRel
  console.log('\n完成。请执行（install 不可省，否则新包无 node_modules 链接）:')
  console.log(`  pnpm install`)
  console.log(`  pnpm run check:refs`)
  console.log(`  pnpm run check:workspace`)
  console.log(`  pnpm --filter ${pkgName} typecheck`)
  console.log(`  pnpm run ${shortPrefix}:dev`)
  console.log('\n提交信息 scope 可继续用 h5 或 admin，或在 commitlint.config.ts 中扩展。')
  console.log(`\n新应用路径: ${rel}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
