# 配置文档

## 配置层级

Claude Code 采用多层配置合并机制，优先级从高到低：

```
CLI Flag (--model, --settings)
    ↓
环境变量 (ANTHROPIC_API_KEY, ANTHROPIC_MODEL, ...)
    ↓
Flag Settings (--settings 指定的文件，只读)
    ↓
Policy Settings (managed-settings.json，管理员控制，只读)
    ↓
Local Settings (.claude/.settings.local.json，gitignored)
    ↓
Project Settings (.claude/settings.json)
    ↓
User Settings (~/.claude/settings.json)
    ↓
代码默认值
```

## 配置文件路径

| 文件 | 路径 | 说明 |
|---|---|---|
| 用户设置 | `~/.claude/settings.json` | 全局用户偏好 |
| 全局配置 | `~/.claude.json` | OAuth 账户、安装元数据 |
| 项目设置 | `<project>/.claude/settings.json` | 项目级配置 |
| 本地设置 | `<project>/.claude/.settings.local.json` | 本地覆盖（gitignored） |
| 管理员设置 | `~/.claude/managed-settings.json` | 企业管理员控制 |
| 管理员扩展 | `~/.claude/managed-settings.d/*.json` | 管理员插件式配置 |

> 配置目录可通过 `CLAUDE_CONFIG_DIR` 环境变量覆盖，默认 `~/.claude`。

## Settings.json 结构

参考模板：`.claude/settings.example.json`

```jsonc
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",

  // ── 认证 ──────────────────────────────────────────────
  // 通过脚本获取 API Key（stdout 输出 key）
  "apiKeyHelper": "/path/to/script",

  // AWS 凭据导出脚本
  "awsCredentialExport": "/path/to/script",
  // GCP 认证刷新命令
  "gcpAuthRefresh": "gcloud auth application-default login",

  // ── 模型 ──────────────────────────────────────────────
  // 别名: "sonnet" | "opus" | "haiku" | "opusplan" | "best"
  // 完整 ID: "claude-sonnet-4-6" | "claude-opus-4-6[1m]"
  "model": "sonnet",

  // 模型 ID 映射（1P → 云提供商 ARN）
  "modelOverrides": {
    "claude-opus-4-6": "arn:aws:bedrock:us-east-1::foundation-model/..."
  },

  // ── 环境变量注入 ──────────────────────────────────────
  "env": {
    "ANTHROPIC_BASE_URL": "https://custom-proxy.example.com"
  },

  // ── 权限 ──────────────────────────────────────────────
  "permissions": {
    "defaultMode": "prompt",  // "prompt" | "approve" | "deny"
    "allow": ["Bash(git status)", "Read(*)"],
    "deny": ["Bash(rm -rf *)"],
    "additionalDirectories": ["/path/to/extra"]
  },

  // ── Hooks ─────────────────────────────────────────────
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "echo 'before bash'" }
        ]
      }
    ],
    "PostToolUse": [],
    "Stop": []
  },

  // ── MCP 服务器 ────────────────────────────────────────
  "mcp": {
    "servers": {
      "my-server": {
        "command": "npx",
        "args": ["-y", "my-mcp-server"],
        "env": {}
      }
    }
  },

  // ── 技能 & Agent ──────────────────────────────────────
  "skills": {},
  "agents": {}
}
```

## 模型配置

### 支持的模型

| 系列 | 模型 ID | 别名 | 说明 |
|---|---|---|---|
| Opus 4.6 | `claude-opus-4-6` | `opus` | 最强推理能力 |
| Sonnet 4.6 | `claude-sonnet-4-6` | `sonnet` | 最佳编码模型 |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | `haiku` | 轻量快速 |
| Opus 4.5 | `claude-opus-4-5` | - | 上代 Opus |
| Sonnet 4.5 | `claude-sonnet-4-5` | - | 上代 Sonnet |

### 1M 上下文窗口

在模型 ID 后添加 `[1m]` 启用 1M token 上下文：

```bash
ANTHROPIC_MODEL=claude-opus-4-6[1m] claude
```

支持 1M 上下文的模型：`claude-opus-4-6`、`claude-sonnet-4-6`

### 默认模型选择逻辑

```
用户类型        默认模型
──────────     ──────────────
Max / Team     claude-opus-4-6 (+ [1m] if enabled)
Pro            claude-sonnet-4-6
Enterprise     claude-sonnet-4-6
PAYG           claude-sonnet-4-6
```

### 模型覆盖优先级

```
1. 会话内切换（/model 命令）      ← 最高
2. 启动时 --model 参数
3. ANTHROPIC_MODEL 环境变量
4. settings.json 中的 model 字段
5. 基于用户类型的默认值            ← 最低
```

### 云提供商模型映射

各提供商使用不同的模型 ID 格式：

| 提供商 | Opus 4.6 ID |
|---|---|
| 1P (Anthropic) | `claude-opus-4-6` |
| AWS Bedrock | `us.anthropic.claude-opus-4-6-v1` |
| Google Vertex | `claude-opus-4-6` |
| Azure Foundry | `claude-opus-4-6` |

## 认证配置

### 认证方式（优先级从高到低）

| # | 方式 | 配置方法 |
|---|---|---|
| 1 | OAuth 令牌 | `claude login` 交互式登录 |
| 2 | API Key 环境变量 | `ANTHROPIC_API_KEY=sk-ant-xxx` |
| 3 | API Key Helper 脚本 | settings.json 中 `apiKeyHelper` |
| 4 | Auth Token | `ANTHROPIC_AUTH_TOKEN=xxx` |
| 5 | File Descriptor | `CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR=N` |

### OAuth 端点

| 端点 | URL |
|---|---|
| API Base | `https://api.anthropic.com` |
| Console 授权 | `https://platform.claude.com/oauth/authorize` |
| Claude AI 授权 | `https://claude.com/cai/oauth/authorize` |
| Token 端点 | `https://platform.claude.com/v1/oauth/token` |

OAuth Client ID: `9d1c250a-e61b-44d9-88ed-5944d1962f5e`

### 云提供商认证

**AWS Bedrock：**
```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
# 需要已配置 AWS 凭据（~/.aws/credentials 或 IAM Role）
```

**Google Vertex AI：**
```bash
export CLAUDE_CODE_USE_VERTEX=1
# 需要 gcloud auth application-default login
```

**Azure Foundry：**
```bash
export CLAUDE_CODE_USE_FOUNDRY=1
# 需要 @azure/identity 凭据
```

## 环境变量完整参考

### 核心配置

| 变量 | 默认值 | 说明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | - | API Key（sk-ant-xxx） |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | API 端点 |
| `ANTHROPIC_MODEL` | 按用户类型 | 默认模型 |
| `ANTHROPIC_SMALL_FAST_MODEL` | `claude-haiku-4-5-20251001` | 轻量模型 |
| `CLAUDE_CONFIG_DIR` | `~/.claude` | 配置目录 |

### 提供商选择（互斥）

| 变量 | 说明 |
|---|---|
| `CLAUDE_CODE_USE_BEDROCK=1` | 使用 AWS Bedrock |
| `CLAUDE_CODE_USE_VERTEX=1` | 使用 Google Vertex AI |
| `CLAUDE_CODE_USE_FOUNDRY=1` | 使用 Azure Foundry |

### 行为控制

| 变量 | 说明 |
|---|---|
| `CLAUDE_CODE_SIMPLE=1` | 精简模式 |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | 禁用自动记忆 |
| `CLAUDE_CODE_DISABLE_FAST_MODE=1` | 禁用快速模式 |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1` | 禁用终端标题 |
| `CLAUDE_CODE_IDLE_THRESHOLD_MINUTES` | 空闲自动压缩阈值（默认 75） |
| `CLAUDE_CODE_IDLE_TOKEN_THRESHOLD` | Token 阈值（默认 100000） |

### 远程与容器

| 变量 | 说明 |
|---|---|
| `CLAUDE_CODE_REMOTE=1` | 远程模式 |
| `CLAUDE_CODE_CONTAINER_ID` | 容器 ID |
| `CLAUDE_CODE_REMOTE_SESSION_ID` | 远程会话 ID |
| `CLAUDE_CODE_ENVIRONMENT_KIND` | 环境类型 |

### OAuth 高级配置

| 变量 | 说明 |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | 直接注入 OAuth Token |
| `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` | 刷新 Token |
| `CLAUDE_CODE_OAUTH_CLIENT_ID` | 覆盖 Client ID |

### 调试与遥测

| 变量 | 说明 |
|---|---|
| `NODE_ENV` | 环境（development/production） |
| `OTEL_LOG_TOOL_DETAILS=1` | 详细工具日志 |
| `CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES=1` | 工具使用摘要 |

## 配置示例

### 最小 PAYG 配置

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
claude
```

### 企业 Bedrock 配置

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-west-2
# settings.json
{
  "model": "opus",
  "modelOverrides": {
    "claude-opus-4-6": "arn:aws:bedrock:us-west-2:123456789:foundation-model/anthropic.claude-opus-4-6-v1"
  }
}
```

### 代理环境配置

```bash
export https_proxy=http://proxy.corp.com:8080
export ANTHROPIC_API_KEY=sk-ant-xxx
claude
```
