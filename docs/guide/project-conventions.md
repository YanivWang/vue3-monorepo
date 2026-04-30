# 项目与目录约定

说明在仓库里**加新功能、新页面、新接口**时，文件习惯放在哪；**不是**产品业务域文档。跨端与 `shared` 的边界以 [packages/shared/package.json](https://github.com/YanivWang/vue3-monorepo/blob/main/packages/shared/package.json) 的 `exports` 为唯一真源。

> **Monorepo 优先**：仓库以 **pnpm workspace** 组织多包；**PC 与 H5** 为两条**并列**的应用线，目录与「只给某端 / 两端共享」的约定**对称**，无主从之分。

> **模板与业务分离（必读）**  
> `apps/pc/pc-admin-template` 与 `apps/h5/h5-template` **只是应用模板**，供 `pnpm run create-app` 复制，并作为下文路径示例的参照。**真实业务代码不要写在上述模板目录内**；应通过 `create-app` 在 `apps/pc/<你的应用>/` 或 `apps/h5/<你的应用>/` 生成业务工程后，在该目录的 `src/` 下开发。对模板的改动应限于升级脚手架能力（宜与业务 PR 分开）。根脚本 `admin:*` / `h5:*` 对应模板包，用于开箱演示与门禁；日常业务请使用生成应用的 **`前缀:*`** 或 `pnpm --filter <包名>`。详见 [脚手架一键新增业务应用](./adding-a-new-app.md)。

## 默认两条模板应用（仅脚手架源）

| 应用      | 位置（模板源）              | 典型能力（复制后继承）             |
| --------- | --------------------------- | ---------------------------------- |
| PC 管理端 | `apps/pc/pc-admin-template` | 后台、权限菜单、Element Plus       |
| 移动端 H5 | `apps/h5/h5-template`       | 手机站、Vant、与宿主 App 的 Bridge |

在仓库内**新增业务应用**时，根目录执行 `pnpm run create-app`，说明见 [脚手架一键新增业务应用](./adding-a-new-app.md)。生成目录与上表**并列**于 `apps/pc/*`、`apps/h5/*`，仍通过 `@vue3-monorepo/shared` 复用能力。

路径未写全时，以**当前正在开发的业务应用**（`pnpm --filter` 指向的包）下 `src/` 为根。

## 新代码放哪？（总表）

| 你的需求                                                               | 放哪里                                                                        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 只给 **PC 后台** 用                                                    | `apps/pc/<你的应用>/` 下相应目录（由 `create-app` 生成的工程）                |
| 只给 **H5** 用                                                         | `apps/h5/<你的应用>/` 下相应目录（由 `create-app` 生成的工程）                |
| **PC 和 H5 都要**用（类型、纯函数、与业务解耦的 hook、`request-*` 等） | `packages/shared/src`，经 `@vue3-monorepo/shared/…` 引用（与 `exports` 一致） |

## Admin（PC）常见路径

以下以 `apps/pc/<app>/` 表示你的 PC 业务应用根目录（与 `pc-admin-template` **目录结构相同**，仅路径替换）。

| 做什么            | 路径                                                   |
| ----------------- | ------------------------------------------------------ |
| 新接口 / API 模块 | `apps/pc/<app>/src/api/modules/`                       |
| 新页面、布局      | `src/views/`；路由与菜单在 `src/router/`（相对应用根） |
| 新 Pinia 模块     | `src/stores/modules/`（相对应用根）                    |

**不要**在 Admin 中 `import` H5 的 store 或业务页面。

## H5 常见路径

以下以 `apps/h5/<app>/` 表示你的 H5 业务应用根目录（与 `h5-template` **目录结构相同**）。

| 做什么        | 路径                                                          |
| ------------- | ------------------------------------------------------------- |
| 新接口 / API  | `apps/h5/<app>/src/api/`                                      |
| 新页面        | `src/views/`；路由表在 `src/router/routes.ts`（以本应用为准） |
| 新 Pinia 模块 | `src/stores/modules/`                                         |

**不要**在 H5 中 `import` Admin 的 store 或业务页面。

**Bridge 协议**：业务应用内为 `docs/bridge-protocol.md`（与模板同结构）；仓库内模板源文件见 `apps/h5/h5-template/docs/bridge-protocol.md`。

## 跨端复用与 `exports`

- 源文件在 `packages/shared/src/` 按域划分；对外子路径由 `package.json#exports` 决定。
- 业务中示例：`@vue3-monorepo/shared/types`、`@vue3-monorepo/shared/utils`、`@vue3-monorepo/request-core`（无 UI）、`@vue3-monorepo/shared/request-pc` / `@vue3-monorepo/shared/request-h5`、`@vue3-monorepo/js-bridge`（H5 与宿主通信）、`@vue3-monorepo/shared/hooks-core` / `@vue3-monorepo/shared/hooks-pc` / `@vue3-monorepo/shared/hooks-h5`、`@vue3-monorepo/shared/components-pc` / `@vue3-monorepo/shared/components-h5`、`@vue3-monorepo/shared/directives-pc` / `@vue3-monorepo/shared/directives-h5`、`@vue3-monorepo/shared/styles/tokens` 等。

更多 workspace、filter 与依赖约定见 [pnpm workspace 日常操作](./monorepo-workflow.md)。
