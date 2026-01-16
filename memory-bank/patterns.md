# 系统模式

## 代理配置模式

### 基于 Markdown 的定义
我们使用 `~/.config/opencode/agent/` 中的 Markdown 文件来定义自定义代理，这样可以获得更丰富的系统提示词，并清晰分离元数据。

**结构：**
- **Frontmatter（YAML）**：
  - `mode`：通常为 `subagent`。
  - `model`：底层模型（例如 `openai/gpt-5.2-codex`）。
  - `temperature`：代码场景偏低（0.2），创意场景偏高（0.3+）。
  - `tools`：启用/禁用特定工具类别（`bash`、`write`、`webfetch`）。
  - `permission`：对 `bash` 命令进行细粒度控制（allow vs ask）。
- **正文**：定义角色、能力与规则的系统提示词。

### 权限策略
- **安全优先**：破坏性命令（如 `rm`）默认设置为 `ask` 或不显式放行。
- **开发效率**：常用读取/状态命令（如 `ls`、`cat`、`git status`）设置为 `allow`，减少确认疲劳。
- **按工具区分**：`backend-engineer` 允许 `python`/`pip`，`agent-engineer` 允许 `webfetch`。

### 语言规范
- **Memory Bank 全部内容使用中文**。
