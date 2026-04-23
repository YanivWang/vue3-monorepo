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
  { ignores: ['dist', 'node_modules', '**/*.d.ts', 'src/types/auto-imports.d.ts', '.eslintrc-auto-import.json'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
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
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.{spec,test}.{ts,js}'],
    rules: {
      'vue/one-component-per-file': 'off'
    }
  },
  prettier
)
