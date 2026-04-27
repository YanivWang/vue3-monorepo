# 项目与目录约定

说明在仓库里**加新功能、新页面、新接口**时，文件习惯放在哪；**不是**产品业务域文档。跨端与 `shared` 的边界以 [packages/shared/package.json](https://github.com/YanivWang/vue3-monorepo/blob/main/packages/shared/package.json) 的 `exports` 为唯一真源。

## 两个独立应用

| 应用      | 位置                        | 典型场景                           |
| --------- | --------------------------- | ---------------------------------- |
| PC 管理端 | `apps/pc/pc-admin-template` | 后台、权限菜单、Element Plus       |
| 移动端 H5 | `apps/h5/h5-template`       | 手机站、Vant、与宿主 App 的 Bridge |

路径未写全时，以各应用下的 `src/` 为根（如 `src/views` 即 `pc-admin-template/src/views`）。

## 新代码放哪？（总表）

| 你的需求                                                               | 放哪里                                                                        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 只给 **PC 后台** 用                                                    | 全部在 `apps/pc/pc-admin-template` 下相应目录                                 |
| 只给 **H5** 用                                                         | 全部在 `apps/h5/h5-template` 下相应目录                                       |
| **PC 和 H5 都要**用（类型、纯函数、与业务解耦的 hook、`request-*` 等） | `packages/shared/src`，经 `@vue3-monorepo/shared/…` 引用（与 `exports` 一致） |

## Admin（PC）常见路径

| 做什么            | 路径                                         |
| ----------------- | -------------------------------------------- |
| 新接口 / API 模块 | `apps/pc/pc-admin-template/src/api/modules/` |
| 新页面、布局      | `src/views/`；路由与菜单在 `src/router/`     |
| 新 Pinia 模块     | `src/stores/modules/`                        |

**不要**在 Admin 中 `import` H5 的 store 或业务页面。

## H5 常见路径

| 做什么        | 路径                                                          |
| ------------- | ------------------------------------------------------------- |
| 新接口 / API  | `apps/h5/h5-template/src/api/`                                |
| 新页面        | `src/views/`；路由表在 `src/router/routes.ts`（以本应用为准） |
| 新 Pinia 模块 | `src/stores/modules/`                                         |

**不要**在 H5 中 `import` Admin 的 store 或业务页面。

**Bridge 协议**：`apps/h5/h5-template/docs/bridge-protocol.md`。

## 跨端复用与 `exports`

- 源文件在 `packages/shared/src/` 按域划分；对外子路径由 `package.json#exports` 决定。
- 业务中示例：`@vue3-monorepo/shared/types`、`…/utils`、`…/request-core`（无 UI）、`…/request-pc` / `…/request-h5`、`…/bridge`（H5 与宿主通信）、`…/hooks-core` / `…/hooks-pc` / `…/hooks-h5`、`…/components-pc` / `…/components-h5`、`…/directives-pc` / `…/directives-h5`、`…/styles/tokens` 等。

更多 workspace、filter 与依赖约定见 [Monorepo 工作流](./monorepo-workflow.md)。
