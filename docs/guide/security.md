# 安全

## 前端配置与敏感信息

- **不要**在仓库中提交带密码、内网 key、长生命周期密钥的 `.env`；`.env.example` 仅作占位。
- 以 **`VITE_` 为前缀的变量会进入浏览器 bundle**，按「公开可接受」标准填写；**秘密应放在后端**或受控的 BFF。

## 依赖

- 定期在仓库根执行 `pnpm audit`，并与团队策略对齐 **severity 阈值** 与排期修复（与 [质量门禁与脚本](./quality-gates.md) 中「与 PR 基线」配合）。
- 升 major 版本前在测试环境做回归。

## 传输与宿主机

- 生产应使用 **HTTPS**；在 nginx 样例中可启用 `Strict-Transport-Security` 等（见 `docker/nginx` 中注释与现网策略）。
- **CORS、Cookie**（`SameSite`、是否 `httpOnly`）需前后端、网关**联合设计**；本模板在 axios 与 Cookie 键名上提供约定，**不替团队做安全决策**。

## 静态资源与头

- Docker 所带 nginx 配置中为静态站点增加了 `X-Frame-Options`、`X-Content-Type-Options`、`CSP` 等常见头，部署时请按**实际内嵌、第三方脚本**情况收紧或放宽 `Content-Security-Policy`（见 `docker/nginx/*.conf`）。

## Token 与鉴权

- 刷新队列、401 重试等逻辑在 `request-*` 与拦截器中实现时，注意**并发**与**重入**；与权限体系见 [权限体系](./permission.md)。
