# 部署

## Docker 部署（推荐）

### 本地构建验证

```bash
# 构建并启动容器
docker compose up -d

# 验证健康检查
curl http://localhost/health
# 返回 ok 即正常

# 查看日志
docker compose logs -f
```

### 生产部署流程

项目已内置 `.github/workflows/deploy.yml`，推送到 `main`/`master` 分支且 CI 通过后自动执行：

1. 构建 Docker 镜像并推送到镜像仓库
2. SSH 到目标服务器，拉取镜像并重启容器

**需要在 GitHub 仓库 → Settings → Secrets 中配置：**

| Secret 名称     | 说明                                                   |
| --------------- | ------------------------------------------------------ |
| `REGISTRY_URL`  | 镜像仓库地址（如 `registry.cn-hangzhou.aliyuncs.com`） |
| `REGISTRY_USER` | 仓库用户名                                             |
| `REGISTRY_PASS` | 仓库密码                                               |
| `IMAGE_NAME`    | 镜像名（如 `my-namespace/vue3-app-template`）          |
| `SSH_HOST`      | 目标服务器 IP                                          |
| `SSH_USER`      | SSH 用户名                                             |
| `SSH_KEY`       | SSH 私钥（Base64 或 PEM 格式）                         |
| `SSH_PORT`      | SSH 端口（默认 22，可不填）                            |

## Nginx 安全响应头

`nginx.conf` 已预置以下安全头：

```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

如需调整 CSP，修改 `nginx.conf` 中的 `Content-Security-Policy` 字段，例如允许 CDN 资源：

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
| `VITE_APP_TITLE`    | 应用标题               | `vue3-app-template`       |
| `VITE_API_BASE_URL` | 后端 API 基础地址      | `https://api.example.com` |
| `VITE_API_PREFIX`   | API 路径前缀（代理用） | `/api`                    |
| `VITE_USE_MOCK`     | 是否启用 Mock          | `true/false`              |
| `VITE_ANALYZE`      | 是否开启打包分析       | `true/false`              |
