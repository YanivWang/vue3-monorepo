# @vue3-mono/hooks

两端共享的通用 Vue3 Composables（UI 库无关）。

## 暴露

| Hook                       | 说明                                              |
| -------------------------- | ------------------------------------------------- |
| `createUsePermission(ctx)` | 工厂函数，接收 state 注入后返回 `usePermission`   |
| `useTable(options)`        | 分页表格：loading / pagination / fetch 封装       |
| `useRequest(fn, options)`  | 异步请求：loading / error / debounce / abort 封装 |

## 设计原则

- **UI 无关**：不引用 Element Plus / Vant，任何错误提示、弹窗逻辑通过 `onError` 参数由业务层自行处理
- **Store 解耦**：`usePermission` 不直接依赖任何 Pinia store；业务层通过 `createUsePermission` 注入具体 state

## 使用示例

```ts
// 基础：useRequest
import { useRequest } from '@vue3-mono/hooks'
import { showFailToast } from 'vant'

const { data, loading, run } = useRequest(getUserList, {
  onError: e => showFailToast(e.message)
})
```

```ts
// 权限：createUsePermission 绑定到业务 store
import { createUsePermission } from '@vue3-mono/hooks'
import { useUserStore } from '@/stores/modules/user'

export const usePermission = createUsePermission({
  permissions: () => useUserStore().permissions,
  roles: () => useUserStore().roles,
  hasPermission: p => useUserStore().hasPermission(p),
  hasRole: r => useUserStore().hasRole(r)
})
```
