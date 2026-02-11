import sys
import tempfile
import unittest
from pathlib import Path


SERVICE_DIR = Path(__file__).resolve().parents[1] / "service"
if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

import paper_utils  # noqa: E402


class PaperUtilsTests(unittest.TestCase):
    def test_compute_paper_id_is_stable(self):
        a = paper_utils.compute_paper_id(
            venue="NeurIPS",
            category="ML",
            alias="paper-a",
            title="A Study on Testing",
            paper_url="https://example.com/paper",
            page_url="https://example.com/page",
        )
        b = paper_utils.compute_paper_id(
            venue="NeurIPS",
            category="ML",
            alias="paper-a",
            title="A Study on Testing",
            paper_url="https://example.com/paper",
            page_url="https://example.com/page",
        )
        self.assertEqual(a, b)
        self.assertEqual(len(a), 40)

    def test_find_pdf_prefers_explicit_row_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            pdf_path = Path(tmp) / "explicit.pdf"
            pdf_path.write_bytes(b"x" * 2048)
            row = {"title": "Any", "pdf_path": str(pdf_path)}
            found, reason = paper_utils.find_pdf_for_row(row, tmp)
            self.assertEqual(found, str(pdf_path))
            self.assertEqual(reason, "row_pdf_path")

    def test_find_pdf_uses_exact_expected_name(self):
        with tempfile.TemporaryDirectory() as tmp:
            title = "A practical testing paper"
            arxiv_id = "2401.12345"
            expected = paper_utils.expected_pdf_name(arxiv_id, title)
            expected_path = Path(tmp) / expected
            expected_path.write_bytes(b"x" * 4096)
            row = {"title": title, "arxiv_id": arxiv_id}
            found, reason = paper_utils.find_pdf_for_row(row, tmp)
            self.assertEqual(found, str(expected_path))
            self.assertEqual(reason, "exact_name")


if __name__ == "__main__":
    unittest.main()
