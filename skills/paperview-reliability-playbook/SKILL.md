---
name: paperview-reliability-playbook
description: PaperView Zotero plugin reliability playbook. Use when working on plugin startup/init failures, menu registration issues, preferences pane behavior, or regression-prone integration fixes.
---

# PaperView Reliability Playbook

## Scope

- Use this skill for complex Zotero plugin reliability issues in PaperView.
- Focus on reproducible diagnosis, stable initialization order, and regression guards.

## Standard Workflow

1. Confirm installed XPI version and package contents first.
2. Reproduce with Zotero developer log enabled.
3. Isolate root cause by layer:
   - packaging/version mismatch
   - bootstrap/module load order
   - UI/menu injection timing
   - prefs pane initialization/binding
4. Implement smallest robust fix.
5. Verify with tests and `bash scripts/build_xpi.sh`.
6. Record case outcomes in this skill when strategy changes.

## Case 1: Right-Click Menu Not Appearing

- Trigger:
  - After bootstrap modularization, Tools menu worked but item context menu did not show PaperView entries.
- Symptoms:
  - Plugin installed and started, but right-click actions were missing.
  - In some runs source code had menu enabled while installed XPI still had old disabled flag.
- Root cause:
  - Stale XPI packaging/version mismatch caused old code to remain installed.
  - Context menu lifecycle is rebuilt by Zotero; one-time static injection is fragile.
- Fix strategy:
  - Rebuild and reinstall the current XPI before further diagnosis.
  - Ensure menu setup runs during startup and window load.
  - Keep menu injection resilient to popup lifecycle.
- Validation:
  - Confirm plugin manager version matches local `manifest.json`.
  - Confirm right-click items and Tools entries both appear.
- Regression guardrails:
  - After edits always run `bash scripts/build_xpi.sh`.
  - Log key init steps in bootstrap and plugin startup paths.

## Case 2: Settings Panel Defaults Blank

- Trigger:
  - PaperView settings pane loaded, but default values were blank even though prefs existed.
- Symptoms:
  - Fields displayed empty; save still worked.
  - Startup logs showed default seeding ran but UI still did not reflect values.
- Root cause:
  - Implicit prefs binding was inconsistent for this pane flow.
  - Empty/invalid pref values and timing differences caused values not to render predictably.
- Fix strategy:
  - Use explicit pane controller init (`Zotero.PaperViewPrefsPane.init(window)`).
  - Programmatically read/normalize/write values and bind Save/Reset commands.
  - Use minimal known-good pane first, then incrementally restore full fields.
- Validation:
  - Log contains `preferences pane initialized`.
  - Defaults are visible on first open and persist after restart.
- Regression guardrails:
  - Keep a UI contract test for settings field IDs/onload hook.
  - Keep runtime config resolution tests for precedence and type normalization.

## Quick Commands

- Run tests: `python3 -m unittest discover -s tests -p 'test_*.py'`
- Build plugin: `bash scripts/build_xpi.sh`
