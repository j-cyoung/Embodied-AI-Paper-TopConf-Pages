# Changelog

All notable changes to this project will be documented in this file.

## v0.3.0 - 2026-02-11

**Added**
- OCR 默认并行执行，新增 `ocr_concurrency` 可配置并发度（菜单/配置文件/请求均可覆盖）。
- 查询输入弹窗升级为多行输入（支持换行、`Ctrl/Cmd + Enter` 提交、`Esc` 取消）。
- 结果页支持 Markdown 渲染与原文切换查看。
- 历史查询页支持删除当前记录与清空全部历史（新增 `/history/delete`、`/history/clear`）。
- 右键执行 `Query` / `Concat Query` / `OCR Cache` / `Query History` 时自动探活并拉起后台服务（若未运行）。

**Changed**
- OCR 任务日志更细化，增加线程名、开始/结束、并发重试与串行降级事件日志，便于定位性能与稳定性问题。
- OCR 进度统计逻辑与状态展示增强，状态更新更连续。

**Fixed**
- `full_text` 查询在 `md_pages` 缺失时回退使用 `md_text/abstract`，减少“未找到指定章节: full_text”。
- 多行查询弹窗输入框盒模型修复，避免 textarea 超出外层边框。
- 历史与结果页面交互细节修复（按钮状态、复制行为、加载回退）。

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
