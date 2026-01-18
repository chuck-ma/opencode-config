# opencode-antigravity-auth v1.3.0 新功能配置

**日期**: 2026-01-18  
**来源**: https://github.com/NoeFabris/opencode-antigravity-auth/releases/tag/v1.3.0

## 1. Google Search Grounding（Web 搜索）

在 `antigravity.json` 中配置，让 Gemini 模型能够进行实时网页搜索。

```json
{
  "web_search": {
    "default_mode": "auto",
    "grounding_threshold": 0.3
  }
}
```

| 选项 | 值 | 说明 |
|------|-----|------|
| `default_mode` | `"auto"` | 模型自动决定何时搜索（推荐） |
| `default_mode` | `"off"` | 禁用搜索（**默认值**） |
| `grounding_threshold` | `0.0` - `1.0` | 值越高搜索越少，默认 `0.3` |

**环境变量覆盖**：
```bash
OPENCODE_ANTIGRAVITY_WEB_SEARCH=auto
OPENCODE_ANTIGRAVITY_WEB_SEARCH_THRESHOLD=0.3
```

## 2. keep_thinking（保留思考块）

控制是否在对话历史中保留 Claude 的思考块。

```json
{
  "keep_thinking": false
}
```

| 值 | 说明 |
|-----|------|
| `false` | **默认值**。剥离思考块，更稳定 |
| `true` | 保留思考块，跨 turn 记忆推理。**实验性，可能影响稳定性** |

**环境变量覆盖**：
```bash
OPENCODE_ANTIGRAVITY_KEEP_THINKING=1
```

## 3. Account Rotation 策略（账号轮换）

当有多个 Google 账号时，插件决定用哪个账号发请求。

### 三种策略

| 策略 | 行为 | 适用场景 |
|------|------|---------|
| `sticky` | 一直用同一个账号，直到被限速才切换 | 单账号，保留 prompt cache |
| `round-robin` | 每次请求都轮换到下一个账号 | 4+ 账号，最大吞吐 |
| `hybrid` | 综合健康分数 + 令牌桶 + LRU | 2-3 账号，智能分配（**默认**） |

### 配置示例

```json
{
  "account_selection_strategy": "round-robin"
}
```

### 健康分机制（hybrid 策略）

| 事件 | 分数变化 |
|------|----------|
| 初始分 | 70 |
| 成功请求 | +1 |
| 被限速 | -10 |
| 请求失败 | -20 |
| 每小时恢复 | +2 |
| 最低可用分 | 50（低于不被选中） |

### 推荐配置

| 账号数量 | 推荐策略 | 其他建议 |
|----------|----------|----------|
| 1 个 | `sticky` | 无需轮换 |
| 2-3 个 | `hybrid` | 默认值 |
| 4+ 个 | `round-robin` | 最大吞吐 |
| 并行 Agent | `round-robin` + `pid_offset_enabled: true` | 避免多进程抢同一账号 |

## 4. switch_on_first_rate_limit（首次限速切换）

控制被 429 限速后的行为。

| 设置 | 被限速后行为 |
|------|-------------|
| `true`（默认） | 等 1 秒后**立即切换**到下一个账号 |
| `false` | 等待完整 `Retry-After` 时间（可能 60s-300s）才切换 |

**示例**：账号 A 被限速，API 返回 `Retry-After: 120`

| 设置 | 行为 | 结果 |
|------|------|------|
| `true` | 等 1 秒 → 切换账号 B | 几乎无感知 |
| `false` | 等待 120 秒 | 卡住 2 分钟 |

**配置**：
```json
{
  "switch_on_first_rate_limit": true
}
```

## 5. 并行 Agent 配置（oh-my-opencode）

多进程可能同时选中同一账号，导致限速。

```json
{
  "pid_offset_enabled": true
}
```

根据进程 ID 偏移初始账号选择，分散负载。

## 6. Dual Quota Pools（双配额池，仅 Gemini）

每个账号有两个独立配额池：

| 配额池 | 使用时机 |
|--------|----------|
| Antigravity | 主池（优先） |
| Gemini CLI | 备用池（Antigravity 限速后） |

**启用**：
```json
{
  "quota_fallback": true
}
```

效果：每个账号的 Gemini 配额翻倍。

## 7. v1.3.0 其他新功能

- **Image Generation Support**: 支持 Gemini 图像生成模型
- **Auto .gitignore**: 自动为敏感文件创建 .gitignore
- **Gemini Tool Schema Fix**: 修复 Gemini 3 的 `Unknown name "parameters"` 错误
- **Claude Thinking Block Handling**: 改进思考块处理

## 8. 升级注意事项

升级到 v1.3.0 后如遇问题，清除缓存：
```bash
rm -rf ~/.cache/opencode/node_modules ~/.cache/opencode/bun.lock
```

## 9. 配置文件位置

| 文件 | 路径 |
|------|------|
| 主配置 | `~/.config/opencode/opencode.json` |
| 插件配置 | `~/.config/opencode/antigravity.json` |
| 账号存储 | `~/.config/opencode/antigravity-accounts.json` |

## 10. 环境变量一览

| 配置项 | 环境变量 |
|--------|----------|
| `debug` | `OPENCODE_ANTIGRAVITY_DEBUG=1` (或 `=2` verbose) |
| `quiet_mode` | `OPENCODE_ANTIGRAVITY_QUIET=1` |
| `keep_thinking` | `OPENCODE_ANTIGRAVITY_KEEP_THINKING=1` |
| `web_search.default_mode` | `OPENCODE_ANTIGRAVITY_WEB_SEARCH=auto` |
| `web_search.grounding_threshold` | `OPENCODE_ANTIGRAVITY_WEB_SEARCH_THRESHOLD=0.3` |
| `account_selection_strategy` | `OPENCODE_ANTIGRAVITY_ACCOUNT_SELECTION_STRATEGY=round-robin` |
| `pid_offset_enabled` | `OPENCODE_ANTIGRAVITY_PID_OFFSET_ENABLED=1` |
