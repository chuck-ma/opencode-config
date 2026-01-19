# OpenCode Config

本仓库用于记录一套可用的 OpenCode + Oh My OpenCode 配置，包括安装说明与示例配置文件，确保本地配置与文档保持一致，便于复现与同步。

## 包含内容

- 安装与配置指南：`oh-my-opencode-setup-guide.md`
- OpenCode 配置：`opencode.json`
- Oh My OpenCode Agent 配置：`oh-my-opencode.json`
- Antigravity Auth 配置：`antigravity.json`
- 自定义 Agent 定义：`agents/`

## 快速开始

1. 按 `oh-my-opencode-setup-guide.md` 完成安装。
2. 将仓库中的配置文件复制到 `~/.config/opencode/`。
3. 重启 OpenCode 以加载插件与 Agent。

## 同步流程

- 先更新 `~/.config/opencode/` 的本地配置。
- 将变更同步到本仓库。
- 确保指南中的版本号与字段与实际配置保持一致。

## 备注

- 本仓库强调“真实可用”的配置，而非最小示例。
- 插件或模型更新时，需同步更新配置文件与指南。
