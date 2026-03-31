# 部署文档

## 部署架构

```
构建产物                   运行时依赖
─────────                 ──────────
dist/cli.js  (10 MB)      Node.js ≥ 18 或 Bun
dist/cli.js.map (可选)     ripgrep (GrepTool)
vendor/ripgrep/ (可选)     网络访问 (Anthropic API)
```

Claude Code 是一个单文件 CLI 工具，核心产物只有 `dist/cli.js`。

## 部署方式

### 方式 1：直接运行（开发/测试）

```bash
# 构建
bun run build

# 运行
node dist/cli.js --version
node dist/cli.js "hello"

# 或通过 symlink
ln -sf $(pwd)/dist/cli.js /usr/local/bin/claude-dev
```

### 方式 2：npm 包分发（生产）

创建可发布的 npm 包：

```bash
# 1. 构建
bun run build

# 2. 准备发布目录
mkdir -p publish
cp dist/cli.js publish/cli.js
cp package.json publish/package.json

# 3. 复制 vendor 资源（ripgrep）
cp -r vendor/ publish/vendor/ 2>/dev/null || true

# 4. 发布
cd publish
npm publish
```

发布后的 `package.json` 应调整为：

```json
{
  "name": "@anthropic-ai/claude-code",
  "version": "2.1.88",
  "bin": { "claude": "cli.js" },
  "type": "module",
  "engines": { "node": ">=18.0.0" },
  "dependencies": {},
  "optionalDependencies": {
    "@img/sharp-darwin-arm64": "^0.34.2"
  }
}
```

> 注意：所有运行时依赖已打包进 `cli.js`，发布包的 `dependencies` 为空。仅 `optionalDependencies`（sharp 原生模块等）需要声明。

### 方式 3：Docker 容器

```dockerfile
FROM node:22-slim

# 安装 ripgrep（GrepTool 依赖）
RUN apt-get update && apt-get install -y ripgrep && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY dist/cli.js /app/cli.js
RUN chmod +x /app/cli.js

# 配置
ENV NODE_ENV=production

ENTRYPOINT ["node", "/app/cli.js"]
```

```bash
docker build -t claude-code .
docker run -it \
  -e ANTHROPIC_API_KEY=sk-ant-xxx \
  -v $(pwd):/workspace \
  -w /workspace \
  claude-code
```

### 方式 4：远程模式（IDE 集成）

```bash
# 服务端
CLAUDE_CODE_REMOTE=1 node dist/cli.js

# 通过 Bridge 协议连接 VS Code / JetBrains
```

## 运行时依赖

### 必须

| 依赖 | 版本 | 用途 |
|---|---|---|
| Node.js | ≥ 18 | 运行时 |
| 网络访问 | - | Anthropic API 调用 |

### 推荐

| 依赖 | 用途 | 缺失影响 |
|---|---|---|
| [ripgrep](https://github.com/BurntSushi/ripgrep) | GrepTool 代码搜索 | GrepTool 不可用 |
| git | 版本控制操作 | git 相关命令不可用 |

### 可选（按 Feature Flag）

| 依赖 | Feature Flag | 用途 |
|---|---|---|
| `@aws-sdk/*` | BEDROCK | AWS Bedrock 提供商 |
| `google-auth-library` | VERTEX | Google Vertex AI |
| `@azure/identity` | FOUNDRY | Azure Foundry |
| `sharp` | - | 图像处理 |

## 认证部署

### PAYG / Enterprise（API Key）

最简单的部署方式，只需设置环境变量：

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Pro / Max / Team（OAuth）

需要交互式登录一次，令牌存储在 `~/.claude.json`：

```bash
node dist/cli.js login
```

之后可在无交互环境中使用：

```bash
# 已有 OAuth Token 时可直接注入
export CLAUDE_CODE_OAUTH_TOKEN=xxx
export CLAUDE_CODE_OAUTH_REFRESH_TOKEN=xxx
```

### 企业 API Key Helper

通过脚本动态获取 API Key（适用于密钥轮换场景）：

```json
// ~/.claude/settings.json
{
  "apiKeyHelper": "/usr/local/bin/get-claude-key"
}
```

脚本需将 API Key 输出到 stdout。

## 文件系统布局

部署后的运行时文件：

```
~/.claude/                      # 用户配置目录
├── settings.json               # 用户设置
├── .claude.json                # OAuth 凭据 & 元数据
├── cache/                      # 缓存
│   └── changelog.md
├── teams/                      # 团队配置
├── agent-memory/               # 用户级记忆
└── managed-settings.json       # 企业管理设置（可选）

<project>/
├── .claude/                    # 项目级配置
│   ├── settings.json           # 项目设置
│   ├── .settings.local.json    # 本地覆盖（gitignored）
│   └── agent-memory/           # 项目级记忆
└── ...
```

## 健康检查

```bash
# 版本确认
node dist/cli.js --version

# 诊断
node dist/cli.js /doctor

# API 连通性（需要有效认证）
node dist/cli.js -p "say hello"
```

## 安全注意事项

1. **API Key 保护**：不要将 `ANTHROPIC_API_KEY` 硬编码到镜像或代码中，使用环境变量或密钥管理服务
2. **OAuth 凭据**：`~/.claude.json` 包含 OAuth Token，应限制文件权限（`chmod 600`）
3. **Source Map**：`dist/cli.js.map` 包含完整源码映射，生产部署应排除
4. **权限模式**：企业部署建议通过 `managed-settings.json` 限制危险操作
5. **网络隔离**：仅需访问 `api.anthropic.com`（或对应云提供商端点）

## 监控

Claude Code 支持 OpenTelemetry 遥测：

```bash
# 启用详细工具日志
export OTEL_LOG_TOOL_DETAILS=1

# 配置 OTLP 导出（trace/metrics/logs）
export OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4317
```

支持的导出器：gRPC、HTTP、Proto（通过 feature flag 和动态导入加载）。
