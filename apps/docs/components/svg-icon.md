# SvgIcon 图标

SVG 图标组件，支持外部 SVG URL 和内联 SVG symbol 两种使用方式。

## 基础用法

```vue
<template>
  <!-- 使用 src 传入图标路径 -->
  <SvgIcon src="/icons/user.svg" />

  <!-- 使用 icon-class 引用 symbol id（需配合 SVG sprite） -->
  <SvgIcon icon-class="home" />

  <!-- 自定义尺寸和颜色 -->
  <SvgIcon src="/icons/setting.svg" :size="24" color="#409eff" />
</template>
```

## Props

| 属性        | 类型               | 默认值           | 说明                              |
| ----------- | ------------------ | ---------------- | --------------------------------- |
| `src`       | `string`           | —                | SVG 图标路径（URL 或相对路径）    |
| `iconClass` | `string`           | —                | SVG symbol id（用于 Sprite 模式） |
| `size`      | `number \| string` | `16`             | 图标尺寸（px）                    |
| `color`     | `string`           | `'currentColor'` | 图标颜色                          |

## 源码位置

`src/components/SvgIcon/index.vue`
