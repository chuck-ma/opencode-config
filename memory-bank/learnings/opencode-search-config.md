# OpenCode 搜索工具配置指南

## 两个搜索系统

| 搜索系统 | 来源 | 工具名称 | 触发方式 |
|----------|------|----------|----------|
| **Exa Search** | `oh-my-opencode` 插件 | `websearch_web_search_exa` | 模型主动调用工具 |
| **Google Search** | `opencode-antigravity-auth` | `google_search` | 模型调用或 `-online` 后缀触发 Grounding |

## Google Search Grounding 生效条件

1. **模型名称带 `-online` 后缀**：如 `gemini-3-flash-online`
2. **禁用 Exa 工具**：否则 OpenCode 会优先使用 Exa 拦截搜索请求
3. **通过 Antigravity Manager**：`antigravity_manager/gemini-3-flash-online`

## Per-Agent 工具限制配置

### 关键发现

`opencode run --model=X` **不走 agent 配置**，只选择模型但不加载 agent 的 tools 限制。

必须：
1. 在 `opencode.json` 的 `agent` 块中定义配置
2. 使用 `--agent=X` 参数测试（或通过 subagent 调用）

### 配置示例

**opencode.json**:
```json
{
  "agent": {
    "librarian": {
      "model": "antigravity_manager/gemini-3-flash-online",
      "tools": {
        "websearch_web_search_exa": false
      }
    }
  }
}
```

**oh-my-opencode.json**:
```json
{
  "agents": {
    "librarian": {
      "model": "antigravity_manager/gemini-3-flash-online",
      "tools": {
        "websearch_web_search_exa": false
      }
    }
  }
}
```

### 工具名称匹配

- 精确名称：`"websearch_web_search_exa": false`
- Glob 模式：`"websearch_*": false`（匹配所有 websearch 开头的工具）
- MCP 工具模式：`"mymcp_*": false`（禁用某个 MCP 的所有工具）

## 测试方法

```bash
# 错误：不走 agent 配置
opencode run "查询" --model=antigravity_manager/gemini-3-flash-online

# 正确：使用 agent 配置
opencode run "查询" --agent=librarian
```

## Thinking 模式配置

### Antigravity Manager 模型

通过 Antigravity Manager 的模型自动支持 thinking（由服务端处理）：
- `antigravity_manager/gemini-3-pro-high` - 自带 thinking
- `antigravity_manager/claude-opus-4-5-thinking` - 自带 thinking

### Claude 模型 Thinking 配置

在 `opencode.json` 的 provider models 中配置：

```json
{
  "provider": {
    "cliproxy": {
      "models": {
        "claude-opus-4-5-20251101": {
          "options": {
            "thinking": { "type": "enabled", "budgetTokens": 16000 }
          },
          "variants": {
            "low": { "options": { "thinking": { "budgetTokens": 8192 } } },
            "max": { "options": { "thinking": { "budgetTokens": 32768 } } }
          }
        }
      }
    }
  }
}
```

使用 variant：`--variant=max` 或 `--variant=low`

### Antigravity 插件配置

`antigravity.json` 中的搜索配置：

```json
{
  "web_search": {
    "default_mode": "auto",
    "grounding_threshold": 0.3
  },
  "keep_thinking": false
}
```

- `default_mode: "auto"` - 自动决定是否触发 Google Search Grounding
- `keep_thinking: false` - 是否保留 thinking tokens（设为 false 可节省 token）

## 相关文件

- `/Users/chuck/.config/opencode/opencode.json` - 主配置
- `/Users/chuck/.config/opencode/oh-my-opencode.json` - oh-my-opencode 插件配置
- `/Users/chuck/.config/opencode/antigravity.json` - Antigravity 插件配置
