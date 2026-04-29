# 分支策略

本项目采用基于 **Git Flow 简化版**的分支策略，适合中小型团队的持续交付模式。

## 分支模型

```
main ─────────────────────────────────────────────► 生产稳定版
  │           ▲              ▲
  │     PR合并│        PR合并│
  │           │              │
develop ──────┼──────────────┼───────────────────► 集成分支
  │           │              │
  ├── feature/xxx ──────────►│  功能开发
  ├── feature/yyy ──────────►│  功能开发
  ├── fix/zzz ──────────────►│  Bug 修复
  │
main ──── hotfix/aaa ──────────────────────────────► 紧急修复
```

## 分支类型

| 分支        | 命名规范               | 说明                            | 生命周期   |
| ----------- | ---------------------- | ------------------------------- | ---------- |
| `main`      | —                      | 生产稳定代码，对应生产环境      | 永久       |
| `develop`   | —                      | 开发集成分支，对应 Staging 环境 | 永久       |
| `feature/*` | `feature/user-auth`    | 新功能开发                      | 合并后删除 |
| `fix/*`     | `fix/login-error`      | Bug 修复                        | 合并后删除 |
| `hotfix/*`  | `hotfix/payment-crash` | 生产紧急修复                    | 合并后删除 |
| `release/*` | `release/v1.2.0`       | 版本发布准备                    | 合并后删除 |
| `chore/*`   | `chore/upgrade-deps`   | 工程化、依赖、文档等            | 合并后删除 |

## 工作流程

### 日常功能开发

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. 开发、提交（遵守 Conventional Commits）
git add .
git commit -m "feat(module): add xxx feature"

# 3. 推送并发起 PR，目标分支：develop
git push origin feature/your-feature-name
# 在 GitHub 上创建 PR → develop

# 4. PR 合并后，自动触发 Staging 部署
# 5. 在 Staging 验证通过后，从 develop → main 发起 PR
```

### 发布流程

```bash
# 1. 创建 release 分支
git checkout develop
git checkout -b release/v1.2.0

# 2. 修改根目录 package.json 的 version

# 3. 合并到 main（触发生产部署）
# PR: release/v1.2.0 → main

# 4. 同步回 develop
git checkout develop
git merge main
```

### 紧急修复（Hotfix）

```bash
# 1. 从 main 创建 hotfix 分支
git checkout main
git checkout -b hotfix/critical-bug-fix

# 2. 修复问题并提交
git commit -m "fix: resolve critical xxx issue"

# 3. 同时合并到 main 和 develop
# PR 1: hotfix/xxx → main（触发生产部署）
# PR 2: hotfix/xxx → develop（保持同步）
```

## Commit 规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，由 `commitlint` 自动校验：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type 类型

| Type       | 说明                   | 示例                                         |
| ---------- | ---------------------- | -------------------------------------------- |
| `feat`     | 新功能                 | `feat(auth): add OAuth2 login`               |
| `fix`      | Bug 修复               | `fix(table): correct pagination reset`       |
| `docs`     | 文档更新               | `docs(readme): update env config`            |
| `style`    | 代码格式（不影响功能） | `style: fix eslint warnings`                 |
| `refactor` | 重构                   | `refactor(api): extract request interceptor` |
| `perf`     | 性能优化               | `perf: lazy load echarts`                    |
| `test`     | 测试相关               | `test(store): add user store unit tests`     |
| `chore`    | 工程化变更             | `chore: upgrade vite to 5.x`                 |
| `ci`       | CI/CD 配置             | `ci: add security audit step`                |
| `revert`   | 回滚提交               | `revert: feat(auth): add OAuth2 login`       |

### 破坏性变更

在 footer 中添加 `BREAKING CHANGE:` 或在 type 后加 `!`：

```
feat!: remove deprecated useTable API

BREAKING CHANGE: useTable no longer accepts the `url` option.
Use `fetchFn` instead.
```

## CI/CD

本仓库模板**不内置**持续集成/部署工作流，请在组织内按规范自行接入（如 GitHub Actions、GitLab CI 等），并与本地/团队的 `lint`、`type-check`、`test:run`、`build` 等门禁对齐。

## 分支保护规则（建议配置）

在 GitHub Repository Settings → Branches 中为 `main` 和 `develop` 配置：

- ✅ Require a pull request before merging
- ✅ Require approvals（建议 1 人以上）
- ✅ Require status checks to pass（若已接入 CI，可要求与 lint / typecheck / test 等检查一致）
- ✅ Require branches to be up to date
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches
