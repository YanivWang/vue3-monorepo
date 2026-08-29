# PageContainer 页面容器

统一的页面卡片容器，用于包裹各页面的主内容区域，提供标题区和操作区布局。组件出自 **`packages/shared`**，经 **`@vue3-monorepo/shared/components-pc`** 在 PC 模板中全局注册；**H5** 另有 `PageContainer`（`components-h5`），结构与 PC 不完全相同。

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

## 完整组合示例

典型的 CRUD 页面结构：

```vue
<script setup lang="ts">
import { getUserList } from '@/api/modules/user'

const columns = [
  { type: 'index', label: '#', width: 60 },
  { prop: 'username', label: '用户名', minWidth: 120 },
  { prop: 'nickname', label: '昵称', minWidth: 120 },
  { label: '操作', slot: 'action', width: 160, fixed: 'right' },
]

const tableRef = ref()
</script>

<template>
  <PageContainer title="用户管理" subtitle="系统用户列表与权限配置">
    <template #extra>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </template>

    <ProTable ref="tableRef" :fetch-fn="getUserList" :columns="columns" show-search>
      <template #search="{ handleSearch, handleReset }">
        <el-form inline>
          <el-form-item label="用户名">
            <el-input placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #action="{ row }">
        <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </ProTable>
  </PageContainer>
</template>
```

## 在线示例

在仓库**根目录**运行 `pnpm run admin:dev`，再访问以下路由（均以 PC **模板包** `@vue3-monorepo/admin` 为准）：

| 页面      | 路径               | 说明                         |
| --------- | ------------------ | ---------------------------- |
| CRUD 示例 | `/examples/crud`   | 完整的增删改查 + 分页 + 搜索 |
| 表单验证  | `/examples/form`   | 表单验证 + 各类组件          |
| 文件上传  | `/examples/upload` | 拖拽上传 + 进度条            |
| 图表      | `/examples/charts` | ECharts 多种图表类型         |

## 源码位置

[`packages/shared/src/components-pc/PageContainer/index.vue`](https://github.com/YanivWang/vue3-monorepo/blob/main/packages/shared/src/components-pc/PageContainer/index.vue)
