# 权限体系

## 整体设计

```
后端菜单接口 (GET /menu/routes)
    ↓
usePermissionStore.generateRoutes()
    ↓ menuToRoutes()
动态路由（addRoute 到 Layout）
    ↓
路由守卫（router/guards.ts）
    ↓
页面级：requiresAuth / permissions / roles 字段控制
    ↓
按钮级：v-permission / v-role 指令 / usePermission composable
```

## 路由 Meta 字段

```ts
// src/types/router.d.ts
interface RouteMeta {
  title?: string // 页面标题
  icon?: string // 菜单图标
  hidden?: boolean // 是否在菜单隐藏
  keepAlive?: boolean // 是否缓存页面
  requiresAuth?: boolean // 是否需要登录
  permissions?: string[] // 需要的权限码（满足其一）
  roles?: string[] // 需要的角色（满足其一）
  affix?: boolean // Tab 是否固定不可关闭
}
```

## v-permission 指令

基于**权限码**控制按钮/元素显示（`v-if` 语义，无权限时直接移除 DOM）：

```html
<!-- 单个权限码 -->
<el-button v-permission="'user:create'">新增用户</el-button>

<!-- 满足其一即可（OR 逻辑） -->
<el-button v-permission="['user:create', 'user:edit']">操作</el-button>
```

> `*:*:*` 权限码表示超级管理员，自动跳过所有权限检查。

## v-role 指令

基于**角色**控制元素显示：

```html
<!-- 单个角色 -->
<div v-role="'admin'">管理员专区</div>

<!-- 满足其一即可 -->
<div v-role="['admin', 'editor']">内容管理</div>
```

## usePermission Composable

在 `<script setup>` 中使用，提供更灵活的条件判断：

```ts
import { usePermission } from '@/composables/usePermission'

const { hasPermission, hasAllPermissions, hasRole, hasAllRoles } = usePermission()

// 是否有权限（满足其一）
if (hasPermission('user:delete')) {
  // ...
}

// 是否同时满足所有权限
if (hasAllPermissions(['order:view', 'order:export'])) {
  // ...
}

// 是否有角色
if (hasRole('admin')) {
  // ...
}
```

## 权限数据来源

权限码和角色均来自登录后 `/user/info` 接口返回的 `UserInfo`：

```ts
interface UserInfo {
  roles: string[] // 如 ['admin', 'editor']
  permissions: string[] // 如 ['user:list', 'user:create', '*:*:*']
}
```
