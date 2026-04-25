# @vue3-mono/locale

i18n 框架层封装：基于 `vue-i18n@9 (legacy: false)` 的单例创建 / 语言切换 / 类型化 messages。

> 基础 messages（common / menu / auth / error / tabs / http）随包提供，作为 PC / H5 双端共享契约；业务文案通过 `messages` 参数扩展合并。

## 使用

```ts
import { createI18nInstance, setupI18n, setLocale } from '@vue3-mono/locale'

const i18n = createI18nInstance({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': { app: { title: '后台管理' } },
    'en-US': { app: { title: 'Admin' } }
  }
})

// 挂载到 app
setupI18n(app, i18n)

// 切换语言
setLocale(i18n, 'en-US')
```

## 暴露

- `createI18nInstance(options)`：创建 `vue-i18n` 实例
- `setupI18n(app, i18n)`：`app.use(i18n)` 语法糖
- `setLocale(i18n, locale)` / `getLocale(i18n)`：运行时语言切换
- `zhCN` / `enUS`：基础 messages（可被业务层增量合并）
- `defaultMessages`：`{ 'zh-CN': zhCN, 'en-US': enUS }`
- `BaseMessages`：基础 messages 的 TS 类型契约
- `defaultNumberFormats` / `defaultDatetimeFormats`：预设格式化

## 设计

- **契约源**：`zh-CN` 为类型源（`BaseMessages = typeof zhCN`）
- **合并规则**：默认 `mergeDefaults: true` 时，上层 messages 会与默认 messages 按语言键浅合并（`{ ...base[lang], ...extra[lang] }`）
- **跨端复用**：PC / H5 共享同一套 `common/auth/error/...` 翻译
- **零 UI 依赖**：不依赖任何 Element Plus / Vant，可被任意 Vue3 应用使用
