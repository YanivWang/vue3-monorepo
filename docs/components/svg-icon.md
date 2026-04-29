# SvgIcon 图标

PC 模板使用的 SVG / 外链图标封装，由 **`packages/shared`** 提供并在 **`@vue3-monorepo/shared/components-pc`** 中全局注册。通过 **`name`** 区分两种模式（见 Props）。

## 基础用法

```vue
<template>
  <!-- 外链或根路径 SVG：命中 URL 判定后走 img 渲染 -->
  <SvgIcon name="/icons/logo.svg" />

  <!-- SVG Symbol：name 视为短名，使用 #icon-{name} -->
  <SvgIcon name="user" :size="20" />

  <!-- 自定义颜色（继承时为 currentColor） -->
  <SvgIcon name="setting" :size="24" color="#409eff" />
</template>
```

## Props

与 [`packages/shared/src/components-pc/SvgIcon/index.vue`](https://github.com/YanivWang/vue3-monorepo/blob/main/packages/shared/src/components-pc/SvgIcon/index.vue) 源码一致：

| 属性    | 类型     | 默认值           | 说明                                                                                   |
| ------- | -------- | ---------------- | -------------------------------------------------------------------------------------- |
| `name`  | `string` | （必填）         | **`http(s):` 或以 `/` 开头**：外链资源；否则为 symbol **短名**（`use` `#icon-{name}`） |
| `size`  | `number` | `16`             | 尺寸（px）                                                                             |
| `color` | `string` | `'currentColor'` | 图标颜色                                                                               |

符号模式需自建 SVG sprite 与 `<symbol id="icon-...">`（本仓库 **未**默认接入 `vite-plugin-svg-icons`；可按需补齐构建链）。外链模式仅依赖 `name` 为 URL。

## 源码位置

[`packages/shared/src/components-pc/SvgIcon/index.vue`](https://github.com/YanivWang/vue3-monorepo/blob/main/packages/shared/src/components-pc/SvgIcon/index.vue)
