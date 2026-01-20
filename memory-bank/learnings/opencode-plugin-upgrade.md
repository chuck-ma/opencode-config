# OpenCode 插件升级指南

**日期**: 2026-01-20  
**场景**: 升级 `opencode-antigravity-auth` 插件

## 1. 查看当前版本

```bash
# 查看 npm registry 上的版本
npm view opencode-antigravity-auth dist-tags --json

# 输出示例：
# {
#   "beta": "1.3.1-beta.0",
#   "latest": "1.3.0"
# }
```

## 2. 查看本地已安装版本

```bash
cat ~/.config/opencode/node_modules/opencode-antigravity-auth/package.json | grep version
```

## 3. 升级插件

```bash
cd ~/.config/opencode

# 安装指定版本（推荐 --save-exact 锁定版本）
npm install opencode-antigravity-auth@1.3.1-beta.0 --save-exact

# 或者安装最新 beta
npm install opencode-antigravity-auth@beta --save-exact
```

## 4. 验证升级成功

```bash
# 检查 package.json 中的依赖版本
cat ~/.config/opencode/package.json | grep antigravity

# 检查实际安装的版本
cat ~/.config/opencode/node_modules/opencode-antigravity-auth/package.json | grep version
```

两者版本一致即为升级成功。

## 5. opencode.json 中的版本标签

在 `~/.config/opencode/opencode.json` 的 `plugin` 数组中：

| 写法 | 行为 |
|------|------|
| `opencode-antigravity-auth@beta` | 跟踪最新 beta 版本 |
| `opencode-antigravity-auth@latest` | 跟踪最新稳定版 |
| `opencode-antigravity-auth@1.3.0` | 锁定指定版本 |

**注意**: `opencode.json` 中的标签只是声明，实际版本由 `package.json` 和 `node_modules` 决定。

## 6. 升级后如遇问题

清除缓存后重试：

```bash
rm -rf ~/.cache/opencode/node_modules ~/.cache/opencode/bun.lock
```

## 7. 相关文件位置

| 文件 | 作用 |
|------|------|
| `~/.config/opencode/opencode.json` | 插件声明（标签） |
| `~/.config/opencode/package.json` | 实际依赖版本 |
| `~/.config/opencode/node_modules/` | 已安装的插件代码 |
| `~/.config/opencode/antigravity.json` | 插件配置 |
