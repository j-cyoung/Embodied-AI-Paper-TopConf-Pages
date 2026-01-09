#!/bin/bash

mkdir -p ./store/llm
model_name=Qwen/Qwen3-30B-A3B-Instruct-2507
# model_name=THUDM/GLM-4-32B-20240424
# model_name=Qwen/Qwen3-Next-80B-A3B-Instruct
# model_name=Qwen/Qwen2.5-72B-Instruct-128K


python llm_enrich.py \
  --model "$model_name" \
  --base_url "https://api.siliconflow.cn/v1" \
  --top_k 5