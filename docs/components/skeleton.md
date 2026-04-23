# Skeleton 骨架屏

在内容加载期间，用占位图形展示内容结构，提升用户体验。

## 基础用法

```vue
<template>
  <!-- list 变体：3 行文本 -->
  <Skeleton variant="list" :rows="3" />
</template>
```

## 变体

### list（文本列表）

```vue
<template>
  <Skeleton variant="list" :rows="5" />
</template>
```

渲染效果：多行灰色线条，模拟文字段落。

### card（卡片）

```vue
<template>
  <Skeleton variant="card" />
</template>
```

渲染效果：顶部宽矩形（图片占位）+ 下方两行文字。

### avatar（头像+文字）

```vue
<template>
  <Skeleton variant="avatar" />
</template>
```

渲染效果：左侧圆形头像 + 右侧两行文字。

## 关闭动画

```vue
<template>
  <Skeleton variant="list" :animated="false" />
</template>
```

## 与数据加载配合

```vue
<script setup lang="ts">
const { data, loading } = useRequest(() => getUserInfo())
</script>

<template>
  <Skeleton v-if="loading" variant="avatar" />
  <UserCard v-else :user="data" />
</template>
```

## 多卡片布局

```vue
<template>
  <el-row :gutter="16">
    <el-col v-for="i in 3" :key="i" :span="8">
      <Skeleton variant="card" />
    </el-col>
  </el-row>
</template>
```

## Props

| 属性       | 类型                           | 默认值   | 说明             |
| ---------- | ------------------------------ | -------- | ---------------- |
| `variant`  | `'list' \| 'card' \| 'avatar'` | `'list'` | 骨架屏样式变体   |
| `rows`     | `number`                       | `3`      | list 变体行数    |
| `animated` | `boolean`                      | `true`   | 是否开启呼吸动画 |

## 在线示例

运行 `pnpm dev` 后访问：**文件上传页面**（`/examples/upload`）中包含了 Skeleton 骨架屏与真实数据加载的组合演示。

## 源码位置

`src/components/Skeleton/index.vue`
