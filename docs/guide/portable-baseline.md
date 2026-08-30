# 可推广的工程化基线

本仓库的工程化配置里，哪些能原样搬到别的项目，哪些只是骨架、内容必须重写，哪些根本搬不了。

::: tip 给 AI agent 的使用说明
在**其它项目**里做工程化配置（新建项目、补门禁、体检现有配置）时，把这份文档当参考基线：

1. 先看第一节，那几个文件可以直接抄，抄完就走；
2. 第二节的文件只抄骨架，里面的路径、scope、分层规则**必须按目标项目重写**，照抄会得到一堆指向不存在目录的规则；
3. 第三节的东西先确认目标项目的包管理器与仓库形态，不成立就跳过，不要为了像范本而硬套；
4. 动完配置后，按第四节的要求给每道门禁写一个反例，实测它会红。

不要假设这里的数值（覆盖率阈值、`printWidth`、Node 版本）适用于目标项目——**抄机制，不抄数字**。
:::

结论先说：**推广的形式是「一份配置基线 + 一份检查清单」，不是「clone 这个仓库」。** 真正跨项目通用的只有编辑器配置、Prettier 配置和那套 TypeScript 编译开关；其余都要按新项目的分层重新写一遍。

判断依据来自对三个真实仓库的横向体检（2026-08）：本仓库、一个 Nuxt 3 应用（`gamma-project`）、一个 Vite 多页 H5（`aippt-h5-webview`）。后两个都是 yarn 1.22 + GitLab CI，与本仓库的 pnpm + GitHub Actions 组合完全不同——这正是判断「可移植性」的有效对照。

## 零、三条判断顺序

面对任意一项配置，按这个顺序判断，**不要跳级**：

1. **能借鉴就借鉴** —— 本仓库已经验证过的做法，直接用（第一、二节）。
2. **借鉴不了，按目标工程的实际情况来** —— 包管理器、仓库形态、CI 平台不同时，
   问的是「这道防线在这个项目里成不成立」，成立就用目标项目的技术栈重新实现（第三节）。
3. **但重新实现的方案必须是该技术栈的企业主流做法，不是自创。**

第 3 条是前两条的约束条件。「按实际情况来」不是自创的许可证——一个自己发明的
方案，即使当下能跑，也意味着后来的人要额外学一套只在这个仓库成立的东西，
生态升级时也没有任何人帮你踩坑。

### 怎么判断一个方案是不是主流

按这个优先级找依据，**前面的压后面的**：

1. **该技术栈的官方推荐**：框架官方文档、工具官方文档明确写的做法。
2. **主流脚手架的默认产物**：`create-vue`、Nuxt、Vite 官方模板、
   `@tsconfig/*` 这类基准配置里长什么样。
3. **工具自身的默认值**：偏离默认必须写得出理由。本仓库把 Prettier 的
   `trailingComma` / `arrowParens` 改回官方默认，就是因为原先的偏离没有理由——
   每偏离一条默认，下游就多一个「为什么和别人不一样」。
4. **生态里的成熟工具优先于自己写脚本**。只有当成熟工具确实不覆盖这个场景时
   才自己写，并在脚本文件头写明「为什么现有工具不够用」。

### 基线仓库自己的偏离，不在可抄之列

参考仓库不是标准答案，它自己也会违反第 3 条。抄之前先问：**这里为什么是自写脚本
而不是成熟工具？那个理由在我的项目里还成立吗？**

已知的一处：本仓库的 `scripts/check-audit.mjs` 是自写的依赖公告棘轮，
而 [`audit-ci`](https://github.com/IBM/audit-ci) 同样支持 pnpm（>=4.3.0），
且原生提供按公告 ID 的 allowlist、按 severity 的阈值——本脚本的语义它全覆盖。
**这一处应当改用 audit-ci，在改掉之前不要把它当可抄的范例。**
「critical 不接受豁免」用 audit-ci 的做法是跑两次：一次带 allowlist 卡 high，
一次不带 allowlist 卡 critical。

### 这些信号说明方案跑偏了

- 用自写脚本替代生态里已有的成熟工具，且说不出现有工具哪里不够
- 偏离工具默认值，理由是「我们习惯这样」
- 采用已弃用或即将移除的 API：`moduleResolution: "node"`（node10）、
  `const enum` 配 `isolatedModules`、`vitest.workspace.ts`（vitest 3 起弃用）
- 为了「像基线仓库」而硬套用不上的结构：单包项目拆四层 tsconfig、
  非 monorepo 建 workspace 校验脚本
- 门禁只在这个仓库的特殊环境下成立，换台机器或换个 CI 就跑不通

### 新工程从零开始时

没有「存量」可对齐，但顺序不变：第一节的配置直接用，第二节的骨架按新项目的
分层写，第三节按主流方案补齐。**新工程反而更该严格守第 3 条**——存量项目
偏离主流还有历史包袱当理由，新工程没有这个借口，第一天就该站在主流上。

## 一、直接抄，一个字不用改

| 文件                                      | 说明                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.editorconfig`                           | `root = true` + `[*]` 通配段 + md / Makefile 例外。**关键是用通配段而不是按扩展名列举**——列举的写法几乎一定漏掉 `json` / `yml`                             |
| `.vscode/settings.json`                   | `formatOnSave` + `detectIndentation: false` + Prettier 逐语言指定。非 Vue 项目删掉 Volar 与 `[vue]` 段即可                                                 |
| `.vscode/extensions.json`                 | 推荐 Prettier 扩展——`formatOnSave` 依赖它装上，不推荐就等于设置对一半人无效                                                                                |
| `prettier.config.mjs`                     | 已对齐 Prettier 3 官方默认（`trailingComma: 'all'`、`arrowParens: 'always'`）。唯一要各队自己定的是 `printWidth`：本仓库 120，另两个仓库 100，推广前先统一 |
| `tsconfig.base.json` 的 `compilerOptions` | 见下节。这是整套配置里最值钱、也最通用的部分                                                                                                               |

### 为什么 `detectIndentation` 必须显式关掉

`editor.detectIndentation` 缺省为 `true`，打开文件时会**按文件已有的缩进猜**，并覆盖你设的 `tabSize`。于是历史上是 4 空格的文件永远自我延续，连 `.editorconfig` 都压不住。`aippt-h5-webview` 的 `package.json` 长期是 4 空格（`.prettierrc` 写的是 2），根因就是这一项加上 `.editorconfig` 里漏了 `json`。

这两项必须**入库**。写在个人全局设置里只对一个人生效，别人照样漂。

### TypeScript 编译开关

```jsonc
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true, // 索引访问带上 undefined
  "verbatimModuleSyntax": true, // 与 isolatedModules 配套
  "isolatedModules": true,
  "esModuleInterop": true,
  "forceConsistentCasingInFileNames": true,
  "skipLibCheck": true,
  "moduleResolution": "bundler", // 打包器项目用这个，不要 node10
  "noEmit": true, // 见下
}
```

两个容易被忽略的：

- **`noEmit` 要写在配置里，不能只靠命令行 `--noEmit`。** 命令行加了、配置没写时，编辑器里的 tsserver 仍按「要输出」计算，`allowJs` 打开后源码目录里的 `.js` 既是输入也是输出目标，必然报 `TS5055`。命令行看不到、只有编辑器一直红。
- **`moduleResolution: "node"`（node10）已弃用**，TypeScript 7.0 会停止支持；`baseUrl` 同样。删掉 `baseUrl` 后 `paths` 相对 tsconfig 所在目录解析，行为不变——前提是全仓没有依赖 `baseUrl` 的非相对导入，改之前先 grep 一遍。

## 二、骨架能抄，内容必须重写

| 文件                   | 可复用                                                                                                        | 必须重写                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `eslint.config.mjs`    | flat config 骨架、插件组合顺序（`eslint-config-prettier` 放最后）、类型感知那一档的作用域写法与关闭规则的理由 | 7 条 `import-x/no-restricted-paths` zone 全是本仓库的具体路径，新项目按自己的分层重写整段 |
| `commitlint.config.ts` | `type-enum` 可照抄                                                                                            | `scope-enum` 是目录结构的镜像，必须重写                                                   |
| `.husky/pre-commit`    | 「毫秒级元数据校验 + lint-staged」这个结构                                                                    | 里面调的 `check:*` 全是本仓库专属脚本                                                     |
| `.stylelintrc.json`    | `standard` + `standard-scss` + `recess-order` + `config-html/vue` 组合、BEM 的 `selector-class-pattern`       | `overrides` 里强制 `color-no-hex` 的段落，前提是你有一套设计令牌，没有就删掉              |
| `tsconfig` 分层        | solution 根 + `base` / `web` / `pkg` / `node` 四层这个**模式**                                                | `paths`、`references` 全是项目专属。**单包项目应塌缩成 1–2 个文件**，不要为了像范本而硬拆 |

### 两个值得照搬的取舍

**用 `eslint-config-prettier`，不用 `eslint-plugin-prettier`。** 前者只关掉冲突规则，格式化交给独立的 `prettier --check`；后者把 Prettier 当 lint 规则跑，会让格式问题伪装成 lint 错误、而且慢。同理 **不要用 `stylelint-prettier`**——已经有独立 Prettier 步骤时，它只会让同一个问题被报两遍。

**类型感知 lint 的作用域收在 `src/**/\*.ts`。** 配置文件（`vite.config.ts`等）通常不在业务 tsconfig 的 include 里，纳入会报`not found by the project service`；`.vue`走`vue-eslint-parser`，类型感知开销大、噪声高，等有明确需要再单独开一档。

关掉规则时把理由写在配置里。本仓库关了三条，每条都注明了为什么是误报而不是「太吵了」——`require-await`（同步实现异步契约）、`unbound-method`（命中的是组合式函数闭包，没有 `this` 可丢）、`no-unused-vars`（已交给 tsc 的 `noUnusedLocals`，两边都开会重复报）。

## 三、搬不了的

- **`.npmrc`、`pnpm-workspace.yaml` 的 `catalog`、`allowBuilds`** —— pnpm 专属。`catalog:` 需要 pnpm 9+，`allowBuilds` 是 pnpm 11 才改的名（10 时叫 `onlyBuiltDependencies`）。yarn 1 项目一行都用不上，只能用 `resolutions` 做近似的版本锁定。
- **monorepo 专属的一切** —— workspace 引用一致性校验、测试项目清单、跨包 `paths` 联动。单包项目里没有对应概念。

## 四、比配置更重要的那件事

三个仓库的 ESLint / TypeScript / Prettier 配置都写得很完整，差距不在配置本身：

- 一个仓库的 `tsconfig` 引用了没装的类型包，`tsc` 报 `TS2688` 后**整体中止**——不是少检查几个文件，是一个都不检查。此后近一年半，那个仓库的类型检查等于不存在，而门禁一直是绿的。
- 另一个仓库有完整的 `yarn quality` 门禁脚本，但 CI 里只有构建和部署，从不调用它。它现在干净是执行得好，不是拦得住。

**所以配置只是原料，真正决定质量的是有没有东西在合并前强制执行它，以及那个东西是不是活的。** 门禁的分层落地（编辑器 → 提交钩子 → CI）与逐条的反例验证方法，见 [代码质量与规范约束](./quality-gates.md)。

要把这套基线交给 AI agent 去落地，起手 prompt 用 [落地基线的 Prompt 模板](./apply-baseline-prompt.md)。

推广时最该带走的一条经验：**给每道门禁准备一个反例，证明它真的会红。** 没做过反例验证的门禁只能算配置——最贵的洞不是报错的门禁，是失败时表现为「通过」的门禁。
