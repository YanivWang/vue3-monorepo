import js from '@eslint/js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const autoImportFile = join(__dirname, '.eslintrc-auto-import.json')
const autoImportRaw = JSON.parse(readFileSync(autoImportFile, 'utf8'))
const autoImportGlobals = Object.fromEntries(Object.keys(autoImportRaw.globals).map(k => [k, 'readonly']))

export default tseslint.config(
  {
    ignores: [
      'dist',
      'docs/.vitepress/dist',
      'node_modules',
      '**/*.d.ts',
      'src/types/auto-imports.d.ts',
      '.eslintrc-auto-import.json'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...autoImportGlobals
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
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      'no-console': ['warn', { allow: ['log', 'warn', 'error', 'info'] }],
      'vue/multi-word-component-names': 'off',
      // noUnusedLocals / noUnusedParameters in tsconfig already handle this at compile time
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.{spec,test}.{ts,tsx,js,jsx}'],
    rules: {
      'vue/one-component-per-file': 'off',
      // 故意在 render 中 throw 以测 ErrorBoundary 时无需返回值
      'vue/require-render-return': 'off'
    }
  },
  prettier
)
