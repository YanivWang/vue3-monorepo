# PageContainer 页面容器

统一的页面卡片容器，用于包裹各页面的主内容区域，提供标题区和操作区布局。

## 基础用法

```vue
<template>
  <PageContainer title="用户管理" subtitle="管理系统全部用户">
    <!-- 页面内容 -->
    <p>这里是页面内容</p>
  </PageContainer>
</template>
```

## 带右侧操作区

```vue
<template>
  <PageContainer title="用户管理">
    <template #extra>
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
      <el-button @click="handleExport">导出</el-button>
    </template>

    <!-- 主内容 -->
    <UserTable />
  </PageContainer>
</template>
```

## Props

| 属性       | 类型                             | 默认值    | 说明           |
| ---------- | -------------------------------- | --------- | -------------- |
| `title`    | `string`                         | —         | 页面/卡片标题  |
| `subtitle` | `string`                         | —         | 副标题说明文字 |
| `shadow`   | `'always' \| 'hover' \| 'never'` | `'never'` | 卡片阴影模式   |

## Slots

| 插槽名    | 说明                               |
| --------- | ---------------------------------- |
| `default` | 页面主内容                         |
| `extra`   | 标题右侧额外操作区（通常放置按钮） |

## 源码位置

`src/components/PageContainer/index.vue`
