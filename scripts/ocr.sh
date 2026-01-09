#!/bin/bash

mkdir -p ./store/ocr

python pdf_to_md_pymupdf4llm.py \
    --csv_in ./store/enrich/papers.enriched.csv \
    --pdf_dir ./store/enrich/pdfs \
    --page_chunks