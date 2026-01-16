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

## 第二步：配置 Antigravity Auth 插件


### 2.1 安装插件

```bash
cd ~/.config/opencode

bun add opencode-antigravity-auth@1.2.8
```

### 2.2 配置 `~/.config/opencode/opencode.json`

注意：
- OpenAI OAuth 必须使用 `opencode-openai-codex-auth` 的现代配置（`config/opencode-modern.json`，OpenCode ≥ 1.0.210）。
- 不要设置 `api: "codex"`，否则会出现 `codex/responses` URL 错误。
- 推荐固定插件版本（例如 `opencode-openai-codex-auth@4.3.0`）。
- 现代配置使用 **基础模型 + variant**，例如 `openai/gpt-5.2` 搭配 `variant=high`，而不是 `openai/gpt-5.2-high` 这种拼接名称。

```json
{
  "$schema": "https://opencode.ai/config.json",
  "small_model": "openai/gpt-5.2",
  "plugin": [
    "oh-my-opencode",
    "opencode-antigravity-auth@1.2.8",
    "opencode-openai-codex-auth@4.3.0"
  ],
  "provider": {
    "google": {
      "npm": "@ai-sdk/google",
      "models": {
        "gemini-3-pro-preview": {
          "id": "gemini-3-pro-preview",
          "name": "3 Pro",
          "release_date": "2025-11-18",
          "reasoning": true,
          "limit": { "context": 1000000, "output": 64000 },
          "cost": { "input": 2, "output": 12, "cache_read": 0.2 },
          "modalities": {
            "input": ["text", "image", "video", "audio", "pdf"],
            "output": ["text"]
          },
          "variants": {
            "low": { "options": { "thinkingConfig": { "thinkingLevel": "low", "includeThoughts": true } } },
            "medium": { "options": { "thinkingConfig": { "thinkingLevel": "medium", "includeThoughts": true } } },
            "high": { "options": { "thinkingConfig": { "thinkingLevel": "high", "includeThoughts": true } } }
          }
        },
        "gemini-3-flash": {
          "id": "gemini-3-flash",
          "name": "3 Flash",
          "release_date": "2025-12-17",
          "reasoning": true,
          "limit": { "context": 1048576, "output": 65536 },
          "cost": { "input": 0.5, "output": 3, "cache_read": 0.05 },
          "modalities": {
            "input": ["text", "image", "video", "audio", "pdf"],
            "output": ["text"]
          },
          "variants": {
            "minimal": { "options": { "thinkingConfig": { "thinkingLevel": "minimal", "includeThoughts": true } } },
            "low": { "options": { "thinkingConfig": { "thinkingLevel": "low", "includeThoughts": true } } },
            "medium": { "options": { "thinkingConfig": { "thinkingLevel": "medium", "includeThoughts": true } } },
            "high": { "options": { "thinkingConfig": { "thinkingLevel": "high", "includeThoughts": true } } }
          }
        },
        "gemini-2.5-flash-lite": {
          "id": "gemini-2.5-flash-lite",
          "name": "2.5 Flash Lite",
          "reasoning": false
        },
        "gemini-claude-sonnet-4-5-thinking": {
          "id": "gemini-claude-sonnet-4-5-thinking",
          "name": "Sonnet 4.5",
          "limit": { "context": 200000, "output": 64000 },
          "modalities": {
            "input": ["text", "image", "pdf"],
            "output": ["text"]
          },
          "variants": {
            "low": { "thinkingConfig": { "thinkingBudget": 8192 } },
            "max": { "thinkingConfig": { "thinkingBudget": 32768 } }
          }
        },
        "gemini-claude-opus-4-5-thinking": {
          "id": "gemini-claude-opus-4-5-thinking",
          "name": "Opus 4.5",
          "limit": { "context": 200000, "output": 64000 },
          "modalities": {
            "input": ["text", "image", "pdf"],
            "output": ["text"]
          },
          "variants": {
            "low": { "thinkingConfig": { "thinkingBudget": 8192 } },
            "max": { "thinkingConfig": { "thinkingBudget": 32768 } }
          }
        }
      }
    },
    "openai": {
      "options": {
        "reasoningEffort": "medium",
        "reasoningSummary": "auto",
        "textVerbosity": "medium",
        "include": [
          "reasoning.encrypted_content"
        ],
        "store": false
      },
      "models": {
        "gpt-5.2": {
          "name": "GPT 5.2 (OAuth)",
          "limit": { "context": 272000, "output": 128000 },
          "modalities": { "input": ["text", "image"], "output": ["text"] },
          "variants": {
            "none": { "reasoningEffort": "none", "reasoningSummary": "auto", "textVerbosity": "medium" },
            "low": { "reasoningEffort": "low", "reasoningSummary": "auto", "textVerbosity": "medium" },
            "medium": { "reasoningEffort": "medium", "reasoningSummary": "auto", "textVerbosity": "medium" },
            "high": { "reasoningEffort": "high", "reasoningSummary": "detailed", "textVerbosity": "medium" },
            "xhigh": { "reasoningEffort": "xhigh", "reasoningSummary": "detailed", "textVerbosity": "medium" }
          }
        },
        "gpt-5.2-codex": {
          "name": "GPT 5.2 Codex (OAuth)",
          "limit": { "context": 272000, "output": 128000 },
          "modalities": { "input": ["text", "image"], "output": ["text"] },
          "variants": {
            "low": { "reasoningEffort": "low" },
            "medium": { "reasoningEffort": "medium" },
            "high": { "reasoningEffort": "high" },
            "xhigh": { "reasoningEffort": "xhigh" }
          }
        }
      }
    }
  }
}
```

完整模型清单以 `opencode-modern.json` 为准。

---

## 第三步：配置 Oh My OpenCode Agent 模型

编辑 `~/.config/opencode/oh-my-opencode.json`：

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "google_auth": false,
  "agents": {
    "Sisyphus": {
      "model": "google/gemini-claude-opus-4-5-thinking"
    },
    "oracle": {
      "model": "openai/gpt-5.2",
      "options": {
        "reasoningEffort": "high"
      }
    },
    "librarian": {
      "model": "google/gemini-3-flash"
    },
    "explore": {
      "model": "google/gemini-3-flash"
    },
    "frontend-ui-ux-engineer": {
      "model": "google/gemini-3-pro-preview"
    },
    "document-writer": {
      "model": "google/gemini-3-flash"
    },
    "multimodal-looker": {
      "model": "google/gemini-3-flash"
    }
  }
}
```

如需强推理：在 Agent 的 `options` 里使用 `reasoningEffort: "high"` 或 `xhigh`。

---

## 第四步：配置多账号轮询调度（可选）

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
| `pid_offset_enabled` | `false` | 多会话时用 PID 偏移分散负载 |
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
  "pid_offset_enabled": false,
  "max_rate_limit_wait_seconds": 300,
  "session_recovery": true,
  "auto_resume": true
}
```

> **注意**：轮询调度需要至少 2 个账号才有意义。冷却感知路由是默认行为——账号被限速时自动跳过。

---

## 第五步：自定义 Agent 配置

除了在 `oh-my-opencode.json` 中配置内置 Agent，你还可以通过 Markdown 文件创建自定义 Agent。

### 5.1 创建 Agent 定义文件

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

### 5.2 使用方法

重启 OpenCode 后，自定义 Agent 会自动加载。

1. **直接对话**: 使用 `@` 符号唤起
   ```
   @backend-engineer 请帮我设计一个高并发的抢购接口
   ```

2. **在任务中使用**:
   ```python
   sisyphus_task(subagent_type="agent-engineer", prompt="编写一个用于搜索代码的 MCP Tool 定义")
   ```

