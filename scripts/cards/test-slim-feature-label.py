#!/usr/bin/env python3
"""Run with the card-rendering venv and installed Noto Sans TC fonts."""
import importlib.util
from pathlib import Path
import unittest

loader = importlib.util.spec_from_file_location('composer', Path(__file__).with_name('compose-card.py'))
composer = importlib.util.module_from_spec(loader)
loader.loader.exec_module(composer)


class SlimFeatureLabelTests(unittest.TestCase):
    def test_missing_radar_scores_are_not_zero(self):
        scores = {'i': '', 'a': '3.8', 'r': '1.0', 'c': None, 'v': '0.0'}
        names = [(k, k) for k in ('i', 'a', 'r', 'c', 'v')]
        points = composer.slim_radar_points(scores, names, [0] * 5, 10, 20, 50)
        self.assertEqual(points, [None, (48.0, 20.0), (20.0, 20.0), None, (10.0, 20.0)])

    def test_short_label_keeps_original_style(self):
        self.assertEqual(composer.slim_feature_label('頭部'), ('頭部', 22, 100))

    def test_feature_capsule_expands(self):
        text, size, width = composer.slim_feature_label('灰粉無斑胸腹')
        self.assertEqual(text, '灰粉無斑胸腹')
        self.assertEqual(size, 22)
        self.assertGreater(width, 100)

    def test_arbitrary_labels_fit_without_overlapping(self):
        for label in ['黃綠臉金嘴', '紫褐肩翅羽', '粗壯紅足', '寬闊藍綠色眼圈',
                      '很長的特徵描述' * 20, 'Wide English feature caption' * 4,
                      '', '頭部\n黃眼圈']:
            with self.subTest(label=label):
                text, size, width = composer.slim_feature_label(label)
                self.assertGreaterEqual(size, 18)
                self.assertLessEqual(width, 210)
                f = composer.font(size)
                box = f.getbbox(text)
                ink = max(f.getlength(text), box[2] - box[0]) / composer.SS
                self.assertLessEqual(ink + 24, width + 0.001)
                for cx, _, _ in composer.M_ZOOM:
                    self.assertGreaterEqual(cx - width / 2, composer.M_ZOOMP[0])
                    self.assertLessEqual(cx + width / 2, composer.M_ZOOMP[2])
                self.assertLess(width, 238)  # adjacent centres are 238px apart

    def test_long_label_is_readable_and_ellipsized(self):
        text, size, _ = composer.slim_feature_label('長句描述' * 40)
        self.assertEqual(size, 18)
        self.assertTrue(text.endswith('…'))


if __name__ == '__main__':
    unittest.main()
