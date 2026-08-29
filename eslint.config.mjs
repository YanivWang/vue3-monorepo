import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import importPlugin from 'eslint-plugin-import'
import vueParser from 'vue-eslint-parser'

const pcFromRoots = [
  './packages/shared/src/components-pc',
  './packages/shared/src/directives-pc',
  './packages/shared/src/hooks-pc',
  './packages/shared/src/request-pc',
]
const h5FromRoots = [
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
        projectService: true,
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
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './packages/shared/src/components-pc',
              from: './packages/shared/src/components-h5',
              message: 'PC 包禁止引 H5 同类型包',
            },
            {
              target: './packages/shared/src/components-h5',
              from: './packages/shared/src/components-pc',
              message: 'H5 包禁止引 PC 同类型包',
            },
            {
              target: './packages/shared/src/directives-pc',
              from: './packages/shared/src/directives-h5',
              message: 'PC 包禁止引 H5 同类型包',
            },
            {
              target: './packages/shared/src/directives-h5',
              from: './packages/shared/src/directives-pc',
              message: 'H5 包禁止引 PC 同类型包',
            },
            {
              target: './packages/shared/src/hooks-pc',
              from: './packages/shared/src/hooks-h5',
              message: 'PC 包禁止引 H5 同类型包',
            },
            {
              target: './packages/shared/src/hooks-h5',
              from: './packages/shared/src/hooks-pc',
              message: 'H5 包禁止引 PC 同类型包',
            },
            {
              target: './packages/shared/src/request-pc',
              from: './packages/shared/src/request-h5',
              message: 'PC 包禁止引 H5 同类型包',
            },
            {
              target: './packages/shared/src/request-h5',
              from: './packages/shared/src/request-pc',
              message: 'H5 包禁止引 PC 同类型包',
            },
            {
              target: './packages/request-core',
              from: ['./packages/shared/src/request-pc', './packages/shared/src/request-h5'],
              message: 'core request 禁止反依赖端侧 preset',
            },
            {
              target: './packages/shared/src/hooks-core',
              from: [...pcFromRoots, ...h5FromRoots],
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

  // ---------------- shared 内 request-pc / request-h5 预设禁止直接 import axios ----------------
  {
    files: ['packages/shared/src/request-pc/**/*.ts', 'packages/shared/src/request-h5/**/*.ts'],
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
    files: ['packages/request-core/**/*.ts'],
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
    files: ['packages/js-bridge/**/*.ts'],
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
    files: ['packages/shared/src/hooks-core/**/*.ts'],
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
