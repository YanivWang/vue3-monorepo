# ProTable 高级表格

封装了数据加载、分页、搜索、多选等通用逻辑的业务表格组件。

## 基础用法

```vue
<script setup lang="ts">
import type { TableColumn } from '@/components/ProTable/index.vue'
import { getUserList } from '@/api/modules/user'

const columns: TableColumn[] = [
  { type: 'index', label: '#', width: 60 },
  { prop: 'username', label: '用户名', minWidth: 120 },
  { prop: 'nickname', label: '昵称', minWidth: 120 },
  { prop: 'roles', label: '角色', minWidth: 100 },
  { label: '操作', slot: 'action', width: 160, fixed: 'right' }
]
</script>

<template>
  <ProTable :fetch-fn="getUserList" :columns="columns">
    <template #action="{ row }">
      <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
      <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
    </template>
  </ProTable>
</template>
```

## 带搜索栏

```vue
<template>
  <ProTable :fetch-fn="getUserList" :columns="columns" show-search>
    <template #search="{ handleSearch, handleReset }">
      <el-form inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(searchForm)">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>
  </ProTable>
</template>
```

## 命令式调用

通过 `ref` 拿到组件实例，手动触发数据刷新：

```vue
<script setup lang="ts">
const tableRef = ref()

function afterCreate() {
  // 新增成功后刷新表格
  tableRef.value?.fetchData()
}
</script>

<template>
  <ProTable ref="tableRef" :fetch-fn="getUserList" :columns="columns" />
</template>
```

## fetchFn 接口规范

`fetchFn` 接收分页参数，必须返回 `PaginationResult<T>`：

```ts
interface PaginationResult<T> {
  list: T[]
  total: number
}

// 示例
async function getUserList(params: Record<string, unknown>): Promise<PaginationResult<User>> {
  return http.get('/user/list', params)
}
```

## Props

| 属性         | 类型            | 默认值  | 说明                   |
| ------------ | --------------- | ------- | ---------------------- |
| `fetchFn`    | `Function`      | —       | **必填**，数据请求函数 |
| `columns`    | `TableColumn[]` | —       | **必填**，列配置       |
| `rowKey`     | `string`        | `'id'`  | 行数据唯一键           |
| `showSearch` | `boolean`       | `false` | 是否显示搜索区         |
| `showAction` | `boolean`       | `false` | 是否显示工具栏         |
| `pageSize`   | `number`        | `10`    | 默认每页条数           |
| `immediate`  | `boolean`       | `true`  | 是否立即发起请求       |
| `selection`  | `boolean`       | `false` | 是否开启多选           |

## TableColumn 配置

| 字段        | 类型                                 | 说明         |
| ----------- | ------------------------------------ | ------------ |
| `prop`      | `string`                             | 数据字段名   |
| `label`     | `string`                             | 列标题       |
| `width`     | `string \| number`                   | 列宽         |
| `minWidth`  | `string \| number`                   | 最小列宽     |
| `fixed`     | `'left' \| 'right' \| boolean`       | 固定列       |
| `align`     | `'left' \| 'center' \| 'right'`      | 对齐方式     |
| `sortable`  | `boolean`                            | 是否可排序   |
| `slot`      | `string`                             | 自定义插槽名 |
| `type`      | `'index' \| 'selection' \| 'expand'` | 特殊列类型   |
| `formatter` | `Function`                           | 格式化函数   |

## Slots

| 插槽名   | 说明             | 参数                            |
| -------- | ---------------- | ------------------------------- |
| `search` | 搜索表单         | `{ handleSearch, handleReset }` |
| `action` | 工具栏左侧按钮区 | —                               |
| `[slot]` | 自定义列内容     | `{ row, index }`                |

## Expose

| 方法                   | 说明                     |
| ---------------------- | ------------------------ |
| `fetchData()`          | 重新拉取数据             |
| `handleSearch(params)` | 带参数搜索并重置到第一页 |
| `handleReset()`        | 清空搜索条件并重新拉取   |

## 源码位置

`src/components/ProTable/index.vue`
