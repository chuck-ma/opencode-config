# OpenCode Session Management Guide

## 来源
- User Input (2026-01-20)

## 常用命令

### 1. 列出所有会话
查看所有会话的 ID、标题和更新时间。
```bash
opencode session list
```

### 2. 查看会话详细内容 (Export)
查看某个 Session 的具体聊天记录（JSON 格式）。
```bash
opencode export <SESSION_ID>
# 配合 less 查看
opencode export <SESSION_ID> | less
```

### 3. 通过 TUI 进入指定会话
使用 `-s` 参数进入 TUI 继续会话。
```bash
opencode -s <SESSION_ID>
```

### 4. 快捷方式
- **继续上一次会话**: `opencode -c`
- **启动新会话**: `opencode` (不带参数)
