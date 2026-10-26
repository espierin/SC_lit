import unittest

from scripts.preprint_screen import jats_sections, score, screen
from unittest.mock import patch
import datetime as dt


class ScreeningTests(unittest.TestCase):
    def test_relevance_uses_abstract_and_context(self):
        points, topics = score({"title": "HLA-E in transplantation", "abstract": "NK cell recognition after allograft"})
        self.assertGreater(points, 0)
        self.assertIn("transplantation", topics)
        self.assertEqual(score({"title": "Computer vision", "abstract": "Image classification"})[0], 0)

    def test_jats_requires_real_sections_and_captions(self):
        raw = b'<article><body><sec><title>Results</title><p>Observed signal.</p></sec><sec><title>Materials and Methods</title><p>Sampling.</p></sec><fig><caption><p>Figure one.</p></caption></fig></body></article>'
        sections, figures = jats_sections(raw)
        self.assertEqual([s["title"] for s in sections], ["Results", "Materials and Methods"])
        self.assertEqual(figures, ["Figure one."])

    @patch("scripts.preprint_screen.full_text", return_value={"status": "readable", "format": "JATS XML"})
    @patch("scripts.preprint_screen.api_records")
    def test_radar_switch_defaults_to_no_nomination(self, records, text):
        records.return_value = [{"doi": "10.64898/2026.10.09.757444", "title": "HLA-E transplantation",
                                 "abstract": "Immune monitoring of an allograft", "version": "1", "date": "2026-10-16"}]
        with patch("scripts.preprint_screen.time.sleep"):
            off = screen(dt.date(2026, 10, 26), 1, 1, False)
            on = screen(dt.date(2026, 10, 26), 1, 1, True)
        self.assertIsNone(off["radar_candidate"])
        self.assertEqual(on["radar_candidate"], "10.64898/2026.10.09.757444")


if __name__ == "__main__":
    unittest.main()
