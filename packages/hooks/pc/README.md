# @vue3-mono/hooks-pc

PC 专用 Composables：依赖 Element Plus / ECharts 的 Vue3 hooks。

## 暴露

| Hook           | 说明                                                     |
| -------------- | -------------------------------------------------------- |
| `useMessage()` | 统一封装 `ElMessage` / `ElMessageBox` / `ElNotification` |
| `useECharts()` | ECharts 实例管理（init / resize / dispose / 暗黑联动）   |

## 使用示例

```ts
import { useMessage, useECharts } from '@vue3-mono/hooks-pc'
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const { success, confirm, notify } = useMessage()
const appStore = useAppStore()

const { chartRef, setOption } = useECharts({
  isDark: computed(() => appStore.isDark)
})
```

> ECharts 组件（`LineChart` / `BarChart` / `GridComponent` 等）请在使用前通过 `@vue3-mono/utils` 预注册，或自行 `echarts.use([...])`。
