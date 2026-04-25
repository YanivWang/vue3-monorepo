# 主题与暗黑模式

## 三种主题模式

| 模式     | 说明                                                   |
| -------- | ------------------------------------------------------ |
| `light`  | 强制亮色模式                                           |
| `dark`   | 强制暗黑模式                                           |
| `system` | 跟随操作系统偏好，监听 `prefers-color-scheme` 媒体查询 |

## 切换主题

```ts
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

// 切换到暗黑模式
appStore.setTheme('dark')

// 跟随系统
appStore.setTheme('system')
```

`setTheme` 会自动：

1. 将选择持久化到 `localStorage`
2. 在 `<html>` 元素上添加/移除 `.dark` class
3. `system` 模式下注册 `prefers-color-scheme` 媒体查询监听器

## CSS 变量体系

主题通过 CSS 自定义属性实现，`:root` 中定义亮色值，`html.dark` 中覆盖为暗色值。

```scss
/* 亮色（src/assets/styles/variables.scss）*/
:root {
  --bg-page: #f0f2f5;
  --bg-white: #ffffff;
  --text-primary: #303133;
  /* ... */
}

/* 暗黑（src/assets/styles/dark.scss）*/
html.dark {
  --bg-page: #0d0d0d;
  --bg-white: #141414;
  --text-primary: #e5eaf3;
  /* ... */
}
```

在组件中使用 CSS 变量：

```scss
.my-component {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## Element Plus 暗黑模式

`main.ts` 中引入 Element Plus 官方暗色 CSS 变量：

```ts
import 'element-plus/theme-chalk/dark/css-vars.css'
```

结合 `html.dark` 类，Element Plus 所有组件自动切换为暗色主题。

## 完整变量列表

| 变量名             | 亮色值    | 暗色值    | 说明            |
| ------------------ | --------- | --------- | --------------- |
| `--bg-page`        | `#f0f2f5` | `#0d0d0d` | 页面背景        |
| `--bg-white`       | `#ffffff` | `#141414` | 卡片/内容区背景 |
| `--bg-card`        | `#ffffff` | `#1d1e20` | 卡片背景        |
| `--text-primary`   | `#303133` | `#e5eaf3` | 主要文字        |
| `--text-regular`   | `#606266` | `#cfd3dc` | 常规文字        |
| `--text-secondary` | `#909399` | `#a3a6ad` | 次要文字        |
| `--border-color`   | `#dcdfe6` | `#3c3c3c` | 边框颜色        |
| `--sidebar-bg`     | `#001529` | `#141414` | 侧边栏背景      |
| `--header-bg`      | `#ffffff` | `#1d1e20` | 顶栏背景        |
