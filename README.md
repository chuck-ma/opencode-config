# OpenCode Config

This repository tracks a working OpenCode + Oh My OpenCode configuration, including installation notes and example config files. It is intended to keep local config and documentation in sync so updates are reproducible.

## What is included

- Install and setup guide: `oh-my-opencode-setup-guide.md`
- OpenCode config: `opencode.json`
- Oh My OpenCode agent config: `oh-my-opencode.json`
- Antigravity Auth config: `antigravity.json`
- Agent definitions: `agents/`

## Quick start

1. Follow the steps in `oh-my-opencode-setup-guide.md`.
2. Copy the config files into `~/.config/opencode/`.
3. Restart OpenCode to load plugins and agents.

## Sync workflow

- Update local config in `~/.config/opencode/`.
- Mirror the changes into this repo.
- Keep the setup guide aligned with the exact versions and fields.

## Notes

- This repo favors real, working configurations over minimal examples.
- If a plugin or model changes, update both the config file and the guide.
