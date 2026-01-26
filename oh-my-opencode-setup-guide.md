# Oh My OpenCode 安装配置教程

本教程基于 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 官方文档整理。

---

## 前提条件

- 已安装 [OpenCode](https://opencode.ai/docs)（版本 ≥ 1.0.150；推荐 ≥ 1.0.210）
- 已安装 [Bun](https://bun.sh/) 或 Node.js

检查 OpenCode 是否已安装：

```bash
opencode --version
# 应输出类似：OpenCode 1.0.220
```

---

## 第一步：安装 Oh My OpenCode

根据你的订阅情况选择参数：

| 订阅 | 参数 |
|------|------|
| Claude Pro/Max (max20) | `--claude=max20` |
| Claude Pro/Max (非 max20) | `--claude=yes` |
| 无 Claude 订阅 | `--claude=no` |
| 有 ChatGPT 订阅 | `--chatgpt=yes` |
| 无 ChatGPT 订阅 | `--chatgpt=no` |
| 要集成 Gemini | `--gemini=yes` |
| 不集成 Gemini | `--gemini=no` |

### 示例安装命令

**ChatGPT + Gemini（无 Claude）：**

```bash
bunx oh-my-opencode install --no-tui --claude=no --chatgpt=yes --gemini=yes
```

**全部订阅（Claude max20）：**

```bash
bunx oh-my-opencode install --no-tui --claude=max20 --chatgpt=yes --gemini=yes
```

---

## 第二步：安装 CLIProxyAPI（本地 Claude/Gemini 代理）

CLIProxyAPI 用于本地转发 Claude 4.5（以及其他模型），提供 OpenAI-compatible 和 Anthropic-compatible 接口。

### 2.1 安装与启动（Homebrew 推荐）

```bash
brew install cliproxyapi
```

### 2.2 登录 Claude Code OAuth

```bash
cliproxyapi --claude-login
```

浏览器会自动打开 Anthropic 授权页面，完成授权后凭证自动保存到 `~/.cli-proxy-api`。

### 2.3 配置文件

创建配置文件 `~/.cli-proxy-api/config.yaml`：

```yaml
host: ""
port: 8317
auth-dir: "~/.cli-proxy-api"
api-keys:
  - "sk-your-api-key-here"
remote-management:
  allow-remote: false
  secret-key: "your-management-secret"
debug: false
```

配置说明：
- `host: ""`：绑定所有接口（允许局域网访问）
- `api-keys`：客户端访问密钥
- `remote-management.secret-key`：管理面板密钥（访问 `http://localhost:8317/management.html`）

### 2.4 启动服务

**方式 1：使用 Homebrew 服务**

需要自定义 launchd plist 以指定配置路径：

```bash
cat > ~/Library/LaunchAgents/homebrew.mxcl.cliproxyapi.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>KeepAlive</key><true/>
  <key>Label</key><string>homebrew.mxcl.cliproxyapi</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/opt/cliproxyapi/bin/cliproxyapi</string>
    <string>--config</string>
    <string>/Users/YOUR_USERNAME/.cli-proxy-api/config.yaml</string>
  </array>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/homebrew.mxcl.cliproxyapi.plist
```

**方式 2：手动启动**

```bash
cliproxyapi --config ~/.cli-proxy-api/config.yaml
```

### 2.5 验证服务

```bash
curl -s -H "Authorization: Bearer sk-your-api-key-here" http://127.0.0.1:8317/v1/models | jq '.data[].id'
```

应输出可用模型列表：
```
"claude-sonnet-4-5-20250929"
"claude-opus-4-5-20251101"
"claude-haiku-4-5-20251001"
...
```

### 2.6 配置 OpenCode 使用 CLIProxyAPI

在 `opencode.json` 的 `provider` 中添加 `cliproxy`：

```json
"cliproxy": {
  "npm": "@ai-sdk/anthropic",
  "options": {
    "baseURL": "http://127.0.0.1:8317/v1",
    "apiKey": "{env:CLIPROXY_API_KEY}"
  },
  "models": {
    "claude-sonnet-4-5-20250929": {
      "limit": { "context": 200000, "output": 64000 },
      "options": {
        "thinking": { "type": "enabled", "budgetTokens": 16000 }
      },
      "variants": {
        "low": { "options": { "thinking": { "type": "enabled", "budgetTokens": 8192 } } },
        "high": { "options": { "thinking": { "type": "enabled", "budgetTokens": 32768 } } }
      }
    },
    "claude-opus-4-5-20251101": {
      "limit": { "context": 200000, "output": 64000 },
      "options": {
        "thinking": { "type": "enabled", "budgetTokens": 16000 }
      },
      "variants": {
        "low": { "options": { "thinking": { "type": "enabled", "budgetTokens": 8192 } } },
        "max": { "options": { "thinking": { "type": "enabled", "budgetTokens": 32768 } } }
      }
    },
    "claude-haiku-4-5-20251001": {
      "limit": { "context": 200000, "output": 64000 }
    }
  }
}
```

设置环境变量（添加到 `~/.zshrc` 或 `~/.zprofile`）：

```bash
export CLIPROXY_API_KEY="sk-your-api-key-here"
```

> **注意**：OpenCode 使用 `{env:VAR}` 语法读取环境变量，而非 `${VAR}`。也支持 `{file:path}` 读取文件内容。

安装依赖：

```bash
cd ~/.config/opencode && npm install @ai-sdk/anthropic
```

### 2.7 使用方式

```
/model cliproxy/claude-opus-4-5-20251101
/model cliproxy/claude-opus-4-5-20251101:max   # 32K thinking budget
/model cliproxy/claude-sonnet-4-5-20250929:high
```

### 2.8 局域网共享

CLIProxyAPI 配置 `host: ""` 后，局域网内设备可通过本机 IP 访问：

| 项目 | 值 |
|------|-----|
| API Base URL | `http://<本机IP>:8317/v1` |
| API Key | 配置文件中的 `api-keys` |

验证局域网访问：

```bash
LOCAL_IP=$(ipconfig getifaddr en0)
curl -s -H "Authorization: Bearer sk-your-api-key-here" "http://${LOCAL_IP}:8317/v1/models" | jq '.data[].id'
```

### 2.9 其他安装方式（可选）

```bash
git clone https://github.com/router-for-me/CLIProxyAPI.git
cd CLIProxyAPI
cp config.example.yaml config.yaml
go build -o cli-proxy-api ./cmd/server
./cli-proxy-api --config config.yaml
```

---

## 第三步：配置 Antigravity Auth 插件


### 3.1 安装插件

```bash
cd ~/.config/opencode

bun add opencode-antigravity-auth@beta
```

### 3.2 配置 `~/.config/opencode/opencode.json`

推荐使用 Antigravity 自定义模型配置，支持 Gemini 3, Claude 4.5 Thinking 等模型。

完整模型清单以本仓库 `opencode.json` 为准。

---

## 第三步 B（可选）：配置 Antigravity Manager

Antigravity Manager 是一个本地代理服务，可以转发 Claude 请求并支持 Extended Thinking 功能。

### 3B.1 启动 Antigravity Manager

确保 Antigravity Manager 服务运行在 `http://127.0.0.1:8045`。

### 3B.2 设置环境变量

```bash
export ANTIGRAVITY_MANAGER_API_KEY="your-api-key"
```

### 3B.3 配置说明

在 `opencode.json` 的 `provider` 中添加 `antigravity_manager` 配置：

- **npm**: 使用 `@ai-sdk/anthropic` SDK（推荐，避免 thinkingLevel 参数问题）
- **baseURL**: 指向本地 Antigravity Manager 服务 `http://127.0.0.1:8045/v1`

**重要**: Antigravity Manager 根据**模型名称**自动启用 Thinking 和 Google Search 功能，**忽略客户端的 thinking 参数**。

### 3B.4 Thinking 模型

Antigravity Manager 检测模型名称来决定是否启用 Thinking：

| 模型名称 | Thinking | 说明 |
|----------|----------|------|
| `gemini-3-pro-high` | ✅ 自动启用 | 高 thinking budget |
| `gemini-3-pro-low` | ✅ 自动启用 | 低 thinking budget |
| `claude-opus-4-5-thinking` | ✅ 自动启用 | Claude Opus 4.5 |
| `claude-sonnet-4-5-thinking` | ✅ 自动启用 | Claude Sonnet 4.5 |
| `gemini-3-flash` | ❌ 无 thinking | 快速模型 |

**注意**: 在 `opencode.json` 中配置 `thinking` 参数对 Antigravity Manager **无效**，必须使用正确的模型名称。

### 3B.5 Google Search (联网搜索)

Antigravity Manager 支持 Google Search (Grounding) 功能，有两种启用方式：

1. **`-online` 后缀**: 在模型名称后添加 `-online`，如 `gemini-3-flash-online`
2. **请求中包含 web_search 工具**: Claude Code 等工具会自动添加

| 模型名称 | 功能 |
|----------|------|
| `gemini-3-flash-online` | Gemini 3 Flash + Google Search |
| `gemini-3-pro-high-online` | Gemini 3 Pro High + Google Search (不推荐，Thinking 和 Search 不兼容) |

**限制**: 
- 使用 `-online` 后缀时，模型会**降级到 `gemini-2.5-flash`**（目前只有它支持 googleSearch 工具）
- Thinking 和 Google Search **不兼容**，启用 Search 会禁用 Thinking

### 3B.6 推荐配置

```json
"antigravity_manager": {
  "npm": "@ai-sdk/anthropic",
  "name": "Antigravity Manager",
  "options": {
    "baseURL": "http://127.0.0.1:8045/v1",
    "apiKey": "{env:ANTIGRAVITY_MANAGER_API_KEY}"
  },
  "models": {
    "gemini-3-pro-high": {
      "name": "Gemini 3 Pro High (Thinking)",
      "limit": { "context": 1048576, "output": 65535 },
      "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
    },
    "gemini-3-flash": {
      "name": "Gemini 3 Flash",
      "limit": { "context": 1048576, "output": 65536 },
      "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
    },
    "gemini-3-flash-online": {
      "name": "Gemini 3 Flash + Search",
      "limit": { "context": 1048576, "output": 65536 },
      "modalities": { "input": ["text", "image", "pdf"], "output": ["text"] }
    }
  }
}
```

### 3B.5 使用示例

完整配置参见本仓库 `opencode.json`。

---

## 第四步：配置 Oh My OpenCode Agent 模型

编辑 `~/.config/opencode/oh-my-opencode.json`，配置各 Agent 使用的模型。

完整配置参见本仓库 `oh-my-opencode.json`。

如需强推理：在 Agent 的 `options` 里使用 `reasoningEffort: "high"` 或 `xhigh`。

---

## 第五步：配置多账号轮询调度（可选）

当你有多个 Google 账号时，可以启用多账号轮询调度，实现：

- 当一个账号被限速/冷却时，自动切换到其他可用账号
- 用轮询（Round Robin）方式均匀分配请求
- 减少手动切换账号的麻烦

### 4.1 添加多个账号

```bash
opencode auth login
# 如果已有账号，选择 (a)dd 添加新账号
```

账号存储在 `~/.config/opencode/antigravity-accounts.json`。

> **注意**：Antigravity-Manager 目前不支持 OpenCode 配置（仅支持 Antigravity CLI）。

### 4.2 创建 `~/.config/opencode/antigravity.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/NoeFabris/opencode-antigravity-auth/main/assets/antigravity.schema.json",
  "account_selection_strategy": "round-robin",
  "quota_fallback": true,
  "switch_on_first_rate_limit": true
}
```

### 4.3 配置说明

#### 账号选择策略 (`account_selection_strategy`)

| 策略 | 行为 | 适用场景 |
|------|------|----------|
| `sticky`（默认） | 一直用同一个账号，直到被限速 | 保留 Prompt Cache |
| `round-robin` | 每次请求轮换到下一个账号 | 最大吞吐量 |
| `hybrid` | 先触碰所有新账号一轮，然后 sticky | 同步重置时间 + 保留缓存 |

#### 其他常用配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `quota_fallback` | `false` | Gemini 限速时自动尝试备用配额池（Antigravity ↔ Gemini CLI） |
| `switch_on_first_rate_limit` | `true` | 首次 429 限速立即切换账号 |
| `pid_offset_enabled` | `true` | 多会话时用 PID 偏移分散负载 |
| `max_rate_limit_wait_seconds` | `300` | 限速最大等待时间（0=无限） |

#### 完整配置示例

```json
{
  "$schema": "https://raw.githubusercontent.com/NoeFabris/opencode-antigravity-auth/main/assets/antigravity.schema.json",
  "quiet_mode": false,
  "debug": false,
  "account_selection_strategy": "round-robin",
  "quota_fallback": true,
  "switch_on_first_rate_limit": true,
  "pid_offset_enabled": true,
  "max_rate_limit_wait_seconds": 300,
  "session_recovery": true,
  "auto_resume": true,
  "keep_thinking": false,
  "web_search": {
    "default_mode": "auto",
    "grounding_threshold": 0.3
  }
}
```

> **注意**：轮询调度需要至少 2 个账号才有意义。冷却感知路由是默认行为——账号被限速时自动跳过。

---

## 第六步：自定义 Agent 配置

除了在 `oh-my-opencode.json` 中配置内置 Agent，你还可以通过 Markdown 文件创建自定义 Agent。

### 6.1 创建 Agent 定义文件

在 `~/.config/opencode/agent/` 目录下创建 Markdown 文件即可定义 Agent。文件头部 Frontmatter 定义元数据，正文定义 System Prompt。

**示例 1: Backend Engineer (`~/.config/opencode/agent/backend-engineer.md`)**

专精于后端开发的 Agent，配置了更严格的 bash 权限和较低的 temperature（更严谨）。

```markdown
---
description: Backend systems expert for API design, database optimization, Python/Go/Node services, and production-grade server architecture
mode: subagent
model: openai/gpt-5.2-codex
temperature: 0.2
reasoningEffort: medium
tools:
  write: true
  edit: true
  bash: true
  webfetch: false
permission:
  bash:
    "*": ask
    "python *": allow
    "uv *": allow
    "pytest *": allow
    "pip *": allow
    "git status": allow
    "git diff*": allow
    "ls *": allow
    "cat *": allow
---
# Backend Engineer
You are a senior backend engineer specializing in production-grade server systems.
## Core Competencies
...
```

**示例 2: Agent Engineer (`~/.config/opencode/agent/agent-engineer.md`)**

专精于 Agent 系统设计的 Agent，配置了 webfetch 工具以便查阅文档，temperature 略高（更有创造力）。

```markdown
---
description: AI agent systems designer for MCP protocols, prompt engineering, multi-agent orchestration, and LLM integration patterns
mode: subagent
model: openai/gpt-5.2-codex
temperature: 0.3
reasoningEffort: medium
tools:
  write: true
  edit: true
  bash: true
  webfetch: true
permission:
  bash:
    "*": ask
    "ls *": allow
    "cat *": allow
    "git status": allow
    "git diff*": allow
---
# Agent Engineer
You are an expert in AI agent systems...
```

### 6.2 使用方法

重启 OpenCode 后，自定义 Agent 会自动加载。

1. **直接对话**: 使用 `@` 符号唤起
   ```
   @backend-engineer 请帮我设计一个高并发的抢购接口
   ```

2. **在任务中使用**:
   ```python
   sisyphus_task(subagent_type="agent-engineer", prompt="编写一个用于搜索代码的 MCP Tool 定义")
   ```
