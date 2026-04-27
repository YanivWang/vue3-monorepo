# 排障与 FAQ

本页是仓库**本地开发 / 安装 / 运行**时常见现象的对照表；与根 `README` 中的极简索引互链。**权威细节**以各脚本与配置文件为准，更新排障表时请同步本页。

| 现象 / 提示                                                                        | 可尝试处理                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `The engine "node" is incompatible` 或运行期与 Vite/TS 行为异常                    | 使用 **Node `>=20.19.5`**（以根 `package.json` 的 `engines` 为准）。可用 [nvm](https://github.com/nvm-sh/nvm)、[fnm](https://github.com/Schniz/fnm) 等切换版本后重新 `pnpm install`。                                                            |
| 执行 `npm install` / `yarn` 时提示 **only-allow pnpm**                             | 本仓**仅支持 pnpm**，请在仓库根目录执行 `pnpm install`，勿混用其他包管理器。                                                                                                                                                                     |
| `pnpm: command not found` 或 pnpm 版本低于 `engines`                               | 安装/升级 pnpm 至要求版本；Node 16.13+ 可 `corepack enable` 后按根目录 `packageManager` 与 `package.json#engines` 对齐。                                                                                                                         |
| 开发服启动报 **端口已被占用**（`EADDRINUSE`，常见 **5173** / **5174** / **5175**） | 结束占用端口的进程，或调整各应用 Vite 的 `server.port` / CLI `--port`；并行 `pnpm run dev` 时避免多实例抢同一端口。                                                                                                                              |
| 依赖解析异常、安装后仍报错、怀疑本地装坏                                           | 在仓库根执行 `pnpm run clean:install`（会删**根目录与各 workspace 包**下 `node_modules` 后重装；`pnpm run clean:install -- -y` 跳过确认）。亦可手动删各层 `node_modules` 再 `pnpm install`；**勿随意删改 `pnpm-lock.yaml`** 除非与团队流程一致。 |
| `git commit` 不跑 lint / commitlint，或刚 clone 后无 `.husky`                      | 在根目录执行 `pnpm install` 以触发 `prepare` 安装 Husky；仍异常可检查 `core.hooksPath` 是否被全局 Git 配置覆盖。                                                                                                                                 |
| **Docker** 相关容器起不来、页面空白、接口不通                                      | 见 [部署说明](./deploy.md) 与仓库 `docker/docker-compose.yaml`、根脚本 `docker:*`；用 `pnpm run docker:logs` 或 `docker compose ... logs` 看服务日志。                                                                                           |

更多脚本对照与发版前校验见 [质量门禁与脚本](./quality-gates.md)。环境变量与接口地址问题见 [环境变量说明](./environment-variables.md)。
