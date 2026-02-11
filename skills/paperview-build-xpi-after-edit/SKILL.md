---
name: paperview-build-xpi-after-edit
description: Automatically package the Zotero plugin XPI after code edits in this repository. Use when tasks modify files and require a post-edit verification build by running bash scripts/build_xpi.sh before finishing.
---

# Paperview Build XPI After Edit

## Rule

- After completing any file edit, run exactly once from repo root: `bash scripts/build_xpi.sh`.
- Treat build failure as blocking: report the error and do not claim completion until resolved or explicitly accepted by the user.

## Scope

- Apply to edit tasks in this repository.
- Skip only when no files were changed or when the user explicitly asks not to build.

## Output

- Include whether the build passed.
- If passed, mention generated artifact: `paperview-query.xpi`.
