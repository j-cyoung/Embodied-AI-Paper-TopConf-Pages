#!/bin/bash

# 用途：批量翻译论文摘要与引言（基于 OCR->Markdown 抽取的内容）
# 依赖：已生成 ./store/ocr/papers.pages.jsonl
#
# 可通过环境变量覆盖参数：
#   MODEL_NAME / BASE_URL / CONCURRENCY / MAX_OUTPUT_TOKENS / MAX_SECTION_LENGTH
#   FILTER_TITLE / TOP_K / OUT_DIR

prompt="$(cat <<'PROMPT'
请将提供的论文【摘要（ABSTRACT）】与【引言（INTRODUCTION）】翻译成中文，并严格按以下格式输出：

### 摘要（中文）
- 仅输出中文翻译，忠实原意
- 保留原文中的公式/符号/变量（如 x, f(·), $\nabla$）
- 保留引用标记（如 [12]、(Smith et al., 2023)）
- 专有名词/方法名首次出现：中文（English）

### 引言（中文）
- 仅输出中文翻译，忠实原意
- 结构尽量对应原文段落（可用空行分段）
- 如未提供 INTRODUCTION 内容，请输出：未找到引言内容

不要添加额外总结、评价或扩展内容。
PROMPT
)"

model_name="${MODEL_NAME:-Qwen/Qwen3-Next-80B-A3B-Instruct}"
base_url="${BASE_URL:-https://api.siliconflow.cn/v1}"
concurrency="${CONCURRENCY:-5}"
max_output_tokens="${MAX_OUTPUT_TOKENS:-8192}"
max_section_length="${MAX_SECTION_LENGTH:-12000}"
filter_title="${FILTER_TITLE:-}"
top_k="${TOP_K:-0}"
out_dir="${OUT_DIR:-./store/query/translation/abs_intro}"

mkdir -p "$out_dir"

extra_args=()
if [[ -n "$filter_title" ]]; then
  extra_args+=(--filter_title "$filter_title")
fi
if [[ "$top_k" != "0" ]]; then
  extra_args+=(--top_k "$top_k")
fi

uv run python query_papers.py \
  --pages_jsonl ./store/ocr/papers.pages.jsonl \
  --base_output_dir "$out_dir" \
  --out_jsonl papers.abs_intro.trans.jsonl \
  --out_csv papers.abs_intro.trans.csv \
  --out_md papers.abs_intro.trans.md \
  --sections abstract,introduction \
  --filter_title "data" \
  --question "$prompt" \
  --max_section_length "$max_section_length" \
  --max_output_tokens "$max_output_tokens" \
  --model "$model_name" \
  --base_url "$base_url" \
  --resume \
  --resume_from "${out_dir}/papers.abs_intro.trans.jsonl" \
  --retry_on_429 \
  --concurrency "$concurrency" \
  "${extra_args[@]}"
