# 部署

## Docker 部署（推荐）

### 本地构建验证

```bash
# 构建并启动 Admin 容器（默认 http://localhost:8080）
pnpm run docker:admin:up
# 或：docker compose -p vue3-mono -f docker/docker-compose.yaml up --build -d

# 验证健康检查
curl http://localhost:8080/health
# 返回 ok 即正常

# 查看日志
pnpm run docker:admin:logs
```

### 生产部署流程

本模板**不自带** GitHub Actions 工作流，请在自有 CI/CD（GitHub Actions、GitLab CI、Jenkins 等）中编排，典型步骤为：

1. 在构建机执行 `pnpm install` 与 `pnpm run build`（或分别构建需发布的镜像/产物）
2. 构建 Docker 镜像并推送到镜像仓库
3. SSH 或 K8s 等到目标环境拉取镜像并重启

若使用 GitHub Actions 做镜像构建与 SSH 发布，一般需在仓库 **Settings → Secrets and variables** 中配置 registry 与 SSH 等凭据（名称依流水线而定）。

## Nginx 安全响应头

Admin 镜像内使用的 nginx 配置为 **`docker/nginx/admin.conf`**。已预置以下安全头：

```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

如需调整 CSP，修改 **`docker/nginx/admin.conf`** 中的 `Content-Security-Policy` 字段，例如允许 CDN 资源：

```nginx
Content-Security-Policy:
  "default-src 'self';
   script-src  'self' https://cdn.example.com;
   connect-src 'self' https://api.example.com;"
```

## 静态部署（OSS/CDN）

```bash
# 构建产物
pnpm build

# 将 dist/ 目录上传到 OSS/CDN
# 服务器需要配置 index.html fallback 处理 SPA 路由
```

## 环境变量

| 变量                | 说明                   | 示例                      |
| ------------------- | ---------------------- | ------------------------- |
| `VITE_APP_TITLE`    | 应用标题               | `vue3-monorepo-template`  |
| `VITE_API_BASE_URL` | 后端 API 基础地址      | `https://api.example.com` |
| `VITE_API_PREFIX`   | API 路径前缀（代理用） | `/api`                    |
| `VITE_USE_MOCK`     | 是否启用 Mock          | `true/false`              |
| `VITE_ANALYZE`      | 是否开启打包分析       | `true/false`              |
