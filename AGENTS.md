cat /Users/chuck/.claude/CLAUDE.md
# Global User Memory

## Memory Bank（项目记忆系统）

每次会话开始时，检查 `memory-bank/` 目录：

1. **存在** → 读取 `memory-bank/brief.md` + `memory-bank/active.md` 获取项目上下文
2. **不存在** → 首次工作时扫描项目结构（README.md、pyproject.toml 等），创建 `memory-bank/` 并生成 `brief.md` + `tech.md`

工作过程中，检测到以下事件时按 `/memory-bank` skill 规则写入：
- **新需求**：创建 `requirements/REQ-xxx.md`
- **技术决策**：追加到 `patterns.md`
- **经验教训**（bug/性能/集成踩坑）：创建 `learnings/xxx.md`

写入前输出计划，等待用户确认。详细规则见 `~/.claude/skills/memory-bank/SKILL.md`。
