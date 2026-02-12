# PaperView Zotero Plugin

Chinese version: [README.zh-CN.md](README.zh-CN.md)

## Demo Behavior

- Adds `Query` / `Concat Query` / `OCR Cache` / `Query History` to Zotero item context menu
- Sends metadata + PDF path to `/ingest`
- Calls `/query` and opens `result_url`
- Shows progress windows (polls `/status/<job_id>`)
- Right-click actions auto-start the local service if it is not running
- `OCR Cache` processes only the currently selected items and incrementally merges results into cache
- Provides runtime diagnostics and connectivity checks from the settings page (`Check Runtime`, `Test Connection`, `Restart Service`)

## Install (build .xpi)

1. From repo root:

```bash
./scripts/build_xpi.sh
```

2. Drag `paperview-query.xpi` into Zotero Add-ons manager

## Requirements

- Zotero 8.x
- Python 3.10+ (available in PATH for venv creation)

## Start/Stop Service (in Zotero)

- Zotero menu: `Tools` -> `PaperView: Start Service` / `PaperView: Stop Service`
- Env bootstrap runs automatically after install (first run may take time)
- Service stops automatically when Zotero quits
- Query/OCR/History right-click actions will auto-start service when needed

## Python Environment Location

- venv path: `<ZoteroProfile>/paperview/venv`

## Settings Pane (Zotero Settings -> PaperView)

- Open `Zotero Settings` and select `PaperView`
- Configure `Service Base URL`, `API Key`, `LLM Base URL`, `Model`, and runtime parameters
- Click `Save` after changes
- Use `Check Runtime` to verify runtime visibility and key source
- Use `Test Connection` to validate `base_url` / `model` / `api_key` against the remote API
- Use `Restart Service` to apply changes immediately when the local service is running

## LLM Config (settings + file)

- Settings source of truth: `Zotero Settings` -> `PaperView`
- Config file: `<ZoteroProfile>/paperview/llm_config.json` (auto-generated from saved settings)

## LLM Config Fields

- `base_url`
- `model`
- `api_key`
- `temperature`
- `max_output_tokens`
- `concurrency`
- `retry_on_429`
- `retry_wait_s`
- `ocr_concurrency` default is `4`, used by OCR (PDF->MD) worker concurrency

## Supported API Style

- OpenAI-compatible Chat Completions (`/chat/completions`)

## Logs (for debugging)

- Service: `<ZoteroProfile>/paperview/logs/service.log`
- Env setup: `<ZoteroProfile>/paperview/logs/env-install.log`
- pip details: `<ZoteroProfile>/paperview/logs/pip-install.log`

## Manual Start (optional)

```bash
python service/local_service.py --port 20341
```

## Query Input Format

- Default full text: `Summarize the method`
- With section prefix: `[method] Summarize the method`
- Multi-line input is supported (`Ctrl/Cmd + Enter` to submit, `Esc` to cancel)

## Result Page Enhancements

- Response supports Markdown rendered/raw toggle
- History page supports deleting current record and clearing all history
