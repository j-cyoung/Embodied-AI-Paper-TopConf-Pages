## PaperView 脚本说明（中文）

本项目是一条“解析 → 丰富元信息与下载 PDF → PDF 转 Markdown → 审计”的流水线。下面逐一说明每个文件的功能、输入输出与主要参数。

---

### 1) `parse_paperlist.py`
**功能**  
解析 `paper_list.md`（或任意论文列表 Markdown）中的论文条目，抽取基础字段（标题、链接、会议/类别等），并输出结构化结果。

**输入**  
- `paper_list.md`（或自定义 Markdown 文件）

**输出**  
- `papers.csv`：结构化表格  
- `papers.jsonl`：逐行 JSON  
- `papers.parse_issues.jsonl`：解析问题记录（可选）

**关键字段**  
- `paper_id`：稳定的条目 ID（由标题/链接等生成）  
- `source_hash`：行内容哈希（用于增量判断）  
- `venue` / `category` / `title` / `paper_url` / `page_url`  
- `parse_status` / `parse_error`

**常用参数**  
```
python parse_paperlist.py paper_list.md \
  --out_csv papers.csv \
  --out_jsonl papers.jsonl \
  --issues_out papers.parse_issues.jsonl \
  --resume
```

**增量规则（resume）**  
- 若 `paper_id` 存在且 `source_hash` 未变化、历史状态 `ok`，直接复用。
- 否则重新解析该条目。

---

### 2) `enrich_papers.py`
**功能**  
基于 `papers.csv` 中的条目，检索摘要/作者/DOI/arXiv 等元信息，并按需下载 PDF。

**输入**  
- `papers.csv`（来自 parse 阶段）

**输出**  
- `papers.enriched.csv` / `papers.enriched.jsonl`  
- `papers.enrich_issues.csv`：异常/缺失记录  
- `pdfs/`：下载的 PDF 文件（可选）

**关键字段**  
- `abstract` / `authors` / `published` / `doi` / `arxiv_id`  
- `pdf_url` / `pdf_path` / `pdf_download_status` / `pdf_download_error`  
- `status` / `error`

**常用参数**  
```
python enrich_papers.py papers.csv \
  --out_csv papers.enriched.csv \
  --out_jsonl papers.enriched.jsonl \
  --download_pdf \
  --pdf_dir pdfs \
  --resume
```

**增量规则（resume）**  
- `paper_id` + `source_hash` 未变化且状态 `ok`，直接复用。  
- 若 `--download_pdf` 且历史 PDF 已存在并有效，则跳过下载。  
- 若状态非 `ok` 或内容变化，则重新检索。

---

### 3) `pdf_to_md_pymupdf4llm.py`
**功能**  
将已下载的 PDF 转换为 Markdown，并写出按页的 JSONL 结果，支持断点续跑。

**输入**  
- `papers.enriched.csv`（包含 `pdf_path`/`arxiv_id`/`title` 等信息）

**输出**  
- `mds/`：每篇论文一个 `.md`  
- `papers.pages.jsonl`：逐行 JSON（含 `md_pages` 或 `md_text`）  
- `papers.md_issues.csv`：转换问题列表

**关键字段**  
- `pdf_path` / `md_path`  
- `md_status` / `md_error`  
- `md_pages`（按页文本）或 `md_text`（整篇）

**常用参数**  
```
python pdf_to_md_pymupdf4llm.py \
  --csv_in papers.enriched.csv \
  --pdf_dir pdfs \
  --md_dir mds \
  --out_jsonl papers.pages.jsonl \
  --resume
```

**增量规则（resume）**  
- 如果历史记录 `md_status=ok` 且 Markdown 文件存在，则跳过该条目。  
- 若条目变化或失败，重新转换。

---

### 4) `audit_papers.py`
**功能**  
对全流程结果进行检查，定位缺 PDF、缺 Markdown、JSONL 不完整等问题。

**输入**  
- `papers.enriched.csv`  
- `papers.pages.jsonl`  
- `pdfs/` 与 `mds/`

**输出**  
- `audit_report.csv`：详细审计结果

**常用参数**  
```
python audit_papers.py \
  --csv_in papers.enriched.csv \
  --pages_jsonl papers.pages.jsonl \
  --pdf_dir pdfs \
  --md_dir mds \
  --out_csv audit_report.csv
```

---

### 5) `paper_utils.py`
**功能**  
公共工具函数（ID 计算、CSV/JSONL 读写、PDF/MD 路径匹配等），用于避免重复逻辑。

**核心接口**  
- `compute_paper_id(...)`：稳定条目 ID  
- `compute_source_hash(...)`：行内容变化检测  
- `find_pdf_for_row(...)`：PDF 文件查找  
- `md_path_for_row(...)`：Markdown 输出路径

---

## 数据流建议顺序
```
python parse_paperlist.py paper_list.md --resume
python enrich_papers.py papers.csv --download_pdf --resume
python pdf_to_md_pymupdf4llm.py --csv_in papers.enriched.csv --resume
python audit_papers.py --csv_in papers.enriched.csv --pages_jsonl papers.pages.jsonl
```

如需我补充更细的字段释义或输出样例，请告诉我。  
