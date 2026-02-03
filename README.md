## PaperView

这是一个简单的论文处理流水线项目：从论文列表解析元信息，检索摘要与下载 PDF，PDF 转 Markdown，抽取算力线索，并用 LLM 做翻译与结构化总结。

访问 https://j-cyoung.github.io/Embodied-AI-Paper-TopConf-Pages/ 查看可视化结果

### 数据来源声明
本项目的论文列表基于：  
https://github.com/Songwxuan/Embodied-AI-Paper-TopConf

### 项目定位
- 论文可视化 pipeline（用于快速整理与分析）
- 面向批量处理与增量更新（支持 resume）

### 核心脚本
- `parse_paperlist.py`：解析论文列表 Markdown，生成结构化 CSV/JSONL
- `enrich_papers.py`：补全元信息并下载 PDF
- `pdf_to_md_pymupdf4llm.py`：PDF 转 Markdown
- `extract_compute_from_pages.py`：从 Markdown 中提取算力相关线索
- `llm_enrich.py`：LLM 翻译摘要 + 结构化算力总结
- `query_papers.py`：基于论文内容进行LLM查询（支持指定章节）

### 一键查询功能

`query_papers.py` 支持对论文进行智能查询，可以指定论文的不同章节（如 abstract、introduction、methods 等），然后通过 LLM 回答你的问题。

#### 功能特点
- ✅ 支持指定论文的不同部分和组合（abstract、introduction、methods、experiments、conclusion 等）
- ✅ 章节名称支持模糊搜索（如 "related work" 可匹配 "Related Work"、"Preliminary"、"Background" 等）
- ✅ 大小写不敏感
- ✅ **支持按标题关键字筛选论文**（如：`--filter_title data` 只查询标题包含 "data" 的论文）
- ✅ 支持限制查询数量，避免消耗过多 API 金额
- ✅ 支持 resume 模式，可从中断处继续
- ✅ 自动提取章节内容并构造 prompt
- ✅ **输出多种格式**：JSONL、CSV 和 Markdown

#### 使用方法

**使用 Python 脚本：**
```bash
# 查询 abstract 和 introduction 章节
python query_papers.py \
    --sections abstract,introduction \
    --question "这篇论文的主要贡献是什么？" \
    --top_k 5

# 按标题关键字筛选 + 查询 methods 章节
python query_papers.py \
    --sections methods \
    --question "这篇论文使用了什么方法？" \
    --filter_title data \
    --top_k 10

# 继续之前的查询（resume 模式）
python query_papers.py \
    --sections abstract \
    --question "..." \
    --resume
```

**使用 Shell 脚本（简单示例）：**
```bash
# 直接运行脚本（修改脚本中的参数）
./scripts/query.sh
```

#### 支持的章节名称
- `abstract` / `摘要`
- `introduction` / `引言`
- `related_work` / `related work` / `preliminary` / `background` / `相关工作`
- `methods` / `method` / `methodology` / `approach` / `方法`
- `experiments` / `experiment` / `evaluation` / `results` / `实验`
- `conclusion` / `conclusions` / `discussion` / `总结`

#### 输出文件
- `papers.query.jsonl`：完整的查询结果（JSONL 格式）
- `papers.query.csv`：查询结果摘要（CSV 格式，便于查看）
- `papers.query.md`：**Markdown 格式报告**（便于阅读和分享）
- `papers.query_issues.csv`：错误报告（如有）

#### 注意事项
- 需要设置 API 密钥：通过环境变量 `SILICONFLOW_API_KEY` 或 `OPENAI_API_KEY`，或使用 `--api_key` 参数
- 默认使用 `Qwen/Qwen2.5-72B-Instruct` 模型，可通过 `--model` 参数修改
- 建议先用 `--top_k` 参数测试少量论文，确认效果后再批量查询
- 使用 `--resume` 可以从中断处继续，避免重复查询已处理的论文
- 使用 `--filter_title` 可以按标题关键字筛选论文，减少不必要的 API 调用

