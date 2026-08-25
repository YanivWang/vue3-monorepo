# @vue3-monorepo/admin

PC 管理后台（Element Plus）

> **本目录是 monorepo 内的 PC 应用模板**（`pnpm run create-app` 的复制源）。**请勿在此编写业务功能**；请在仓库根执行 `pnpm run create-app` 生成业务应用后再开发，说明见 [新增业务应用](../../../docs/guide/adding-a-new-app.md)。

## Docker / Nginx（集中在仓库 `docker/`）

镜像定义与 nginx 配置不在本目录，而在仓库 **`docker/`**：

| 路径                             | 说明                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| `docker/images/admin/Dockerfile` | 多阶段构建：pnpm build `apps/pc/pc-admin-template` → nginx |
| `docker/nginx/admin.conf`        | 静态站 nginx（SPA、Gzip、安全头、`/health`）               |
| `docker/docker-compose.yaml`     | 本地起容器（默认 `8080:80`）                               |
| `scripts/docker.sh`              | 快捷：`up` / `stop` / `logs`                               |

**构建镜像**（上下文必须为仓库根）：

```bash
docker build -f docker/images/admin/Dockerfile .
```

**本地 Compose**：

```bash
pnpm run docker:admin:up
# 或
docker compose -p vue3-monorepo -f docker/docker-compose.yaml up --build -d
```

## 源码结构

```
apps/pc/pc-admin-template/
├── src/
├── mock/
├── public/
├── openapi/api.yaml                 # OpenAPI spec（配合 scripts/gen-api.ts）
├── scripts/gen-api.ts               # openapi-typescript → src/types/api-schema.d.ts
├── .env / .env.development / .env.staging / .env.production
├── .env.docker                      # compose 默认构建模式（同源 /api，nginx 反代）
├── .env.example                     # 变量清单样例
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```
