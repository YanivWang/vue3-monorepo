import type { App } from 'vue'
import { ElMessage } from 'element-plus'
import { registerDirectives as registerPcDirectives } from '@vue3-mono/directives-pc'
import { useUserStore } from '@/stores/modules/user'

/**
 * Admin 应用级指令注册：将 @vue3-mono/directives-pc 注入用户权限/角色判断。
 */
export function registerDirectives(app: App): void {
  registerPcDirectives(app, {
    hasPermission: key => useUserStore().hasPermission(key),
    hasRole: key => useUserStore().hasRole(key),
    copy: {
      onSuccess: () => ElMessage.success('已复制'),
      onError: () => ElMessage.error('复制失败')
    }
  })
}
