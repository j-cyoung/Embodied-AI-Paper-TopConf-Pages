# PaperView

## 中文

**项目简介**
PaperView 是一个面向论文检索与批处理的本地流水线项目，集成 Zotero 插件用于选中文献发起查询，并在本地服务中完成 OCR、LLM 查询与结果可视化。

**功能概览**
- Zotero 右键菜单 `Query` / `Concat Query` / `OCR Cache`
- 可选查询章节（如 `abstract`、`introduction`、`methods`）
- 不指定章节时默认查询全文（`full_text`）
- 右键操作会自动启动后台服务（若当前未运行）
- 查询输入支持多行文本（换行保留）
- 进度条展示查询状态
- 结果页面支持 Markdown 渲染/原文切换
- 结果页面支持历史查询切换、删除单条、清空历史
- OCR 缓存与增量更新（复用已生成结果）
- OCR 默认并行执行，支持配置并发度

**环境要求**
- macOS
- Zotero 8.x
- Python 3.10+（用于插件创建 venv）
- LLM API Key（`SILICONFLOW_API_KEY` 或 `OPENAI_API_KEY`）

**快速开始**
1. 打包插件并安装
```bash
./scripts/build_xpi.sh
```
2. 在 Zotero 插件管理器中拖入 `paperview-query.xpi` 安装并重启
3. 设置服务地址：Zotero 顶部菜单 `Tools` → `PaperView: Set Service URL`
   例如：`http://127.0.0.1:20341`
4. 设置 API Key：`Tools` → `PaperView: Set API Key`
5. （可选）手动启动服务：`Tools` → `PaperView: Start Service`
6. 在 Zotero 文献列表中右键选择 `Query` / `OCR Cache` 发起任务（若服务未启动会自动拉起）

**查询输入格式**
- 支持多行输入（可直接换行，`Ctrl/Cmd + Enter` 提交）
- 直接输入问题（默认全文）：
  `请总结方法`
- 指定章节：
  `[method] 总结方法`
  `[abstract,introduction] 请翻译成英文`

**章节名称示例**
- `abstract` / `摘要`
- `introduction` / `引言`
- `related_work` / `background` / `相关工作`
- `methods` / `method` / `approach` / `方法`
- `experiments` / `evaluation` / `results` / `实验`
- `conclusion` / `discussion` / `总结`
- `full_text` / `全文` / `全部`

**数据与结果路径**
- `store/zotero/items.jsonl`：Zotero 元信息快照
- `store/zotero/items.csv`：OCR 输入
- `store/zotero/ocr/papers.pages.jsonl`：OCR 输出
- `store/zotero/query/<job_id>/`：查询结果与中间文件

**OCR 流程**
```bash
./scripts/ocr_from_zotero.sh
```
输出：`store/zotero/ocr/papers.pages.jsonl`

**结果可视化**
- 查询完成后自动打开 `http://127.0.0.1:20341/result/<job_id>`
- 历史查询页面：`http://127.0.0.1:20341/query_view.html`
- 回答支持 Markdown 渲染/原文切换查看
- 历史支持删除当前记录与清空全部记录

**配置项**
- 服务地址：`Tools` → `PaperView: Set Service URL`
- 本地服务端口：`local_service.py --port <PORT>`（默认 20341）

**API Key（推荐用插件设置）**
- Zotero 菜单：`Tools` → `PaperView: Set API Key`

**LLM 配置（文件 + 菜单）**
- Zotero 菜单：`Tools` → `PaperView: LLM Settings`
- 配置文件：`<ZoteroProfile>/paperview/llm_config.json`
- 可配置 `ocr_concurrency`（OCR 并发度，默认 `4`）

**支持的 API 风格**
- OpenAI-compatible Chat Completions（`/chat/completions`）

**插件日志（Profile 目录）**
- 服务输出：`<ZoteroProfile>/paperview/logs/service.log`
- 环境安装：`<ZoteroProfile>/paperview/logs/env-install.log`
- pip 详细日志：`<ZoteroProfile>/paperview/logs/pip-install.log`

**常见问题**
- 端口被占用：`lsof -nP -iTCP:20341 -sTCP:LISTEN` 后 `kill <PID>`
- 浏览器未自动打开：检查服务是否运行、端口是否一致
- 查询进度不更新：确认 `local_service.py` 与 `query_papers.py` 已更新
- OCR 看起来变慢：检查 `service.log` 是否出现 `switch force-serial mode`（并发错误触发后会降级串行）

**许可证**
- MIT License（见 `LICENSE`）

**项目说明**
- 本项目诞生于我对文献进行批量查询的需求（比如查询每篇文章使用了什么样的算力等），用于前期的文献调研、文献综述（帮老师写本子）等任务。完全通过vibe coding开发，随缘更新与迭代～

---

## English

**Overview**
PaperView is a local pipeline for paper retrieval and batch analysis. It integrates a Zotero plugin to trigger queries, runs OCR and LLM querying in a local service, and visualizes results in a web page.

**Key Features**
- Zotero context menu `Query` / `Concat Query` / `OCR Cache`
- Optional section targeting (`abstract`, `introduction`, `methods`)
- Defaults to full text (`full_text`) when no section is specified
- Right-click actions auto-start backend service when needed
- Multi-line query input support
- Progress window during query
- Result page supports Markdown rendered/raw toggle
- History page supports switch/delete/clear
- OCR caching with incremental updates
- OCR runs in parallel by default with configurable concurrency

**Requirements**
- macOS
- Zotero 8.x
- Python 3.10+ (used for plugin venv)
- LLM API Key (`SILICONFLOW_API_KEY` or `OPENAI_API_KEY`)

**Quick Start**
1. Build and install the plugin
```bash
./scripts/build_xpi.sh
```
2. Drag `paperview-query.xpi` into Zotero’s Add-ons manager and restart
3. Set the service URL in Zotero: `Tools` → `PaperView: Set Service URL`
   Example: `http://127.0.0.1:20341`
4. Set API Key: `Tools` → `PaperView: Set API Key`
5. (Optional) Start service manually: `Tools` → `PaperView: Start Service`
6. Right-click items and run `Query` / `OCR Cache` (service auto-starts if not running)

**Query Input Format**
- Multi-line input is supported (`Ctrl/Cmd + Enter` to submit)
- Direct question (defaults to full text):
  `Summarize the method`
- With section prefix:
  `[method] Summarize the method`
  `[abstract,introduction] Please translate to English`

**Section Names**
- `abstract`
- `introduction`
- `related_work` / `background`
- `methods` / `method` / `approach`
- `experiments` / `evaluation` / `results`
- `conclusion` / `discussion`
- `full_text` / `all`

**Data Paths**
- `store/zotero/items.jsonl` ingest snapshot
- `store/zotero/items.csv` OCR input
- `store/zotero/ocr/papers.pages.jsonl` OCR output
- `store/zotero/query/<job_id>/` query outputs

**OCR Pipeline**
```bash
./scripts/ocr_from_zotero.sh
```
Output: `store/zotero/ocr/papers.pages.jsonl`

**Visualization**
- Result page: `http://127.0.0.1:20341/result/<job_id>`
- History page: `http://127.0.0.1:20341/query_view.html`
- Markdown rendered/raw toggle for responses
- Delete one history record or clear all history from the history panel

**Configuration**
- Service URL: `Tools` → `PaperView: Set Service URL`
- Service port: `local_service.py --port <PORT>` (default 20341)

**API Key (recommended via plugin)**
- Zotero menu: `Tools` → `PaperView: Set API Key`

**LLM Config (file + menu)**
- Zotero menu: `Tools` → `PaperView: LLM Settings`
- Config file: `<ZoteroProfile>/paperview/llm_config.json`
- `ocr_concurrency` controls OCR worker parallelism (default `4`)

**Supported API Style**
- OpenAI-compatible Chat Completions (`/chat/completions`)

**Plugin Logs (Profile directory)**
- Service output: `<ZoteroProfile>/paperview/logs/service.log`
- Env setup: `<ZoteroProfile>/paperview/logs/env-install.log`
- pip details: `<ZoteroProfile>/paperview/logs/pip-install.log`

**Troubleshooting**
- Port in use: `lsof -nP -iTCP:20341 -sTCP:LISTEN` then `kill <PID>`
- Browser not opening: verify service is running and URL matches
- Progress not updating: ensure `local_service.py` and `query_papers.py` are updated
- OCR looks slow: check `service.log` for `switch force-serial mode` (parallel failures can trigger serial fallback)

**License**
- MIT License (see `LICENSE`)
