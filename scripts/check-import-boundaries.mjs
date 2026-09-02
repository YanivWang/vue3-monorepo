#!/usr/bin/env node
// @ts-check

/**
 * check-import-boundaries：给架构边界规则写的**常驻反例**。
 *
 * ## 为什么需要它
 *
 * 架构边界靠 eslint 的两组规则守：
 *   - `no-restricted-imports`：按**模块名**匹配（禁 axios / element-plus / vant / shared）。
 *     纯字符串比较，不依赖任何解析，坏不了。
 *   - `import-x/no-restricted-paths`：按**磁盘路径**匹配（端侧互引、shared 反依赖 apps…）。
 *     它只对「能解析到真实文件」的 import 生效——**解析不到就静默跳过，一条都不报**。
 *
 * 后者踩过一次：仓库长期没装 `eslint-import-resolver-typescript`，
 * 默认的 node resolver 不认扩展名省略的 `.ts`、不认 `.vue`、
 * 不认 tsconfig paths，于是所有 zone 全程失效。`pnpm run lint` 一直是绿的，
 * `components-pc` 里写 `import '../hooks-h5/useVantMessage'` 也照样过。
 * 这正是本仓库最忌讳的那类洞：**失败时表现为通过**。
 *
 * 所以边界规则不能只写在配置里就算数——本脚本在每次 `verify:full` 时真的造一批
 * 应当被拦的文件，跑 eslint，确认每一条都报了预期的规则，然后删掉。
 * 规则被误删、resolver 掉了、zone 路径写错，都会在这里当场红。
 *
 * ## 为什么走 ESLint 的 Node API 而不是命令行
 *
 * 探针都落在 `src/**` 下，命令行跑会连带启动类型感知那一档（parserOptions.project），
 * 单是加载 TS 工程就要十几秒（实测 10.3s → 摘掉后 1.3s）。边界规则本身完全不需要
 * 类型信息，所以这里复用**同一份 eslint.config.mjs**、只把类型感知那几条摘掉再跑
 * （见 withoutTypeAware）。
 * 关键是配置仍来自真实配置文件——照抄一份规则去测，测的就不是生产配置了。
 *
 * ## 用法
 *
 *   pnpm run check:boundaries
 */

import { ESLint } from 'eslint'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import baseConfig from '../eslint.config.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** 探针文件名统一带这个前缀，便于收尾时无条件清理 */
const PROBE = '__boundary-probe__'

/**
 * 每条 = 一个「应当被拦」的输入。
 * file：探针落在哪（决定命中哪条 zone / files 规则）
 * code：文件内容，用副作用 import，避免引入无关告警
 * rule：期望报出的规则 id
 * @type {{ desc: string, file: string, code: string, rule: string }[]}
 */
const CASES = [
  // ── import/no-restricted-paths：按路径 ───────────────────────────────
  {
    desc: 'PC 端包引 H5 端包（跨类型：components-pc → hooks-h5）',
    file: `packages/shared/src/components-pc/${PROBE}.ts`,
    code: `import '../hooks-h5/useVantMessage'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: 'H5 端包引 PC 端包（跨类型：hooks-h5 → request-pc）',
    file: `packages/shared/src/hooks-h5/${PROBE}.ts`,
    code: `import '../request-pc/index'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: 'PC 端包引 H5 端组件（显式写出 .vue 路径）',
    file: `packages/shared/src/components-pc/${PROBE}vue.ts`,
    code: `import '../components-h5/NavBar/index.vue'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    // ⚠️ 这条盯的是 resolver 的 `extensions` 里那个 '.vue'，上面那条盯不住：
    // 显式写出 `/index.vue` 时 resolver 不需要靠扩展名列表就能解析，
    // 把 '.vue' 从 extensions 删掉照样是绿的（实测如此）。
    // 省略扩展名才真正走 extensions —— 删掉 '.vue' 后这条 import 解析不到，
    // no-restricted-paths 于是静默跳过，一条错都不报。
    desc: 'PC 端包引 H5 端组件（省略扩展名，真正依赖 resolver 的 .vue 扩展名）',
    file: `packages/shared/src/components-pc/${PROBE}vue-ext.ts`,
    code: `import '../components-h5/NavBar'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: '通用 hooks 引端侧 hooks（hooks-core → hooks-pc）',
    file: `packages/shared/src/hooks-core/${PROBE}.ts`,
    code: `import '../hooks-pc/useMessage'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: 'shared 反依赖 apps',
    file: `packages/shared/src/utils/${PROBE}.ts`,
    code: `import '../../../../apps/pc/pc-admin-template/src/utils/storage'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: 'request-core 反依赖端侧 preset',
    file: `packages/request-core/src/${PROBE}.ts`,
    code: `import '../../shared/src/request-pc/index'\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: '两个 app 互引源码（admin → h5）',
    file: `apps/pc/pc-admin-template/src/${PROBE}.ts`,
    code: `import '../../../h5/h5-template/src/utils/tokenStorage'\n`,
    rule: 'import-x/no-restricted-paths',
  },

  // ── no-restricted-imports：按模块名 ─────────────────────────────────
  {
    desc: 'request-core import UI 库',
    file: `packages/request-core/src/${PROBE}ui.ts`,
    code: `import 'element-plus'\n`,
    rule: 'no-restricted-imports',
  },
  {
    desc: 'request-pc preset 直接 import axios',
    file: `packages/shared/src/request-pc/${PROBE}.ts`,
    code: `import 'axios'\n`,
    rule: 'no-restricted-imports',
  },
  {
    desc: 'hooks-core import 端侧 UI',
    file: `packages/shared/src/hooks-core/${PROBE}ui.ts`,
    code: `import 'vant'\n`,
    rule: 'no-restricted-imports',
  },
  {
    desc: 'js-bridge 依赖 shared',
    file: `packages/js-bridge/src/${PROBE}.ts`,
    code: `import '@vue3-monorepo/shared'\n`,
    rule: 'no-restricted-imports',
  },

  // ── .vue 也必须被覆盖 ───────────────────────────────────────────────
  // 上面几档的 files 都写成 `**/*.{ts,vue}`。这两条钉住这件事：
  // 只写 .ts 时，往目录里放一个 .vue 就能绕过全部边界规则，且没有任何提示。
  {
    desc: 'PC 端 .vue 组件引 H5 端 hooks（路径规则要覆盖 .vue 源文件）',
    file: `packages/shared/src/components-pc/${PROBE}.vue`,
    code: `<script setup lang="ts">\nimport '../hooks-h5/useVantMessage'\n</script>\n`,
    rule: 'import-x/no-restricted-paths',
  },
  {
    desc: 'hooks-core 下的 .vue import 端侧 UI（模块名规则要覆盖 .vue 源文件）',
    file: `packages/shared/src/hooks-core/${PROBE}.vue`,
    code: `<script setup lang="ts">\nimport 'vant'\n</script>\n`,
    rule: 'no-restricted-imports',
  },
]

/**
 * 从真实配置里摘掉类型感知那一档：
 *  - `recommended-type-checked` 的规则没有类型信息会直接报错，整条丢掉；
 *  - 拉起 TS 工程的是 `parserOptions` 里的 `project` / `projectService`，
 *    把这两个键摘掉即可，配置对象本身要留着（它还带着几条 `off` 规则）。
 *
 * 注意这里**不能**按「配置对象带没带某个键」去 filter 整条：
 * 本仓库用的是 `project`，而按 `projectService` 过滤的写法谁也匹配不上——
 * 结果是探针照样把整个 TS 工程拉起来（实测 10.3s vs 0.2s），
 * 而文件头还写着「已经摘掉了」。改成 map + 只删这两个键，两种写法都盖得住。
 */
const stripTypeAwareParserOptions = (/** @type {Record<string, any>} */ config) => {
  const parserOptions = config?.languageOptions?.parserOptions
  if (!parserOptions?.project && !parserOptions?.projectService) return config
  const rest = { ...parserOptions }
  delete rest.project
  delete rest.projectService
  return { ...config, languageOptions: { ...config.languageOptions, parserOptions: rest } }
}

const withoutTypeAware = baseConfig
  .filter((c) => !String(c?.name ?? '').includes('type-checked'))
  .map(stripTypeAwareParserOptions)

const cleanup = () => {
  for (const c of CASES) rmSync(join(ROOT, c.file), { force: true })
}

// 上一次异常中断可能留下探针，先清一遍再写
cleanup()

/** @type {string[]} */
const failures = []

try {
  for (const c of CASES) {
    const abs = join(ROOT, c.file)
    mkdirSync(dirname(abs), { recursive: true })
    writeFileSync(abs, c.code, 'utf8')
  }

  const eslint = new ESLint({
    cwd: ROOT,
    // 不去磁盘找 eslint.config.mjs：配置已经 import 进来并过滤过了
    overrideConfigFile: true,
    baseConfig: withoutTypeAware,
    errorOnUnmatchedPattern: true,
  })

  const results = await eslint.lintFiles(CASES.map((c) => c.file))
  const byFile = new Map(results.map((r) => [resolve(r.filePath), r.messages]))

  for (const c of CASES) {
    const messages = byFile.get(join(ROOT, c.file))
    if (!messages) {
      failures.push(`${c.desc} —— eslint 根本没检查 ${c.file}（被 ignores 挡了？）`)
      continue
    }
    if (!messages.some((m) => m.ruleId === c.rule)) {
      const got = [...new Set(messages.map((m) => m.ruleId ?? '(syntax)'))]
      failures.push(`${c.desc} —— 期望 ${c.rule} 报错，实际只有 [${got.join(', ') || '无任何报错'}]（${c.file}）`)
    }
  }
} finally {
  cleanup()
}

if (failures.length > 0) {
  console.error(`✗ check-import-boundaries 失败（${failures.length} 条边界规则没拦住应当被拦的输入）：\n`)
  for (const f of failures) console.error(`  · ${f}`)
  console.error(
    '\n  这类失败的含义是「架构边界规则形同虚设」，不是「探针写错了」——' +
      '先确认 eslint.config.mjs 的 zones / resolver 还在，再改本脚本。\n',
  )
  process.exit(1)
}

console.log(`✅ check-import-boundaries 通过：${CASES.length} 条应当被拦的 import 全部被拦下。`)
