# 权限体系

## 整体设计

```
后端菜单接口（`GET {VITE_API_PREFIX}/menu/routes`，模板中 `VITE_API_PREFIX` 多为 `/api`，即 `GET /api/menu/routes`）
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
// apps/pc/pc-admin-template/src/types/router.d.ts（declare module 'vue-router'）
interface RouteMeta {
  title?: string // 页面标题
  icon?: string // 菜单图标（Element Plus 图标名）
  hidden?: boolean // 是否在菜单隐藏，默认 false
  keepAlive?: boolean // 是否开启 keep-alive，默认 false
  requiresAuth?: boolean // 为 false 时无需登录，默认 true
  permissions?: string[] // 访问所需权限码，非空时须至少具备其中一项
  roles?: string[] // 访问所需角色，非空时须至少具备其中一项
  breadcrumb?: string // 面包屑名称，默认取 title
  affix?: boolean // Tab 是否固定不可关闭，默认 false
  alwaysShow?: boolean // 仅一个子路由时是否仍显示父级，默认 false
}
```

> **`roles` 目前不由路由守卫校验**：`router/guards.ts` 只收集 `to.matched` 上的 `meta.permissions` 并做 `hasPermission` 判断（命中其一即放行，否则跳 `/403`）。角色维度请用 `v-role` 指令或 `usePermission().hasRole()` 在页面/元素级控制；若需要按角色拦路由，请在守卫中自行补充。

> H5 模板的 `meta` 字段是另一套约定（`titleKey`、`tab`、`transition` 等），见 `apps/h5/h5-template/src/router/routes.ts` 头注释；H5 守卫只校验 `requiresAuth`。

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

权限码和角色均来自登录后用户信息接口返回的 `UserInfo`（模板为 `GET {VITE_API_PREFIX}/user/info`，如 `/api/user/info`）：

```ts
interface UserInfo {
  roles: string[] // 如 ['admin', 'editor']
  permissions: string[] // 如 ['user:list', 'user:create', '*:*:*']
}
```
