#!/bin/bash


prompt_v1="请基于本文内容，系统性回答以下问题，并严格按照给定结构输出：

【一、已有工作（Prior Work）】
1. 列出文中明确提到或隐含对比的已有工作（方法 / 框架 / 思路）。
2. 对每一项已有工作，给出：
   - 核心思想 / 技术路线
   - 主要应用场景或解决的问题

【二、已有工作的不足（Limitations）】
对上述每一类已有工作，分别说明：
1. 作者指出的明确问题（若有原文表述，请贴近原意）
2. 隐含但重要的局限性（如：假设过强、泛化性不足、计算开销大、难以扩展等）

【三、本文的不同与改进（This Work vs. Prior Work）】
1. 本文在问题定义上的不同之处
2. 本文在方法/模型设计上的关键创新点
3. 本文如何针对上述不足进行改进（逐条对应）
4. 这些改进带来的直接收益（性能、泛化性、稳定性、可扩展性等）

【四、小结】
用 2–3 句话概括：本文相较已有工作的“本质提升”是什么。

⚠️ 输出要求：
- 使用清晰的小标题
- 每一点尽量对应具体技术细节，避免空泛表述"

prompt_v2="请基于本文内容，对相关研究与本文贡献进行高度凝练的结构化分析，重点用于文献调研与方法对比。请严格按照以下结构输出，但避免冗长罗列。

【1. 相关工作概览（Prior Work Overview）】
从方法范式的角度，总结本文所涉及或对比的已有工作：
- 按“技术路线/方法类型”进行归纳（如：数据生成、仿真、世界模型、检索、扩散、VLA 等）
- 在每一类中，列出代表性方法（尽量给出具体方法名称或原文引用编号）
- 用一句话概括每一类方法的核心思想

【2. 现有方法的共性问题（Key Limitations）】
- 当前论文中，提出已有方法具有什么样的问题？（比如不同技术路线有什么样的区别？或者已有方法有着什么样的局限性？或者在某类场景下存在缺失？等等）

【3. 本文的核心差异与改进（This Work）】
- 说明本文相较于已有工作有哪些核心改进、区别、贡献，解决了已有工作的什么问题？
- 说明本文针对当前领域有哪些重要意义？
- 本文具体做了什么工作来支撑上述改进

【4. 总结性对比（Takeaway）】
- 用 2–3 句话总结：本文相较现有方法，有哪些不同，做了哪些贡献

⚠️ 输出要求：
- 保留方法名称或引用编号以便回溯原文
- 偏重机制与范式差异，避免泛泛的性能描述
- 语言风格接近论文 Introduction / Related Work

"

model_name=Qwen/Qwen3-Next-80B-A3B-Instruct
mkdir -p ./store/query
uv run python query_papers.py \
  --pages_jsonl ./store/ocr/papers.pages.jsonl \
  --base_output_dir ./store/query/comparison \
  --sections abstract,introduction \
  --question "$prompt_v2" \
  --filter_title "data" \
  --max_output_tokens 65536 \
  --top_k 0 \
  --model "$model_name" \
  --base_url "https://api.siliconflow.cn/v1" \
  --retry_on_429 \
  --concurrency 5
