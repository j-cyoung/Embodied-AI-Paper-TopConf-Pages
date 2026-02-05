#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from paper_utils import load_jsonl  # noqa: E402
from query_papers import _normalize_heading_candidate, _is_probably_heading_line  # noqa: E402


def iter_heading_candidates(paper, max_per_paper: int):
    md_pages = paper.get("md_pages") or []
    count = 0
    for page in md_pages:
        text = page.get("text") or ""
        page_no = (page.get("metadata") or {}).get("page")
        for line in text.splitlines():
            raw = line.strip()
            if not raw:
                continue
            norm = _normalize_heading_candidate(raw)
            if not norm:
                continue
            if not _is_probably_heading_line(raw, norm):
                continue
            yield raw, norm, page_no
            count += 1
            if max_per_paper and count >= max_per_paper:
                return


def main():
    ap = argparse.ArgumentParser(description="Extract heading candidates from OCR jsonl")
    ap.add_argument("--pages_jsonl", default="./store/ocr/papers.pages.jsonl")
    ap.add_argument("--out_csv", default="./store/ocr/heading_candidates.csv")
    ap.add_argument("--out_md", default="./store/ocr/heading_summary.md")
    ap.add_argument("--top_k", type=int, default=80, help="summary top K headings")
    ap.add_argument("--max_examples", type=int, default=3, help="examples per heading")
    ap.add_argument("--max_per_paper", type=int, default=0, help="max candidates per paper (0=all)")
    args = ap.parse_args()

    rows = load_jsonl(args.pages_jsonl)
    if not rows:
        raise SystemExit(f"No rows found in {args.pages_jsonl}")

    out_csv = Path(args.out_csv)
    out_csv.parent.mkdir(parents=True, exist_ok=True)

    out_rows = []
    counter = Counter()
    examples = defaultdict(list)

    for paper in rows:
        paper_id = paper.get("paper_id") or paper.get("zotero_item_key") or ""
        title = paper.get("title") or ""
        for raw, norm, page_no in iter_heading_candidates(paper, args.max_per_paper):
            out_rows.append({
                "normalized": norm,
                "raw_line": raw,
                "paper_id": paper_id,
                "title": title,
                "page": page_no,
            })
            counter[norm] += 1
            if len(examples[norm]) < args.max_examples:
                examples[norm].append(raw)

    with out_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["normalized", "raw_line", "paper_id", "title", "page"],
        )
        writer.writeheader()
        writer.writerows(out_rows)

    out_md = Path(args.out_md)
    out_md.parent.mkdir(parents=True, exist_ok=True)
    lines = []
    lines.append("# Heading Candidates Summary\n\n")
    lines.append(f"Total candidates: {len(out_rows)}\n\n")
    lines.append(f"Unique headings: {len(counter)}\n\n")
    lines.append("## Top Headings\n\n")
    for norm, cnt in counter.most_common(args.top_k):
        lines.append(f"- {norm} · {cnt}\n")
        for ex in examples.get(norm, []):
            lines.append(f"  - {ex}\n")
    out_md.write_text("".join(lines), encoding="utf-8")

    print(f"Wrote CSV: {out_csv}")
    print(f"Wrote MD: {out_md}")


if __name__ == "__main__":
    main()
