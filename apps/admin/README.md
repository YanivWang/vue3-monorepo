# @vue3-mono/admin

PC 管理后台（Element Plus）

## Docker / Nginx（与 deer-flow-vue3 一致：集中在 `docker/`）

镜像定义与 nginx 配置不在本目录，而在仓库 **`docker/`**：

| 路径                             | 说明                                         |
| -------------------------------- | -------------------------------------------- |
| `docker/images/admin/Dockerfile` | 多阶段构建：pnpm build `apps/admin` → nginx  |
| `docker/nginx/admin.conf`        | 静态站 nginx（SPA、Gzip、安全头、`/health`） |
| `docker/docker-compose.yaml`     | 本地起容器（默认 `8080:80`）                 |
| `scripts/docker.sh`              | 快捷：`up` / `stop` / `logs`                 |

**构建镜像**（上下文必须为仓库根）：

```bash
docker build -f docker/images/admin/Dockerfile .
```

**本地 Compose**：

```bash
pnpm run docker:admin:up
# 或
docker compose -p vue3-mono -f docker/docker-compose.yaml up --build -d
```

## 源码结构

```
apps/admin/
├── src/
├── mock/
├── public/
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```
