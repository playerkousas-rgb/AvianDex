#!/usr/bin/env python3
"""Preview the four feature circles exactly as render-info-restart.py draws them.

The renderer crops the spec's box out of the source art, then calls
ImageOps.fit to squeeze the result into the (square) circle geometry. A wide
box therefore loses its left and right edges -- which is why hand-built crop
sheets taken straight from the box often look right while the finished card
does not.

Usage: python scripts/cards/preview-crops.py 0146 [out.png]
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
CARD = sys.argv[1]
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(f'/home/user/verify/{CARD}-circle-exact.png')
SIZE = 300  # preview circle size

spec = json.loads((ROOT / f'scripts/cards/info-restart-{CARD}.json').read_text())
sources = spec.get('featureSources', ['features.png'] * 4)
art = ROOT / f'cards/art/info-restart-{CARD}'

sheet = Image.new('RGB', (4 * (SIZE + 10) + 5, SIZE + 10), '#0f2537')
for i, (box, source) in enumerate(zip(spec['featureCrops'], sources)):
    with Image.open(art / source) as image:
        crop = image.crop(tuple(
            round(v * (image.width if j % 2 == 0 else image.height))
            for j, v in enumerate(box)
        )).convert('RGB')
    # Mirror the renderer: fit the (possibly non-square) crop into the circle box.
    fitted = ImageOps.fit(crop, (SIZE, SIZE), method=Image.Resampling.LANCZOS)
    mask = Image.new('L', (SIZE, SIZE), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).ellipse((0, 0, SIZE - 1, SIZE - 1), fill=255)
    sheet.paste(fitted, (5 + i * (SIZE + 10), 5), mask)

OUT.parent.mkdir(parents=True, exist_ok=True)
sheet.save(OUT)
print(f'{OUT} labels={spec.get("featureLabels")}')
