# Google Search Plugin 设计文档

**日期**: 2026-01-27  
**状态**: 设计完成，待实现  
**包名**: `opencode-google-search`

---

## 1. 背景与动机

### 问题

OpenCode 中需要一个通用的 Google 搜索工具，让**所有模型**（Claude、GPT、Gemini 等）都能调用。

### 现有方案分析

| 方案 | 来源 | 问题 |
|------|------|------|
| `opencode-google-antigravity-auth` | shekohex | 复杂：需要 OAuth、原生 `googleSearch` 工具注入、`groundingMetadata` 解析 |
| Exa Search | oh-my-opencode | 第三方服务，非 Google 原生 |
| `-online` 模型 | Antigravity Manager | ✅ 简单：内置搜索，标准 API |

### 关键发现

Antigravity Manager 的 `gemini-3-flash-online` 模型：
- 内置 Google Search Grounding
- 通过标准 Anthropic-compatible `/v1/messages` API 调用
- 自动返回搜索结果和引用

**测试验证**：
```bash
curl http://127.0.0.1:8045/v1/messages -d '{
  "model": "gemini-3-flash-online",
  "messages": [{"role": "user", "content": "OpenAI最新发布了什么？"}]
}'
# 返回包含 "🔍 已为您搜索：" 和 "🌐 来源引文：" 的结构化结果
```

---

## 2. 设计决策

### 核心思路

**不重新发明轮子**：直接包装 `-online` 模型作为搜索后端。

### 架构对比

| 对比项 | 复杂方案 | **简化方案（采用）** |
|--------|----------|---------------------|
| OAuth | 需要 | ❌ 不需要 |
| 原生 `googleSearch` 工具 | 需要注入 | ❌ 不需要 |
| API 调用 | 特殊内部端点 | 标准 `/v1/messages` |
| 工作量 | 1-2 天 | **<1 小时** |

### 设计原则

1. **Tool-only 插件**：只注册工具，不干扰模型路由
2. **零配置可用**：默认配置即可工作
3. **环境变量覆盖**：支持自定义配置

---

## 3. 技术规格

### 3.1 插件结构

```
opencode-google-search/
├── index.ts              # 入口：export { GoogleSearchPlugin }
├── package.json
├── tsconfig.json
└── src/
    └── plugin.ts         # 插件实现
```

### 3.2 工具定义

```typescript
tool({
  name: "google_search",
  description: "Search the web using Google Search. Returns real-time information with source citations.",
  args: {
    query: tool.schema.string().describe("The search query"),
    thinking: tool.schema.boolean().optional().default(false)
      .describe("Enable deep thinking for more thorough analysis"),
  },
  async execute(args, ctx) {
    // 调用 Antigravity Manager 的 -online 模型
  },
})
```

### 3.3 配置项

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `OPENCODE_SEARCH_BASE_URL` | `http://127.0.0.1:8045` | Antigravity Manager 地址 |
| `OPENCODE_SEARCH_MODEL` | `gemini-3-flash-online` | 搜索模型 |
| `OPENCODE_SEARCH_MAX_TOKENS` | `8192` | 最大输出 token |
| `OPENCODE_SEARCH_TIMEOUT_MS` | `60000` | 超时时间（毫秒） |

### 3.4 返回格式

工具返回纯文本，包含：
- 搜索结果正文
- `🔍 已为您搜索：{query}` 指示器
- `🌐 来源引文：` 编号引用列表

---

## 4. 实现细节

### 4.1 核心代码

```typescript
import { tool } from "@opencode-ai/plugin";
import type { PluginInput } from "@opencode-ai/plugin";

const DEFAULT_BASE_URL = "http://127.0.0.1:8045";
const DEFAULT_MODEL = "gemini-3-flash-online";
const DEFAULT_MAX_TOKENS = 8192;
const DEFAULT_TIMEOUT_MS = 60000;

export const GoogleSearchPlugin = async (_input: PluginInput) => {
  const baseUrl = process.env.OPENCODE_SEARCH_BASE_URL ?? DEFAULT_BASE_URL;
  const model = process.env.OPENCODE_SEARCH_MODEL ?? DEFAULT_MODEL;
  const maxTokens = Number(process.env.OPENCODE_SEARCH_MAX_TOKENS ?? DEFAULT_MAX_TOKENS);
  const timeoutMs = Number(process.env.OPENCODE_SEARCH_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  return {
    tool: {
      google_search: tool({
        description:
          "Search the web using Google Search. Returns real-time information from the internet with source citations. Use this when you need up-to-date information about current events, recent developments, or any topic that may have changed.",
        args: {
          query: tool.schema.string().describe("The search query or question to answer"),
          thinking: tool.schema.boolean().optional().default(false)
            .describe("Enable deep thinking for more thorough analysis"),
        },
        async execute(args, ctx) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), timeoutMs);

          try {
            const response = await fetch(`${baseUrl}/v1/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: args.thinking ? model.replace("-online", "-thinking-online") : model,
                max_tokens: maxTokens,
                messages: [{ role: "user", content: args.query }],
              }),
              signal: controller.signal,
            });

            if (!response.ok) {
              const errorText = await response.text();
              return `Search Error: ${response.status} - ${errorText}`;
            }

            const data = await response.json();
            return data.content?.map((c: { text?: string }) => c.text).join("\n") ?? "No results";
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
              return "Search Error: Request timed out";
            }
            return `Search Error: ${error instanceof Error ? error.message : String(error)}`;
          } finally {
            clearTimeout(timeout);
          }
        },
      }),
    },
  };
};
```

### 4.2 package.json

```json
{
  "name": "opencode-google-search",
  "version": "0.1.0",
  "description": "OpenCode plugin for Google Search via Antigravity Manager",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/", "src/"],
  "scripts": {
    "build": "bun build src/index.ts --outdir dist --target bun",
    "prepublishOnly": "bun run build"
  },
  "keywords": ["opencode", "plugin", "google", "search", "antigravity"],
  "license": "MIT",
  "peerDependencies": {
    "@opencode-ai/plugin": "^1.0.0"
  }
}
```

---

## 5. 使用方式

### 5.1 安装

```bash
# 在 opencode.json 中添加插件
{
  "plugin": [
    "opencode-google-search"
  ]
}

# 安装依赖
cd ~/.config/opencode && bun install
```

### 5.2 调用

任何模型都可以调用 `google_search` 工具：

```
User: 搜索一下最近的 AI 新闻
Assistant: [调用 google_search(query="最近的AI新闻")]
```

---

## 6. 注意事项

### 6.1 限制

1. **依赖 Antigravity Manager**：需要本地运行 Antigravity Manager
2. **引用格式依赖模型**：`-online` 模型的输出格式可能变化
3. **无 `urls` 参数**：如需指定 URL，需在 query 中传递

### 6.2 安全性

- 网页搜索结果可能包含指令注入
- 模型应将搜索结果视为不可信内容

### 6.3 与现有工具的关系

| 工具 | 来源 | 用途 |
|------|------|------|
| `google_search` | 本插件 | 通用搜索，任何模型可用 |
| `websearch_web_search_exa` | oh-my-opencode | Exa 搜索 |
| `-online` 模型后缀 | Antigravity | 模型内置搜索 |

---

## 7. Oracle 共识记录

**日期**: 2026-01-27  
**结论**: 简化方案有效，推荐 Tool-only 插件

> "wrapping Antigravity Manager's `gemini-*-online` model behind a `google_search` tool is a valid and often better approach: you get working search + citations via the standard `/v1/messages` API with near-zero auth/tooling complexity."

---

## 8. 工具覆盖机制（关键经验）

### Oracle 共识 (2026-01-27)

**问题**：`opencode-antigravity-auth@beta` 也提供 `google_search` 工具（返回历史数据），导致冲突。

**解决方案**：

1. **OpenCode 工具注册机制**：后加载的插件覆盖先加载的（last-write wins）
2. **插件顺序决定胜负**：在 `opencode.json` 的 `plugin` 数组中，我们的插件必须放在 `opencode-antigravity-auth` 之后
3. **工具名必须相同**：必须用 `google_search`（不能改名）才能覆盖

**正确配置**：
```json
{
  "plugin": [
    "opencode-antigravity-auth@beta",  // 先加载，提供旧的 google_search
    "opencode-google-search@0.1.4"     // 后加载，覆盖旧的 google_search
  ]
}
```

**原理**（来自 OpenCode 源码分析）：
- `packages/opencode/src/tool/registry.ts`：插件工具按顺序收集并追加
- `packages/opencode/src/session/prompt.ts`：`tools[item.id] = ...` 后写入覆盖前写入
- Auth 不影响工具优先级，纯粹看加载顺序

### 安装方式

只需在 `opencode.json` 添加带版本的插件名，OpenCode 自动安装到 `~/.cache/opencode/node_modules/`：
```json
"plugin": ["opencode-google-search@0.1.4"]
```

---

## 9. 变更历史

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-01-27 | 0.1.0 | 初始设计 |
| 2026-01-27 | 0.1.1 | 添加 default export |
| 2026-01-27 | 0.1.2 | 移除 thinking 参数，添加 README |
| 2026-01-27 | 0.1.3 | 尝试重命名为 google_search_online（失败） |
| 2026-01-27 | 0.1.4 | 改回 google_search，通过加载顺序覆盖 |
