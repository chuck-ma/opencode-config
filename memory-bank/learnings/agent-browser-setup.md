# Agent Browser 安装与故障排除指南

## 来源
- User Experience (2026-01-31)

## 安装步骤

### 1. 安装 agent-browser
```bash
bun add -g agent-browser && agent-browser install
```

### 2. 修复权限错误 (EACCES)
如果遇到 `EACCES: permission denied` 错误，需要手动添加执行权限：
```bash
# macOS Apple Silicon
chmod +x ~/.bun/install/global/node_modules/agent-browser/bin/agent-browser-darwin-arm64

# macOS Intel
chmod +x ~/.bun/install/global/node_modules/agent-browser/bin/agent-browser-darwin-x64

# Linux
chmod +x ~/.bun/install/global/node_modules/agent-browser/bin/agent-browser-linux-x64
```

### 3. 安装 Playwright 浏览器
如果遇到 `Executable doesn't exist at ...` 错误：
```bash
# 方式一：使用 agent-browser 命令
agent-browser install

# 方式二：直接使用 playwright
npx playwright install chromium
```

## Google CAPTCHA/安全验证问题

Google 搜索可能触发 CAPTCHA 或安全验证，解决方案：

### 方案一：使用替代搜索引擎（推荐）
- 百度：`https://www.baidu.com/s?wd=关键词`
- Bing：`https://www.bing.com/search?q=关键词`
- DuckDuckGo：`https://duckduckgo.com/?q=关键词`

### 方案二：降低自动化特征
```bash
# 使用 headed 模式（可视化浏览器）
agent-browser --headed "搜索任务"

# 使用持久化 Profile（保留 cookies 和登录状态）
agent-browser --profile ~/.browser-profile "搜索任务"

# 设置真实 User-Agent
agent-browser --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "搜索任务"

# 使用代理
agent-browser --proxy "http://proxy:port" "搜索任务"
```

### 方案三：环境变量配置
```bash
# 在 ~/.zshrc 或 ~/.bashrc 中添加
export AGENT_BROWSER_PROFILE=~/.browser-profile
export AGENT_BROWSER_PROXY="http://proxy:port"
export AGENT_BROWSER_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ..."
```

## 常用命令参考

| 命令 | 说明 |
|------|------|
| `agent-browser install` | 安装 Playwright 浏览器 |
| `agent-browser --headed` | 有头模式运行 |
| `agent-browser --profile <path>` | 指定浏览器 Profile |
| `agent-browser --proxy <url>` | 指定代理 |
| `agent-browser --user-agent <ua>` | 指定 User-Agent |

## 最佳实践

1. **避免直接使用 Google**：使用 Bing 或 DuckDuckGo 可以大幅减少被拦截的概率
2. **持久化 Profile**：设置 `AGENT_BROWSER_PROFILE` 环境变量，保持登录状态和 cookies
3. **适当延迟**：自动化脚本中加入随机延迟，模拟人类行为
4. **监控模式**：首次使用新功能时，用 `--headed` 模式观察行为
