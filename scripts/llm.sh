#!/bin/bash

mkdir -p ./store/llm
model_name=Qwen/Qwen3-30B-A3B-Instruct-2507
# model_name=THUDM/GLM-4-32B-0414
# model_name=Qwen/Qwen3-Next-80B-A3B-Instruct
# model_name=Qwen/Qwen2.5-72B-Instruct-128K

# model_list=(
#   "Qwen/Qwen3-30B-A3B-Instruct-2507"
#   "THUDM/GLM-4-32B-0414"
#   "Qwen/Qwen3-Next-80B-A3B-Instruct"
#   "Qwen/Qwen2.5-72B-Instruct-128K"
# )
model_list=(
  "THUDM/GLM-4-32B-0414"
)

for model_name in "${model_list[@]}"
do
  echo "Processing model: $model_name"
  base_output_dir=./store/llm/${model_name}
  mkdir -p ${base_output_dir}
  python llm_enrich.py \
    --model "$model_name" \
    --base_output_dir "$base_output_dir" \
    --base_url "https://api.siliconflow.cn/v1" \
    --concurrency 20 \
    --top_k 20
done