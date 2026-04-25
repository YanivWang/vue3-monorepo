import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import importPlugin from 'eslint-plugin-import'
import vueParser from 'vue-eslint-parser'

const pcFromRoots = [
  './packages/components/pc',
  './packages/directives/pc',
  './packages/hooks/pc',
  './packages/request/pc'
]
const h5FromRoots = [
  './packages/components/h5',
  './packages/directives/h5',
  './packages/hooks/h5',
  './packages/request/h5'
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
      '**/.output/**'
    ]
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
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
      }
    }
  },

  // ---------------- 通用规则 ----------------
  {
    files: ['{apps,docs,packages,scripts}/**/*.{ts,vue}'],
    rules: {
      'no-console': ['warn', { allow: ['log', 'warn', 'error', 'info'] }],
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },

  // ---------------- 测试文件宽松规则 ----------------
  {
    files: ['**/*.{spec,test}.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'vue/one-component-per-file': 'off',
      'vue/require-render-return': 'off'
    }
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
            ...['components', 'directives', 'hooks', 'request'].map(type => ({
              target: `./packages/${type}/pc`,
              from: `./packages/${type}/h5`,
              message: 'PC 包禁止引 H5 同类型包'
            })),
            ...['components', 'directives', 'hooks', 'request'].map(type => ({
              target: `./packages/${type}/h5`,
              from: `./packages/${type}/pc`,
              message: 'H5 包禁止引 PC 同类型包'
            })),
            {
              target: './packages/request/core',
              from: ['./packages/request/pc', './packages/request/h5'],
              message: 'core request 禁止反依赖端侧 preset'
            },
            {
              target: './packages/hooks/core',
              from: [...pcFromRoots, ...h5FromRoots],
              message: '通用 hooks 禁止依赖端侧 UI 包'
            },
            {
              target: './packages',
              from: './apps',
              message: '共享包禁止反依赖 apps'
            },
            {
              target: './apps/pc/pc-admin-template',
              from: './apps/h5/h5-template',
              message: 'PC admin 禁止引用 h5 源码（store 不共享）'
            },
            {
              target: './apps/h5/h5-template',
              from: './apps/pc/pc-admin-template',
              message: 'h5 禁止引用 admin 源码（store 不共享）'
            }
          ]
        }
      ]
    }
  },

  // ---------------- preset 包禁止直接 import axios ----------------
  {
    files: ['packages/request/pc/**/*.ts', 'packages/request/h5/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['axios'],
              message: 'preset 包禁止直接 import axios，必须走 @vue3-mono/request 核心'
            }
          ]
        }
      ]
    }
  },

  // ---------------- core request 禁止 import 任何 UI 库 ----------------
  {
    files: ['packages/request/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['element-plus', 'element-plus/*', 'vant', 'vant/*'],
              message: '@vue3-mono/request 核心包严禁 import 任何 UI 库，UI 反馈必须走依赖注入'
            }
          ]
        }
      ]
    }
  },

  // ---------------- 通用 hooks 禁止 import 端侧 UI ----------------
  {
    files: ['packages/hooks/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['element-plus', 'element-plus/*', 'vant', 'vant/*'],
              message: '@vue3-mono/hooks 通用 hooks 严禁 import 端侧 UI，端侧 hooks 在 packages/hooks/pc|h5'
            }
          ]
        }
      ]
    }
  },

  prettier
)
