# 当前状态

## 当前上下文
我们正在配置并记录 OpenCode 设置。已完成指南更新和配置文件的版本控制。

## 最近进展
- **opencode-google-search 插件开发 (2026-01-27)**：
  - 设计并实现了 `opencode-google-search` 插件，包装 Antigravity Manager 的 `-online` 模型
  - 核心思路：利用 `gemini-3-flash-online` 模型内置的 Google Search Grounding
  - 比参考实现 (`opencode-google-antigravity-auth`) 简化 90%：无需 OAuth、无需原生 `googleSearch` 工具注入
  - 发布到 npm: `opencode-google-search@0.1.4`
  - 设计文档: `docs/design-google-search-plugin.md`
  - **关键经验**：OpenCode 工具覆盖机制是 **后加载覆盖先加载**
    - 必须把插件放在 `opencode-antigravity-auth` 之后
    - 工具名必须保持 `google_search` 才能覆盖
    - 安装方式：只需在 `opencode.json` 添加 `"opencode-google-search@0.1.4"`，自动安装
- **Librarian 搜索配置 (2026-01-26)**：
  - 为 `librarian` agent 禁用 Exa 搜索工具 (`websearch_web_search_exa: false`)。
  - 配置后 librarian 使用 Google Search（通过 `google_search` 工具或 `-online` 模型的 Grounding）。
  - 关键发现：`opencode run --model=X` 不走 agent 配置，必须用 `--agent=X`。
  - 更新 `learnings/antigravity-v1.3-features.md` 记录搜索配置、Thinking 模式、per-agent 工具限制。
- **配置更新 (2026-01-26)**：
  - 为 `cliproxy` 模型补充 `modalities` 配置（text/image 输入，text 输出）。
- **初始化**：完成 Memory Bank 结构初始化。
- **配置同步**：
  - 将用户本地的 `~/.config/opencode/` 核心配置文件复制到项目根目录。
  - 执行安全扫描，确保无敏感信息。
- **文档更新**：
  - 更新 `oh-my-opencode-setup-guide.md`，使用包含 `antigravity-*` 模型的实际配置替换了示例。
- **版本控制**：
  - 提交所有配置文件和文档变更。
  - 推送到远程仓库 `https://github.com/chuck-ma/opencode-config.git`。
- **插件升级 (2026-01-18)**：
  - 升级 `opencode-antigravity-auth` 从 `1.2.8` → `1.3.0`
  - 新增 Google Search Grounding 配置 (`web_search.default_mode: "auto"`)
  - 新增 `keep_thinking: false` 显式配置
  - 配置已同步到 `~/.config/opencode/`
- **配置覆盖本地 (2026-01-18)**：
  - 发现本地 `oh-my-opencode` 插件版本 (`beta.10`) 领先于仓库配置 (`beta.8`)。
  - 先将仓库中的 `opencode.json` 更新为 `beta.10` 以避免回退。
  - 将仓库配置 (`opencode.json`, `oh-my-opencode.json`, `antigravity.json`, `agents/*.md`) 覆盖到 `~/.config/opencode/`。
  - 实现了将 Antigravity 模型配置部署到本机的目标。
- **Agent 配置更新**：
  - `backend-engineer`：启用 `webfetch` 工具，移除严格的页脚提示。
- **文档补充 (2026-01-20)**：
  - 记录 OpenCode 会话管理命令 (`list`, `export`, `TUI`) 到 `learnings/opencode-session-management.md`。
- **插件升级 (2026-01-20)**：
  - 升级 `opencode-antigravity-auth` 从 `1.2.8` → `1.3.1-beta.0`
  - 使用 `npm install opencode-antigravity-auth@1.3.1-beta.0 --save-exact` 在 `~/.config/opencode/` 目录执行
  - `opencode.json` 中使用 `@beta` 标签，会自动跟踪最新 beta 版本
  - 已验证 `node_modules/opencode-antigravity-auth/package.json` 版本为 `1.3.1-beta.0`
- **Agent 权限放宽 (2026-01-20)**：
  - 修改 `agent-engineer` 和 `backend-engineer` 的 `bash` 权限为 `allow` all (即 `"*": allow`)。
  - 同步配置文件到本地 `~/.config/opencode/agent/` 目录。
- **配置同步 (v5.3.0)**：
  - 更新 `opencode.json` 和 `oh-my-opencode-setup-guide.md` 以反映 `memory-bank-skill` 的安装方式变更。
  - 从 `file://...` 本地路径引用改为 npm 包引用 `"memory-bank-skill"`。
  - 已在本地验证安装。

## 当前问题
- 无。

## 下一步
- 这是一个配置仓库，后续如有新配置变更（如新 Agent），需同步更新。
