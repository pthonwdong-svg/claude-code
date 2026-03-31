# 打包文档

## 概述

Claude Code 使用 **Bun** 作为运行时和打包器，将 ~1900 个 TypeScript/TSX 源文件打包为单个 ESM bundle（`dist/cli.js`）。

## 前置要求

| 工具 | 最低版本 | 用途 |
|---|---|---|
| [Bun](https://bun.sh) | 1.1+ | 运行时 & 打包器 |
| [Node.js](https://nodejs.org) | 18+ | 运行构建产物 |
| npm / bun install | - | 安装依赖 |

## 快速构建

```bash
# 1. 安装依赖
npm install
# 或（如果 bun install 可用）
bun install

# 2. 构建
bun run build
# 等同于: bun run scripts/build.ts

# 3. 验证产物
ls -lh dist/cli.js     # ~10 MB 单文件 bundle
node dist/cli.js --version
```

## 构建脚本详解

构建脚本位于 `scripts/build.ts`，核心流程：

```
src/main.tsx  ──►  Bun.build()  ──►  dist/cli.js (ESM bundle)
                      │                    + dist/cli.js.map
                      │
                      ├─ bun:bundle 插件 → feature flag 死代码消除
                      ├─ MACRO.* define → 版本号等构建时替换
                      ├─ .md/.txt loader → 文本文件内联为字符串
                      └─ external 列表 → 不打包可选依赖
```

### 1. Feature Flags（死代码消除）

通过 `bun:bundle` 的 `feature()` 函数实现条件编译。源码中的模式：

```typescript
import { feature } from 'bun:bundle'

// 构建时 feature('VOICE_MODE') 被替换为 true/false
// 整个分支在 minify 时被移除
const voiceModule = feature('VOICE_MODE')
  ? require('./voice/index.js')
  : null
```

完整 flag 列表见 `scripts/build.ts` 中的 `featureFlags` 对象（90+ 个 flag）。

**默认启用的 flag：**

| Flag | 功能 |
|---|---|
| `BRIDGE_MODE` | IDE 集成（VS Code / JetBrains） |
| `FORK_SUBAGENT` | 子 Agent 进程 fork |
| `AGENT_TRIGGERS` | Agent 定时触发 |
| `EXTRACT_MEMORIES` | 自动记忆提取 |
| `ULTRATHINK` | 深度推理模式 |
| `MCP_SKILLS` | MCP 技能系统 |
| `HOOK_PROMPTS` | Hook 提示注入 |

**调整 flag：** 编辑 `scripts/build.ts` 中对应 flag 的 `true/false` 值。

### 2. MACRO 宏替换

构建时通过 Bun 的 `define` 选项将 `MACRO.*` 替换为字面量：

| 宏 | 替换内容 | 来源 |
|---|---|---|
| `MACRO.VERSION` | `"2.1.88"` | `package.json` version |
| `MACRO.BUILD_TIME` | `"2026-03-31T..."` | 构建时生成 |
| `MACRO.PACKAGE_URL` | npm 包地址 | 硬编码 |
| `MACRO.NATIVE_PACKAGE_URL` | 原生包地址 | 硬编码 |
| `MACRO.ISSUES_EXPLAINER` | Issue 反馈说明 | 硬编码 |
| `MACRO.FEEDBACK_CHANNEL` | 反馈渠道 | 硬编码 |
| `MACRO.VERSION_CHANGELOG` | 版本变更日志 JSON | 硬编码 |

源码中的声明方式：

```typescript
// src/types/globals.d.ts
declare const MACRO: {
  VERSION: string
  BUILD_TIME: string
  // ...
}
```

### 3. External 包

以下包不会被打包，运行时动态加载（可选依赖）：

- `@anthropic-ai/claude-agent-sdk` — Agent SDK
- `@anthropic-ai/bedrock-sdk` / `vertex-sdk` / `foundry-sdk` — 云提供商 SDK
- `@aws-sdk/*` — AWS SDK
- `@azure/identity` — Azure 认证
- `google-auth-library` — GCP 认证
- `color-diff-napi` / `modifiers-napi` — 原生模块
- `sharp` / `@img/sharp-*` — 图像处理

### 4. 文本资源内联

`.md` 和 `.txt` 文件通过 Bun 的 `text` loader 在构建时内联为字符串：

```typescript
// 构建时 skillMd 变为该文件的完整文本内容
import skillMd from './verify/SKILL.md'
```

## 构建产物

```
dist/
├── cli.js       # 10+ MB，单文件 ESM bundle，带 shebang
└── cli.js.map   # 50+ MB，Source Map
```

产物特征：
- 格式：ESM（`import` / `export`）
- Shebang：`#!/usr/bin/env node`
- 压缩：minified
- Source Map：linked（独立 `.map` 文件）

## 故障排除

### bun install 失败 (AccessDenied)

```bash
# macOS sandbox 限制，改用 npm 或设置 TMPDIR
TMPDIR=/tmp bun install
# 或
npm install
```

### 构建报 "Could not resolve"

两种情况：

1. **缺少 npm 包** → `npm install <package>`
2. **缺少源文件（存根）** → 运行 `bun run scripts/create-stubs.ts`

### 产物运行报错

构建产物需要完整的运行环境（API Key、OAuth 等），无法在无配置环境下直接运行。参见 [配置文档](./02-config.md)。

### 添加新的 Feature Flag

1. 在 `scripts/build.ts` 的 `featureFlags` 中添加
2. 在源码中使用 `feature('NEW_FLAG')` 条件导入
3. 确保所有新 flag 关联的文件存在（或补充存根）
