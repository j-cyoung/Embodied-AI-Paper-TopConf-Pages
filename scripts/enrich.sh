#!/bin/bash
mkdir -p ./store/enrich
mkdir -p ./store/enrich/pdfs
python enrich_papers.py ./store/parse/papers.csv --download_pdf