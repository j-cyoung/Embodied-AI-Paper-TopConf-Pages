import sys
import tempfile
import unittest
from pathlib import Path


SERVICE_DIR = Path(__file__).resolve().parents[1] / "service"
if str(SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVICE_DIR))

import zotero_items_to_csv as z2c  # noqa: E402


class ZoteroItemsToCsvTests(unittest.TestCase):
    def test_normalize_row_maps_core_fields(self):
        item = {
            "item_key": "ABCD1234",
            "title": "Test Driven Plugin Development",
            "url": "https://example.org/paper",
            "doi": "10.1000/test",
            "item_type": "journalArticle",
            "year": "2025",
            "date": "2025-01-01",
            "publication_title": "Journal of Testing",
            "creators": [{"firstName": "Ada", "lastName": "Lovelace"}],
        }
        row = z2c.normalize_row(item)
        self.assertEqual(row["paper_id"], "ABCD1234")
        self.assertEqual(row["arxiv_id"], "ABCD1234")
        self.assertEqual(row["paper_url"], "https://example.org/paper")
        self.assertEqual(row["venue"], "Journal of Testing")
        self.assertTrue(row["source_hash"])

    def test_compute_source_hash_changes_with_file_metadata(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "a.pdf"
            path.write_bytes(b"x" * 2048)
            h1 = z2c.compute_source_hash("K1", "Title", str(path))
            path.write_bytes(b"y" * 3072)
            h2 = z2c.compute_source_hash("K1", "Title", str(path))
            self.assertNotEqual(h1, h2)


if __name__ == "__main__":
    unittest.main()
