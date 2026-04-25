# 贡献指南

感谢你对本项目的关注！欢迎通过 Issue 或 Pull Request 参与贡献。

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-org/vue3-monorepo-template.git
cd vue3-monorepo-template

# 安装依赖（需要 pnpm >= 10）
pnpm install

# 启动开发服务器
pnpm dev
```

## 分支规范

| 分支              | 说明                             |
| ----------------- | -------------------------------- |
| `main` / `master` | 生产主干，保护分支，禁止直接推送 |
| `develop`         | 集成分支，功能开发完成后合并到此 |
| `feature/xxx`     | 功能开发分支                     |
| `fix/xxx`         | Bug 修复分支                     |
| `docs/xxx`        | 文档更新分支                     |
| `chore/xxx`       | 构建/依赖/配置等杂项             |

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范，提交信息格式：

```
<type>(<scope>): <subject>

[可选 body]

[可选 footer]
```

**type 类型：**

| type       | 说明                   |
| ---------- | ---------------------- |
| `feat`     | 新功能                 |
| `fix`      | Bug 修复               |
| `docs`     | 文档变更               |
| `style`    | 代码格式（不影响功能） |
| `refactor` | 重构（非 feat/fix）    |
| `perf`     | 性能优化               |
| `test`     | 测试相关               |
| `chore`    | 构建/依赖/工具配置     |
| `ci`       | CI/CD 相关             |
| `wip`      | 进行中（临时提交）     |

**示例：**

```bash
git commit -m "feat(user): 新增用户头像上传功能"
git commit -m "fix(http): 修复并发请求时 token 刷新死循环"
git commit -m "docs: 更新 ProTable 组件文档"
```

> Husky 已配置 `commit-msg` 钩子，不符合规范的提交会被拒绝。

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
3. 推送分支并创建 PR，目标分支为 `develop`
4. PR 描述中说明变更内容、影响范围、测试方式
5. 等待 CI 通过，Code Review 完成后合并

## 代码规范

- **TypeScript**：严格模式，禁止 `any`（eslint `@typescript-eslint/no-explicit-any`）
- **Vue**：使用 `<script setup>` 语法，Props 使用 `defineProps<T>()` 泛型方式
- **样式**：使用 SCSS，颜色/间距优先使用 CSS 变量（支持暗黑模式）
- **命名**：组件 PascalCase，composable `useXxx`，工具函数 camelCase

## 文档更新

组件/功能变更时，请同步更新 `docs/` 对应文档页。

启动文档预览：

```bash
pnpm docs:dev
```
