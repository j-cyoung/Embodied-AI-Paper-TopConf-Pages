# Changelog

All notable changes to this project will be documented in this file.

## v0.2.0 - 2026-02-05

**Added**
- Built-in service lifecycle in the Zotero plugin (start/stop, auto-shutdown on exit).
- Automatic Python venv bootstrap and dependency installation on first run.
- LLM configuration file support at `<ZoteroProfile>/paperview/llm_config.json`.
- Menu-based LLM Settings and API Key configuration with write-back to config file.
- Service and environment logs in `<ZoteroProfile>/paperview/logs/`.
- OCR cache and concat query actions in the Zotero context menu.

**Changed**
- Service default port is now `20341`.
- Service and query scripts run via `sys.executable` (no `uv` requirement).
- LLM query parameters are configurable via CLI, config file, or menu.

**Fixed**
- Progress windows now close on query/OCR errors and surface failure messages.
- Chrome registration and file handling updated for Zotero 8 compatibility.

## v0.1.0 - 2026-02-05

**Added**
- Initial Zotero plugin with Query action and progress window.
- Local service endpoints for ingest and query.
- Basic OpenAI-compatible LLM querying with model/base URL options.
