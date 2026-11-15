#!/usr/bin/env python3
"""Review helpers for info-card artwork crops.

    python scripts/cards/crop-preview.py grid NNNN
        writes /tmp/gridNNNN.png, a 20x20 reference grid over pixel.png
    python scripts/cards/crop-preview.py crops NNNN '[[x0,y0,x1,y1], ...]' '["label", ...]'
        writes /tmp/cropsNNNN.png, a 2x2 contact sheet of the candidate crops
    python scripts/cards/crop-preview.py row NNNN
        writes /tmp/rowNNNN.png, the rendered feature row of the preview webp
"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = '/home/user/AvianDex'
DEJAVU = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
mode = sys.argv[1]
bid = sys.argv[2].zfill(4)
art = Image.open(f'{ROOT}/cards/art/info-restart-{bid}/pixel.png').convert('RGB')

if mode == 'grid':
    d = ImageDraw.Draw(art)
    f = ImageFont.truetype(DEJAVU, 22)
    w, h = art.size
    for i in range(1, 20):
        d.line([(w * i / 20, 0), (w * i / 20, h)], fill=(220, 40, 40), width=1)
        d.line([(0, h * i / 20), (w, h * i / 20)], fill=(220, 40, 40), width=1)
    for i in range(8):
        v = i / 8
        d.text((w * v + 6, 4), f'{v:.2f}', fill=(255, 230, 60), font=f)
        d.text((6, h * v + 4), f'{v:.2f}', fill=(255, 230, 60), font=f)
    art.save(f'/tmp/grid{bid}.png')
    print('saved', art.size)
elif mode == 'crops':
    boxes = json.loads(sys.argv[3])
    labels = json.loads(sys.argv[4]) if len(sys.argv) > 4 else [str(i + 1) for i in range(len(boxes))]
    w, h = art.size
    cell = 340
    sheet = Image.new('RGB', (cell * 2, cell * 2), (0, 0, 0))
    f = ImageFont.truetype(DEJAVU, 22)
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        crop = art.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))).resize((cell, cell), Image.LANCZOS)
        ox, oy = [(0, 0), (cell, 0), (0, cell), (cell, cell)][i]
        sheet.paste(crop, (ox, oy))
        ImageDraw.Draw(sheet).text((ox + 8, oy + 6), f'{i + 1} {labels[i] if i < len(labels) else ""}',
                                   fill=(255, 230, 60), font=f)
    sheet.save(f'/tmp/crops{bid}.png')
    print('saved', sheet.size)
elif mode == 'row':
    im = Image.open(f'{ROOT}/deliver/cards/info-restart-{bid}/preview-{bid}.webp')
    im.crop((0, 430, 1024, 700)).resize((2048, 540)).save(f'/tmp/row{bid}.png')
    print('saved row', im.size)
elif mode == 'card':
    im = Image.open(f'{ROOT}/deliver/cards/info-restart-{bid}/preview-{bid}.webp')
    im.resize((im.width // 2, im.height // 2)).save(f'/tmp/pv{bid}.png')
    print('saved card', im.size)
else:
    sys.exit(f'unknown mode {mode}')
