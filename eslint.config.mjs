import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import importX from 'eslint-plugin-import-x'
import vueParser from 'vue-eslint-parser'

// shared 内部按「端」划分的两组目录。规则按整组互斥，而不是只挡同类型目录：
// components-pc 引 hooks-h5 同样会把 Vant 拖进 PC 产物，同类型两两配对挡不住这种。
const pcRoots = [
  './packages/shared/src/components-pc',
  './packages/shared/src/directives-pc',
  './packages/shared/src/hooks-pc',
  './packages/shared/src/request-pc',
]
const h5Roots = [
  './packages/shared/src/components-h5',
  './packages/shared/src/directives-h5',
  './packages/shared/src/hooks-h5',
  './packages/shared/src/request-h5',
]

export default tseslint.config(
  {
    ignores: [
      'dist',
      '**/dist/**',
      'coverage',
      '**/coverage/**',
      '**/.vitepress/dist/**',
      '**/.vitepress/cache/**',
      'node_modules',
      '**/node_modules/**',
      '**/*.d.ts',
      '**/.nuxt/**',
      '**/.output/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // ---------------- 语言选项（覆盖 monorepo 全部 ts/vue/js/mjs） ----------------
  {
    files: ['{apps,docs,packages,scripts}/**/*.{ts,vue,js,mjs}', '*.{ts,mjs,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // ---------------- 通用规则 ----------------
  {
    files: ['{apps,docs,packages,scripts}/**/*.{ts,vue}'],
    rules: {
      'no-console': ['warn', { allow: ['log', 'warn', 'error', 'info'] }],
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // ---------------- 类型感知规则（只对 src 下的 .ts） ----------------
  // 这一档是 recommended 拿不到的：漏 await 的 Promise、把 async 函数传给只接受
  // 同步回调的地方、对 any 的不安全操作——这些是 lint 唯一能拦、而 tsc 不会报的一类。
  // 作用域刻意收在 src/**/*.ts：
  //  - 配置文件（vite/vitest/eslint 等）不在业务 tsconfig 的 include 里，开了会报
  //    「not found by the project service」；它们的价值也不在类型安全。
  //  - .vue 走 vue-eslint-parser，类型感知开销大且噪声高，等有需要再单独开一档。
  {
    files: ['apps/*/*/src/**/*.ts', 'packages/*/src/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        // 显式列出参与的 tsconfig，而不是用 projectService 自动发现：
        // 每个包都有「源码工程 + 测试工程」两份（见各包 tsconfig.vitest.json），
        // 而自动发现只认最近的那个 tsconfig.json——测试文件被它 exclude 掉之后，
        // 会以 "was not found by the project service" 整片解析失败。
        project: [
          'apps/*/*/tsconfig.json',
          'apps/*/*/tsconfig.vitest.json',
          'packages/*/tsconfig.json',
          'packages/*/tsconfig.vitest.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 下面三条在本仓库是纯误报，关掉并写明理由，好过在几十处写 eslint-disable：
      //
      // require-await：js-bridge 的各宿主策略要实现同一套异步契约，浏览器宿主下
      // storage.get/vibrate 等本来就是同步的，但签名必须是 async 才能与小程序/
      // App 宿主对齐。去掉 async 会改变返回类型、破坏契约，留着才是对的。
      '@typescript-eslint/require-await': 'off',
      //
      // unbound-method：这条针对的是「类方法脱离实例后 this 丢失」。本仓库被它
      // 命中的全是组合式函数返回的闭包（useLogin 的解构、vitest 的 spy 断言），
      // 没有 this 可丢。唯一的类 HttpRequest 在 request-core 内部使用、不解构。
      '@typescript-eslint/unbound-method': 'off',
      //
      // no-unused-vars：全仓已约定交给 tsc 的 noUnusedLocals / noUnusedParameters
      // （见下方通用规则块），两边都开只会对同一处报两遍，且 tsc 认下划线前缀。
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // ---------------- 测试文件宽松规则 ----------------
  {
    files: ['**/*.{spec,test}.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'vue/one-component-per-file': 'off',
      'vue/require-render-return': 'off',
    },
  },

  // ---------------- 依赖边界：import/no-restricted-paths ----------------
  // 严禁端侧包互引、preset 反依赖 core、通用 hooks 依赖端侧 UI、共享包反依赖 apps、两个 app 互引源码
  //
  // ⚠️ resolver 是这一档的前提，不是可选项：`no-restricted-paths` 只对**能解析到磁盘文件**
  // 的 import 生效，解析不到的一律跳过且不报错。默认的 node resolver 不认省略扩展名的
  // `.ts`、不认 `.vue`、不认 tsconfig paths / workspace 包的 exports，于是下面每一条 zone
  // 都会静默失效——2026-08-30 实测：components-pc 里 `import '../hooks-h5/useVantMessage'`
  // 一条错都不报。接 eslint-import-resolver-typescript 后才真正拦得住。
  // 这条依赖不是可选项，别当成「顺手装的插件」删掉。
  //
  // 用 eslint-plugin-import-x 而不是 eslint-plugin-import：后者的 peer 至今只到
  // eslint ^9，在 ESLint 10 上直接 peer 冲突；import-x 是同一批规则的活跃维护分支。
  // 规则前缀因此是 `import-x/`。
  // 常驻反例见 scripts/check-import-boundaries.mjs（verify:full 会跑），resolver 一掉就红。
  {
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          // .vue 不在 resolver 默认扩展名里，不加则组件间的跨端引用照样解析不到
          extensions: ['.ts', '.tsx', '.d.ts', '.vue', '.js', '.jsx', '.json', '.node'],
          // 各 app / 包自己的 tsconfig 才有 `@/` 之类的 paths；根 tsconfig 是 solution
          // 配置，只有 references 没有 paths，单列它解析不到别名
          project: ['tsconfig.base.json', 'apps/*/*/tsconfig.json', 'packages/*/tsconfig.json', 'docs/tsconfig.json'],
          // 上面是多 project，resolver 默认会每次 lint 都提示「考虑合并成单个 tsconfig」。
          // 本仓库就是 solution 结构，提示不适用，关掉以免淹没真正的报错。
          noWarnOnMultipleProjects: true,
        },
      },
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            // 端侧整组互斥：pc 组任一目录都不许引 h5 组任一目录，反之亦然
            {
              target: pcRoots,
              from: h5Roots,
              message: 'PC 端包禁止引 H5 端包（会把 Vant 等 H5 依赖拖进 PC 产物）',
            },
            {
              target: h5Roots,
              from: pcRoots,
              message: 'H5 端包禁止引 PC 端包（会把 Element Plus 等 PC 依赖拖进 H5 产物）',
            },
            {
              target: './packages/request-core',
              from: ['./packages/shared/src/request-pc', './packages/shared/src/request-h5'],
              message: 'core request 禁止反依赖端侧 preset',
            },
            {
              target: './packages/shared/src/hooks-core',
              from: [...pcRoots, ...h5Roots],
              message: '通用 hooks 禁止依赖端侧 UI 包',
            },
            {
              target: './packages/shared',
              from: './apps',
              message: '共享包禁止反依赖 apps',
            },
            {
              target: './apps/pc/pc-admin-template',
              from: './apps/h5/h5-template',
              message: 'PC admin 禁止引用 h5 源码（store 不共享）',
            },
            {
              target: './apps/h5/h5-template',
              from: './apps/pc/pc-admin-template',
              message: 'h5 禁止引用 admin 源码（store 不共享）',
            },
          ],
        },
      ],
    },
  },

  // 下面四档按「模块名」限制 import。作用域都写成 `**/*.{ts,vue}`：
  // 这些目录今天确实只有 .ts，但只写 .ts 的话，哪天有人往里加一个 .vue，
  // 规则会**静默地不覆盖它**——边界规则最不该出现的失效方式。
  //
  // ---------------- shared 内 request-pc / request-h5 预设禁止直接 import axios ----------------
  {
    files: ['packages/shared/src/request-pc/**/*.{ts,vue}', 'packages/shared/src/request-h5/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['axios'],
              message: 'request-pc / request-h5 预设禁止直接 import axios，必须走 @vue3-monorepo/request-core',
            },
          ],
        },
      ],
    },
  },

  // ---------------- core request 禁止 import 任何 UI 库 ----------------
  {
    files: ['packages/request-core/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['element-plus', 'element-plus/*', 'vant', 'vant/*'],
              message: '@vue3-monorepo/request-core 核心包严禁 import 任何 UI 库，UI 反馈必须走依赖注入',
            },
          ],
        },
      ],
    },
  },

  // ---------------- js-bridge 禁止依赖 shared ----------------
  {
    files: ['packages/js-bridge/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@vue3-monorepo/shared', '@vue3-monorepo/shared/*'],
              message: '@vue3-monorepo/js-bridge 禁止依赖 shared',
            },
          ],
        },
      ],
    },
  },

  // ---------------- 通用 hooks 禁止 import 端侧 UI ----------------
  {
    files: ['packages/shared/src/hooks-core/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['element-plus', 'element-plus/*', 'vant', 'vant/*'],
              message:
                '@vue3-monorepo/shared/hooks-core 通用 hooks 严禁 import 端侧 UI，端侧 hooks 在 packages/shared/src/hooks-pc|hooks-h5',
            },
          ],
        },
      ],
    },
  },

  prettier,
)
