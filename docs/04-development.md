# 开发文档

## 项目概况

| 项目 | 值 |
|---|---|
| 名称 | Claude Code CLI |
| 语言 | TypeScript (strict) |
| 运行时 | Bun |
| UI 框架 | React + Ink（终端 UI） |
| CLI 解析 | Commander.js |
| 验证库 | Zod v4 |
| 包管理 | npm / bun |
| 源文件数 | ~1900 |
| 代码行数 | 512,000+ |

## 目录结构

```
claude-code-bun/
├── src/                        # 源代码
│   ├── main.tsx                # 入口：CLI 参数解析 + React/Ink 启动
│   ├── commands.ts             # 命令注册
│   ├── tools.ts                # 工具注册
│   ├── Tool.ts                 # 工具基础类型
│   ├── QueryEngine.ts          # LLM 请求引擎（核心）
│   ├── context.ts              # 系统/用户上下文
│   │
│   ├── commands/               # Slash 命令实现（/commit, /review, ...）
│   ├── tools/                  # Agent 工具实现（Bash, Read, Write, ...）
│   ├── components/             # Ink UI 组件
│   ├── hooks/                  # React Hooks
│   ├── services/               # 外部服务集成
│   │   ├── api/                #   Anthropic API 客户端
│   │   ├── mcp/                #   MCP 服务管理
│   │   ├── oauth/              #   OAuth 认证
│   │   ├── lsp/                #   LSP 集成
│   │   ├── analytics/          #   GrowthBook 特性开关
│   │   └── compact/            #   上下文压缩
│   ├── bridge/                 # IDE 集成桥接
│   ├── coordinator/            # 多 Agent 协调
│   ├── plugins/                # 插件系统
│   ├── skills/                 # 技能系统
│   ├── types/                  # 类型定义
│   ├── utils/                  # 工具函数
│   │   ├── model/              #   模型选择与配置
│   │   ├── settings/           #   配置加载
│   │   ├── permissions/        #   权限管理
│   │   └── secureStorage/      #   安全存储（Keychain）
│   ├── ink/                    # Ink 渲染器包装
│   ├── schemas/                # Zod 配置 Schema
│   ├── state/                  # 状态管理
│   ├── keybindings/            # 键绑定
│   ├── vim/                    # Vim 模式
│   ├── voice/                  # 语音输入
│   ├── remote/                 # 远程会话
│   ├── tasks/                  # 任务管理
│   └── native-ts/              # 纯 TS 实现的原生模块替代
│       ├── yoga-layout/        #   Yoga 布局引擎（纯 TS 版）
│       ├── color-diff/         #   颜色差异计算
│       └── file-index/         #   文件索引
│
├── scripts/                    # 构建脚本
│   ├── build.ts                # 打包脚本
│   └── create-stubs.ts         # 缺失文件存根生成
│
├── docs/                       # 文档
├── dist/                       # 构建产物
├── package.json                # 依赖声明
├── tsconfig.json               # TypeScript 配置
└── .env.example                # 环境变量模板
```

## 核心架构

### 请求流程

```
用户输入
  ↓
main.tsx (Commander.js 解析)
  ↓
launchRepl() → React/Ink 渲染循环
  ↓
QueryEngine.ts → Anthropic API 调用
  ↓
Tool Loop (工具调用循环)
  ├── BashTool → 执行 Shell 命令
  ├── FileReadTool → 读取文件
  ├── FileEditTool → 编辑文件
  ├── GrepTool → ripgrep 搜索
  ├── AgentTool → 子 Agent 派生
  └── ... (40+ 工具)
  ↓
流式响应 → Ink 渲染到终端
```

### 关键文件

| 文件 | 行数 | 职责 |
|---|---|---|
| `QueryEngine.ts` | ~46K | LLM API 调用、流式响应、重试、Token 计数 |
| `Tool.ts` | ~29K | 工具基础类型、输入 Schema、权限模型 |
| `commands.ts` | ~25K | 命令注册与执行、条件导入 |
| `main.tsx` | ~4K | CLI 入口、参数解析、并行预取 |

### 设计模式

**1. 并行预取（Startup Optimization）**

```typescript
// main.tsx — 在其他 import 之前以副作用形式启动
startMdmRawRead()       // MDM 设置子进程
startKeychainPrefetch() // macOS Keychain 并行读取
```

**2. 条件导入（Dead Code Elimination）**

```typescript
import { feature } from 'bun:bundle'

const voiceModule = feature('VOICE_MODE')
  ? require('./voice/index.js')
  : null
```

**3. 懒加载（Lazy Loading）**

```typescript
// 重量级模块（OpenTelemetry ~400KB, gRPC ~700KB）延迟加载
const otel = await import('@opentelemetry/sdk-trace-base')
```

**4. 纯 TS 原生替代**

`src/native-ts/yoga-layout/` 是 Yoga 布局引擎的纯 TypeScript 移植，替代了 C++ 原生依赖，覆盖 Ink 使用的 Flexbox 子集。

## 逆向工程笔记

### 源码来源

源码泄露自 npm 包的 `.map` 文件（v2.1.88）。仅包含 `src/` 目录，缺失：

- `package.json` / `tsconfig.json` / 构建脚本
- 部分源文件（类型定义、实验性功能模块）
- vendor 资源（ripgrep 二进制）
- .wasm 资源（tree-sitter、resvg）

### 已补全的文件

#### 构建配置（逆向还原）

| 文件 | 还原方式 |
|---|---|
| `package.json` | 扫描所有 import 语句 + 参考已安装包 |
| `tsconfig.json` | 分析代码特征（JSX、路径别名、模块格式） |
| `scripts/build.ts` | 分析 `bun:bundle` 用法 + MACRO 宏 + 参考产物格式 |
| `src/types/bun-bundle.d.ts` | 为 `bun:bundle` 模块提供类型声明 |
| `src/types/globals.d.ts` | 为 `MACRO` 全局变量提供类型声明 |

#### 缺失源文件存根（59 个）

存根文件通过 `scripts/create-stubs.ts` 批量生成。关键缺失：

| 文件 | 引用数 | 重要性 |
|---|---|---|
| `src/types/message.ts` | 141 | **核心消息类型** — 所有消息的 union type |
| `src/types/tools.ts` | 17 | 工具进度类型 |
| `src/keybindings/types.ts` | 14 | 键绑定类型 |
| `src/constants/querySource.ts` | 16 | 查询来源枚举 |
| `src/tools/TungstenTool/` | - | 实验性工具（完全缺失） |
| `src/tools/REPLTool/` | - | REPL 工具（完全缺失） |
| `src/tools/VerifyPlanExecutionTool/` | - | 计划验证工具（完全缺失） |

完整列表见 `scripts/create-stubs.ts`。

### 逆向方法论

1. **依赖发现**：`grep -r "from ['\"]" src/` 提取所有 import，分离外部包 vs 本地路径
2. **版本推断**：参考已安装的 npm 包版本（`~/.npm/_npx/` 和 Cursor 内置版本）
3. **构建系统**：从 `bun:bundle` 使用模式 + MACRO 宏 + 产物格式（ESM bundle）反推
4. **存根生成**：从 import 语句提取需要导出的符号名，使用 `any` / 空实现填充
5. **迭代修复**：构建 → 收集错误 → 补文件/包 → 重试，直到构建通过

### 注意事项

- **存根文件只满足编译**：59 个存根文件的实现都是空的，仅保证类型和导出匹配。实际运行时相关功能不可用。
- **Feature Flag 控制缺失**：部分缺失文件在 feature flag 关闭时不会被打包（如 `TungstenTool`、`REPLTool`）。若需启用更多 flag，需补充更多存根或实现。
- **不可还原内容**：
  - `.wasm` 资源（tree-sitter-bash.wasm、tree-sitter.wasm、resvg.wasm）
  - vendor 二进制（ripgrep）
  - 内部 Anthropic 包（`@anthropic-ai/mcpb`、`@ant/*`）
  - 生成的类型文件（`coreTypes.generated.ts`、`settingsTypes.generated.ts`）
- **模型 ID 可能过时**：代码中的模型 ID（如 `claude-opus-4-6`）对应泄露时的版本，Anthropic 可能随时更新。

## 开发工作流

### 首次设置

```bash
# 克隆
git clone <repo> && cd claude-code-bun

# 安装依赖
npm install

# 生成存根（如首次构建）
bun run scripts/create-stubs.ts

# 构建
bun run build
```

### 日常开发

```bash
# 直接运行（Bun 原生 TS 执行，无需构建）
bun run src/main.tsx

# 构建
bun run build

# 类型检查
bun x tsc --noEmit
```

### 添加新工具

1. 在 `src/tools/` 下创建目录和实现文件
2. 在 `src/tools.ts` 中注册
3. 定义输入 Schema（Zod）和权限模型
4. 实现 `call()` 方法

### 添加新命令

1. 在 `src/commands/` 下创建实现文件
2. 在 `src/commands.ts` 中注册
3. 定义命令类型（`local-jsx` / `bridge-safe` 等）

### 修改 Feature Flag

1. 编辑 `scripts/build.ts` 中的 `featureFlags`
2. 确保该 flag 关联的所有源文件存在
3. 重新构建

## 技术栈速查

| 层 | 技术 | 文档 |
|---|---|---|
| Runtime | Bun | [bun.sh](https://bun.sh) |
| Terminal UI | Ink (React for CLI) | [github/vadimdemedes/ink](https://github.com/vadimdemedes/ink) |
| CLI Parser | Commander.js | [github/tj/commander.js](https://github.com/tj/commander.js) |
| Schema | Zod v4 | [zod.dev](https://zod.dev) |
| API | Anthropic SDK | [docs.anthropic.com](https://docs.anthropic.com) |
| MCP | MCP SDK | [modelcontextprotocol.io](https://modelcontextprotocol.io) |
| LSP | vscode-languageserver-protocol | [npm](https://www.npmjs.com/package/vscode-languageserver-protocol) |
| Telemetry | OpenTelemetry | [opentelemetry.io](https://opentelemetry.io) |
| Feature Flags | GrowthBook | [growthbook.io](https://www.growthbook.io) |
| Layout Engine | Yoga (pure TS port) | src/native-ts/yoga-layout/ |
