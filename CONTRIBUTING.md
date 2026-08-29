# 贡献指南

感谢你对本项目的关注！欢迎通过 Issue 或 Pull Request 参与贡献。

## 完整文档

新人上手、文档分层与 Monorepo 工作流见 VitePress 包：**[docs/guide/doc-system.md](docs/guide/doc-system.md)**（同目录下还有 `onboarding.md`、`monorepo-introduce.md`、`monorepo-workflow.md`、`quality-gates.md` 等）。根 `README` 是速查，细节以该文档站为准；本地可执行 `pnpm run docs:dev` 带导航阅读。

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/YanivWang/vue3-monorepo.git
cd vue3-monorepo

# 安装依赖（Node ≥20.19.5、pnpm ≥10.17.0，与根 package.json engines 一致）
pnpm install

# 仅开发某一端时推荐（全并行可改用：pnpm dev）
pnpm run admin:dev
# 或: pnpm run h5:dev  /  pnpm run docs:dev
```

## 分支规范

| 分支              | 说明                             |
| ----------------- | -------------------------------- |
| `main` / `master` | 生产主干，保护分支，禁止直接推送 |
| `develop`         | 集成分支，功能开发完成后合并到此 |
| `feature/xxx`     | 功能开发分支                     |
| `fix/xxx`         | Bug 修复分支                     |
| `hotfix/xxx`      | 从 `main` 切出的生产紧急修复     |
| `release/xxx`     | 版本发布准备                     |
| `docs/xxx`        | 文档更新分支                     |
| `chore/xxx`       | 构建/依赖/配置等杂项             |

分支模型全貌与 hotfix / release 的合并流程见文档站 [分支策略](docs/guide/branch-strategy.md)。

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范，提交信息格式：

```
<type>(<scope>): <subject>

[可选 body]

[可选 footer]
```

**type 类型：**

| type       | 说明                             |
| ---------- | -------------------------------- |
| `feat`     | 新功能                           |
| `fix`      | Bug 修复                         |
| `docs`     | 文档变更                         |
| `style`    | 代码格式（不影响功能）           |
| `refactor` | 重构（非 feat/fix）              |
| `perf`     | 性能优化                         |
| `test`     | 测试相关                         |
| `build`    | 构建系统或依赖变更               |
| `ci`       | CI/CD 相关                       |
| `chore`    | 其他杂项（不改 src / test）      |
| `revert`   | 回滚提交                         |
| `wip`      | 进行中（临时提交，不建议进主干） |

**示例：**

```bash
git commit -m "feat(user): 新增用户头像上传功能"
git commit -m "fix(http): 修复并发请求时 token 刷新死循环"
git commit -m "docs: 更新 ProTable 组件文档"
```

`scope` 也有白名单（`admin`、`h5`、`docs`、`shared`、`js-bridge`、`request-pc` 等），完整清单与说明见根目录 `commitlint.config.ts` 的 `scope-enum`。

> Husky 已配置 `commit-msg` 钩子（commitlint）与 `pre-commit` 钩子（`check:refs` → `check:request-core` → `check:workspace` → `lint-staged`），不符合规范的提交会被拒绝。

## Pull Request 流程

1. 从 `develop` 切出特性分支：`git checkout -b feature/my-feature`
2. 完成开发并确保以下命令全部通过：
   ```bash
   pnpm lint
   pnpm lint:style
   pnpm type-check
   pnpm test:run
   pnpm build
   ```
   大改共享包或发版前，可直接跑一次 `pnpm run verify:full`（在上述基础上还含 `check:refs`、`check:request-core`、`check:workspace`、`check:theme`、`prettier --check .` 与覆盖率阈值）——这与 CI 跑的是同一条命令。
3. 推送分支并创建 PR，目标分支为 `develop`
4. PR 描述中说明变更内容、影响范围、测试方式
5. CI（`.github/workflows/ci.yml`，在 PR 上跑 `verify:full`）通过后，Code Review 完成后合并

## 代码规范

- **TypeScript**：以根 `eslint.config.mjs` + TS 编译选项为准（`strict` 等）；不推荐滥用 `any`，具体禁则以当前 ESLint 配置为准。
- **Vue**：使用 `<script setup>` 语法，Props 使用 `defineProps<T>()` 泛型方式
- **样式**：使用 SCSS，颜色/间距优先使用 CSS 变量（支持暗黑模式）
- **命名**：组件 PascalCase，composable `useXxx`，工具函数 camelCase

## 文档更新

组件/功能变更时，请同步更新 `docs/` 对应文档页。

启动文档预览：

```bash
pnpm run docs:dev
```
