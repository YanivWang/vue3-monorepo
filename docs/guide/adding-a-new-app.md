# 脚手架一键新增业务应用

本页说明在 **pnpm workspace（Monorepo）** 内**再开一条前端应用**（第二个 PC 管理台、第二个 H5 等，`PC`/`H5` **无优先级**）时，需要动哪些文件、以及容易踩坑的地方。与 [pnpm workspace 日常操作](./monorepo-workflow.md)、[项目与目录约定](./project-conventions.md) 互补：这里偏**拉新包与工程接线**，不重复业务目录说明。

## 业务应用从哪里来

`pc-admin-template` / `h5-template` **不是**日常业务承载目录，而是 **`create-app` 的复制蓝本**。**首个或后续** PC / H5 业务工程均应通过仓库根 `pnpm run create-app` 生成（手工流程也应与生成器产物对齐）。页面、路由、接口模块等**一律**在生成目录中开发，避免污染模板。规范摘要另见 [项目与目录约定](./project-conventions.md)（文首必读框）。

## 推荐：一键生成（`create-app`）

在仓库根执行：

```bash
pnpm run create-app
```

按提示选择 **H5** 或 **PC Admin**、目录名、包名、根脚本前缀、Vite 开发端口等。脚本会（见 `scripts/create-app.mjs`）：

1. 从 `h5-template` / `pc-admin-template` 复制目录（跳过 `node_modules`、`dist`、`coverage`、`.git`、`.turbo`）；
2. 改新包 `package.json` 的 `name` / `description`，替换 `vite.config.ts` 里的 `server.port`，并把 README 中的模板路径与标题换成新应用；
3. 在根 `package.json` 追加 `<前缀>:dev`、`<前缀>:build`、`<前缀>:typecheck`、`<前缀>:test`（两种模板都带 `test` 脚本，故对称生成）；
4. 在根 `tsconfig.json` 的 `references` 中插入应用与其 `tsconfig.node.json` 两条（插在 `{ "path": "./docs" }` 之前）；
5. 在根 `vitest.config.ts` 的 `test.projects` 数组首位插入新应用目录（vitest 3 起该清单取代了已弃用的 `vitest.workspace.ts`）。

脚本**不会**改的：`pnpm-workspace.yaml`（`apps/pc/*`、`apps/h5/*` 已通配）、`commitlint.config.ts` 的 `scope-enum`、`docker/` 与 CI。

**非交互**（CI 或脚本）可一次传齐参数，例如：

```bash
pnpm run create-app -- --type h5 --dir h5-marketing --name @vue3-monorepo/h5-marketing --prefix h5-marketing --port 5176
```

加 `--append-build` 可将新应用的 `build` 插入根 `build` 链（在 `docs:build` 之前）。更多参数见：`pnpm run create-app -- --help`。

生成结束后**必须先**在仓库根执行 `pnpm install`，以注册新 workspace 与依赖，再跑 `pnpm run check:refs` 与 `pnpm --filter <新包名> typecheck`。

以下为**手工**步骤说明，便于对照或定制；与生成器行为一致处不再重复。

## 1. 先定类型：放在 `apps/h5` 还是 `apps/pc`

| 端            | 物理目录                | 包内应使用的 shared 子域                                                                                                                                                                              | UI 与典型能力                                 |
| ------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **PC 管理端** | `apps/pc/<你的目录名>/` | **`@vue3-monorepo/shared/request-pc`**、**`@vue3-monorepo/shared/hooks-pc`**、**`@vue3-monorepo/shared/components-pc`**、**`@vue3-monorepo/shared/directives-pc`** 等                                 | Element Plus、动态菜单/权限（若以模板为起点） |
| **H5 移动端** | `apps/h5/<你的目录名>/` | **`@vue3-monorepo/shared/request-h5`**、**`@vue3-monorepo/shared/hooks-h5`**、**`@vue3-monorepo/shared/components-h5`**、**`@vue3-monorepo/shared/directives-h5`**、**`@vue3-monorepo/js-bridge`** 等 | Vant、PostCSS 移动端稿、`Bridge` 与宿主联调   |

**不要**把两个真实业务端混进同一个 Vite 工程目录；**不要**在 H5 应用里直接 import 另一个 Admin 应用的 store/页面，反之亦然。跨端只走 `@vue3-monorepo/shared` 的 **exports** 已导出路径，规则见 [项目与目录约定](./project-conventions.md)。

---

## 2. 推荐操作顺序（检查清单）

### 2.1 复制模板

1. 在对应父目录下**新建文件夹**并复制现成模板：
   - 新 **Admin**：以 `apps/pc/pc-admin-template` 为蓝本。
   - 新 **H5**：以 `apps/h5/h5-template` 为蓝本。
2. 修改新目录内 **`package.json`**：
   - **`name`**：必须是全 workspace **唯一** 的 npm 包名。建议继续沿用本仓前缀，例如 `@vue3-monorepo/admin-ops`、`@vue3-monorepo/h5-marketing`（具体命名以团队规范为准）。
   - **`description`**、如有 **首页/README** 中的标题与路径说明一并更新。

`pnpm-workspace.yaml` 已用 `apps/pc/*`、`apps/h5/*` 通配，**一般不必**在 yaml 里为每个新应用再写一行（只要目录在对应 glob 下且含 `package.json` 即会被识别）。

### 2.2 根目录 `package.json` 根脚本

在仓库根 `package.json` 的 `scripts` 中为新包增加**便捷别名**（与现有 `admin:*`、`h5:*` 并列），例如：

- `新应用:dev` → `pnpm --filter <新包名> dev`
- `新应用:build` / `新应用:typecheck` / `新应用:test` 等同理。

若全仓**一键 build** 也要包含新应用，请把根脚本的 `build` 中的串联顺序**接上**新应用的 `build`（当前模板为 `admin:build` → `h5:build` → `docs:build`，按团队发布策略扩展）。

`pnpm run dev`（根）会对**所有**定义了 `dev` 的 workspace 包**并行**执行，新应用一旦加上 `dev`，会多占一份终端与端口资源；本地开发可只用 `pnpm run 新应用:dev` 单开。

### 2.3 TypeScript 工程引用

在**根** `tsconfig.json` 的 `references` 中为新应用补全条目（与现有 `pc-admin-template`、`h5-template` 相同结构），通常各应用有：

- 应用本身的 `tsconfig` 工程（如 `"./apps/pc/你的目录"`）；
- 该应用下的 `tsconfig.node.json`（若存在，用于 Vite/Node 配置）。

新应用内若仍继承 `tsconfig.base.json` 的路径与 `strict` 规则，与现有 app **保持一致**即可。

### 2.4 `pnpm run check:refs`

`scripts/check-refs.js` 会枚举 `pnpm-workspace.yaml` 下的 workspace，并校验包名唯一、`tsconfig.base.json` paths、根 `tsconfig.json` references、`workspace:*` 依赖可解析等；**不再**使用「固定 workspace 个数」类魔法数字，新增应用后只要目录与配置正确即可通过。

### 2.5 Vitest（若新应用要进根 `pnpm test`）

根 `vitest.config.ts` 的 `test.projects` 是一份**显式清单**（vitest 3 起取代已弃用的 `vitest.workspace.ts`）。新应用有单元测试却不在清单里，`pnpm test` **根本不会发现**它的用例，且不报任何错——所以 `pnpm run check:workspace` 会把「有测试文件但没进 `test.projects`」判为失败。

若新应用**暂无**测试工程，可暂缓；与 [代码质量与规范约束](./quality-gates.md) 中说明一致。

> 覆盖率阈值只配在**根** `vitest.config.ts`。别在新应用的 `vitest.config.ts` 里写 `thresholds`：项目级 coverage 配置在 `test.projects` 下不生效，写了也没人执行。

### 2.6 开发服务器端口

避免与现网冲突。当前约定性端口（见 [新手上路](./onboarding.md) 或各应用 `vite.config.ts`）为：

- PC Admin 模板默认 **5173**
- H5 模板默认 **5174**
- 文档站 VitePress **5175**

新应用请在新目录的 `vite.config.ts` 里把 `server.port` 设为**未占用**的端口（例如 5176 起递增），并在团队文档或本页下游维护一份「谁占哪端口」以免并行开发冲突。

### 2.7 根级 ESLint / Stylelint / Prettier

本仓根 `eslint`、stylelint 的 glob 通常已覆盖 `apps/**`；新应用加好后在根执行 `pnpm run lint` / `pnpm run lint:style` 做验证。若新应用有**非常规**目录名或需要单独 `ignore`，再改根 ESLint/忽略配置，**小步**修改即可。

### 2.8 环境变量

为新应用从模板复制 **`.env.example`**（及 `.env.development` 等若使用），并更新 [环境变量](./environment-variables.md) 或应用内 README 中指向的路径说明。不同应用的 `VITE_` 前缀与后端联调地址不要混用。

### 2.9 Docker 与发布（可选）

若需要**独立容器**部署：

- 参考 `docker/images/admin/Dockerfile`、`docker/images/h5/Dockerfile` 新增或参数化一条构建线；
- 在 `docker/docker-compose.yaml` 中**新增 service**，并在根 `package.json` 中按需增加 `docker:xxx` 包装脚本（与现有 `docker:admin:*` / `docker:h5:*` 类似）。

不打算容器化时，可跳过，但**不要**在 compose 里留下无法构建的半套配置。

### 2.10 Commit scope（`commitlint`）

`commitlint.config.ts` 里 **application 级 scope** 目前固定为 `admin` / `h5` / `docs` 等。若你新增的是「第二个」H5 或 Admin **独立应用**，在约定提交信息时，可与团队二选一：

- 仍用广义的 `h5` / `admin` 表示「整个该端某次改动」，在 subject 里写清子应用名；或
- 扩展 `scope-enum` 增加专用 scope（例如 `h5-ops`），并跑一遍提交规范确认。

**不要**在未改配置的情况下使用不存在的 scope，会导致 commitlint 失败。

---

## 3. 与 `shared` 的接线要点

- 在**新应用**的 `package.json` 的 `dependencies` 中加入：  
  `"@vue3-monorepo/shared": "workspace:*"`（与现有一致）。
- 业务 import **仅**使用 `packages/shared/package.json` 里 **`exports`** 已列出的子路径；新增对外 API 时改 shared 的 `exports` 并做类型与构建验证。
- **`@vue3-monorepo/request-core`** 内**禁止**出现 UI 框架 API；PC/H5 的提示、Loading 等通过 **`@vue3-monorepo/shared/request-pc`** / **`@vue3-monorepo/shared/request-h5`** 在应用层装配。详见 [pnpm workspace 日常操作 — 第 5 节](./monorepo-workflow.md#5-新代码放哪决策简表) 与 `scripts/check-request-core.js`。

---

## 4. 新应用上线前自检

| 检查项                             | 说明                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `pnpm install`                     | 在**仓库根**执行，确认 lockfile 与 workspace 解析正常    |
| `pnpm run check:refs`              | name 唯一、`tsconfig` paths/references、`workspace:*` 等 |
| `pnpm run typecheck`               | 全仓或至少 `--filter` 新包                               |
| `pnpm run lint` / `lint:style`     | 新代码风格                                               |
| `pnpm run build`（或单包 `build`） | 生产构建可过                                             |
| 端口与 `pnpm run dev`              | 多应用同时开 dev 不冲突                                  |
| 文档与 `.env.example`              | 新同事能按说明启动                                       |

更全的门禁说明见 [代码质量与规范约束](./quality-gates.md)。

---

## 5. 小结

| 要做什么                                                                    | 必做 / 常做       |
| --------------------------------------------------------------------------- | ----------------- |
| `pnpm run create-app`（推荐）；或手工复制模板并接线、改 `package.json#name` | 业务应用必做      |
| 根 `package.json` 根脚本、（可选）`build` 串联                              | 必做 / 看发布策略 |
| 根 `tsconfig.json` references                                               | 必做              |
| `pnpm run check:refs`（会校验新包已挂进根 `references`）                    | 必做              |
| 根 `vitest.config.ts` 的 `test.projects`                                    | 有单测时做        |
| `vite` 开发端口与文档/团队约定                                              | 必做              |
| Docker / CI                                                                 | 按需              |
| `commitlint` scope                                                          | 与团队统一        |

在同一业务应用内加页面、加路由，在**该应用的 workspace 目录**（`create-app` 产物）下进行，约定见 [项目与目录约定](./project-conventions.md)。**不要**在 `pc-admin-template` / `h5-template` 内堆业务代码。
