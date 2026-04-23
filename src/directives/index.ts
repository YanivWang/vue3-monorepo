import type { App } from 'vue'
import { permission } from './permission'
import { role } from './role'

/**
 * 注册所有全局自定义指令
 *
 * 指令列表：
 * - v-permission：基于权限码控制元素显示（满足其一即保留）
 * - v-role：基于角色控制元素显示（满足其一即保留）
 *
 * @example
 * // v-permission
 * <el-button v-permission="'user:create'">新增</el-button>
 * <el-button v-permission="['user:create', 'user:edit']">操作</el-button>
 *
 * @example
 * // v-role
 * <el-button v-role="'admin'">管理员操作</el-button>
 * <el-button v-role="['admin', 'editor']">编辑操作</el-button>
 */
export function registerDirectives(app: App): void {
  app.directive('permission', permission)
  app.directive('role', role)
}
