---
name: paperview-zotero-storage
description: Enforce PaperView Zotero pipeline storage rules. Use when working on Zotero ingest, OCR, query, or visualization so all read/write paths stay under store/zotero and do not mix with legacy store/ workflows.
---

# Paperview Zotero Storage

## Overview

Keep the Zotero workflow isolated under store/zotero so it never mixes with legacy store/ outputs.

## Rules

- Always read/write Zotero pipeline data under `store/zotero/`.
- Never write to legacy paths like `store/ocr/`, `store/query/`, or `store/enrich/` unless explicitly asked.
- If a request implies using legacy outputs, ask for confirmation before touching `store/`.
- If new outputs are introduced, create them under `store/zotero/<stage>/`.

## Canonical Paths

- `store/zotero/items.jsonl` ingest snapshot (overwrite by default).
- `store/zotero/items.csv` OCR input.
- `store/zotero/ocr/papers.pages.jsonl` OCR output (compatible with existing query pipeline).
- `store/zotero/query/` query outputs (JSONL/CSV/MD/HTML as needed).

## Examples

- OCR: write to `store/zotero/ocr/` and not `store/ocr/`.
- Query results: write to `store/zotero/query/` and not `store/query/`.
- Visualization inputs: read from `store/zotero/query/` or `store/zotero/ocr/`.

## Troubleshooting Notes (Zotero UI)

- If the context menu item appears but is transparent or missing text, avoid `Zotero.MenuManager` + FTL l10n for the item label.
- Preferred fix: inject a XUL `menuitem` directly into `zotero-itemmenu` with a hard `label="Query"` and attach `popupshowing` to toggle visibility.
- Avoid `ChromeUtils.import()` in Zotero 8; use simple `window.prompt` or other APIs that do not require Services modules.
- Keep the frontend prompt minimal (display + input only). Template parsing like `[section] question` should be handled in the backend service to reduce UI-side breakage.
