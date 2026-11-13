#!/usr/bin/env python3
"""Inspect candidate feature crops exactly as the renderer will show them.

Usage: python3 verify/exact.py <art-dir> <spec.json> [out.png]

For every featureCrop entry it draws a red rectangle on the source image
(with a 10% grid) and a circular-masked preview produced by ImageOps.fit,
i.e. the same fit + circle mask the renderer applies. Read the sheet and
check that the labelled feature is fully inside the circle.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

art = Path(sys.argv[1])
spec = json.loads(Path(sys.argv[2]).read_text())
out = Path(sys.argv[3]) if len(sys.argv) > 3 else Path('/tmp/exact-sheet.png')

CROP, PREV = 360, 300
sources = spec.get('featureSources', ['features.png'] * 4)
labels = spec.get('featureLabels', ['', '', '', ''])

rows = []
for i, crop in enumerate(spec['featureCrops']):
    src = Image.open(art / sources[i]).convert('RGB')
    w, h = src.size
    box = (round(crop[0] * w), round(crop[1] * h), round(crop[2] * w), round(crop[3] * h))

    # source with grid + rectangle, scaled to CROP
    marked = src.copy()
    d = ImageDraw.Draw(marked)
    for k in range(1, 10):
        d.line([(w * k / 10, 0), (w * k / 10, h)], fill=(255, 0, 0, 80), width=2)
        d.line([(0, h * k / 10), (w, h * k / 10)], fill=(255, 0, 0, 80), width=2)
    d.rectangle(box, outline=(255, 0, 0), width=6)
    d.rectangle((0, 0, 60, 26), fill=(255, 255, 255))
    d.text((6, 6), f'{i + 1} {sources[i]}', fill=(0, 0, 0))
    rows.append(marked.resize((CROP, round(CROP * h / w)), Image.Resampling.LANCZOS))

    # circular preview exactly as rendered
    fitted = ImageOps.fit(src.crop(box), (PREV, PREV), method=Image.Resampling.LANCZOS)
    mask = Image.new('L', (PREV * 4, PREV * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, PREV * 4 - 1, PREV * 4 - 1), fill=255)
    mask = mask.resize((PREV, PREV), Image.Resampling.LANCZOS)
    circ = Image.new('RGB', (PREV, PREV), (247, 242, 228))
    circ.paste(fitted, (0, 0), mask)
    rows.append(circ)

width = CROP + PREV + 20
height = sum(r.height + 26 for r in rows)
sheet = Image.new('RGB', (width, height), (255, 255, 255))
d = ImageDraw.Draw(sheet)
y = 0
for r in rows:
    sheet.paste(r, (0, y))
    y += r.height + 26
y = 0
for i, label in enumerate(labels):
    d.text((CROP + 8, y + 4), f'#{i + 1} {label}', fill=(0, 0, 0))
    y += rows[2 * i].height + 26
sheet.save(out)
print(out, sheet.size)
