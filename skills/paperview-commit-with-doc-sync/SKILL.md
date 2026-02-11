---
name: paperview-commit-with-doc-sync
description: Handle repository commit requests end-to-end. Use when the user asks phrases like 帮我提交代码 / 提交当前改动 / commit these changes, and ensure git add + git commit are executed after updating CHANGELOG and synchronized bilingual README files.
---

# Paperview Commit With Doc Sync

## Required Workflow

- Apply this workflow when the user asks to submit/commit code.
- Update docs before commit:
  - Keep `CHANGELOG.md` in English only.
  - Keep `README.md` and `README.zh-CN.md` synchronized in content scope.
- Stage changes with `git add`.
- Commit staged changes with `git commit`.

## Commit Flow

1. Inspect working tree with `git status --short`.
2. Review changed files and summarize what will be committed.
3. Update documentation if code behavior/config/usage changed:
   - Edit `CHANGELOG.md` (English only).
   - Edit both `README.md` and `README.zh-CN.md` for parity.
4. Run lightweight validations relevant to changed files.
5. Run `bash scripts/build_xpi.sh` once after edits.
6. Stage files: `git add -A`.
7. Commit:
   - If user provided a message, use it directly.
   - Otherwise create a concise conventional message, e.g. `chore: sync docs and plugin updates`.
8. Report commit hash and key files included.

## Safety Rules

- Do not use destructive git commands (e.g. `reset --hard`).
- Do not amend existing commits unless user explicitly asks.
- If there are unrelated dirty changes, commit only intended files and explain scope.
