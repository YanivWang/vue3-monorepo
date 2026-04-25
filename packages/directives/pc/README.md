# @vue3-mono/directives-pc

PC 端自定义指令集合，UI 无关（不依赖 Element Plus）。通过工厂函数注入状态 / 回调，避免与业务 Pinia store 直接耦合。

## 暴露

| 指令           | 工厂函数                                      | 说明                                                                           |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `v-permission` | `createPermissionDirective(checker)`          | 无权限时直接从 DOM 移除节点（v-if 语义），binding.value 支持 string / string[] |
| `v-role`       | `createRoleDirective(checker)`                | 无对应角色时移除节点，binding.value 支持 string / string[]                     |
| `v-copy`       | `createCopyDirective({ onSuccess, onError })` | 点击复制 binding.value 到剪贴板，成功 / 失败回调可选                           |

## 快速使用

```ts
import { registerDirectives } from '@vue3-mono/directives-pc'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

registerDirectives(app, {
  hasPermission: k => useUserStore().hasPermission(k),
  hasRole: k => useUserStore().hasRole(k),
  copy: {
    onSuccess: () => ElMessage.success('已复制'),
    onError: () => ElMessage.error('复制失败')
  }
})
```

也可按需只注册单个指令：

```ts
import { createPermissionDirective } from '@vue3-mono/directives-pc'
app.directive(
  'permission',
  createPermissionDirective(k => useUserStore().hasPermission(k))
)
```
