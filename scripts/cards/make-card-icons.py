#!/usr/bin/env python3
"""把 AI 一次生成的圖示總表（docs/card-samples/card-iconsheet.png，4×3 圓形徽章，無字）
裁成 12 個圓形 PNG＋取出各徽章底色（當作該小卡片的外框色）。
用法：python3 scripts/cards/make-card-icons.py"""
import json, os
import numpy as np
from PIL import Image, ImageDraw

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
src = os.path.join(root, 'docs/card-samples/card-iconsheet.png')
out = os.path.join(root, 'docs/card-samples/card-icons')
os.makedirs(out, exist_ok=True)
names = ['tax', 'hab', 'diet', 'map', 'grow', 'radar', 'sim', 'cons', 'zoom', 'len', 'mass', 'level']
im = Image.open(src).convert('RGB')
W, H = im.size
a = np.array(im).astype(int)
bg = a[5, 5]
cols = {}
from scipy import ndimage
mask_all = np.abs(a - bg).sum(axis=2) > 40
mask_all = ndimage.binary_fill_holes(ndimage.binary_closing(mask_all, iterations=3))
mask_all = ndimage.binary_opening(mask_all, iterations=2)
lab, cnt = ndimage.label(mask_all)
objs = [o for o in ndimage.find_objects(lab) if (o[0].stop - o[0].start) > 80]
assert len(objs) == 12, f'找到 {len(objs)} 個徽章，應為 12'
cent = sorted([((o[0].start + o[0].stop) / 2, (o[1].start + o[1].stop) / 2, o) for o in objs])
rows = [sorted(cent[i * 4:(i + 1) * 4], key=lambda t: t[1]) for i in range(3)]
ordered = [t[2] for r in rows for t in r]
for k, n in enumerate(names):
    o = ordered[k]
    by0, by1, bx0, bx1 = o[0].start, o[0].stop - 1, o[1].start, o[1].stop - 1
    cx, cy = (bx0 + bx1) // 2, (by0 + by1) // 2
    R = max(bx1 - bx0, by1 - by0) // 2
    ic = im.crop((cx - R, cy - R, cx + R + 1, cy + R + 1)).resize((160, 160), Image.LANCZOS).convert('RGBA')
    mask = Image.new('L', (160, 160), 0)
    ImageDraw.Draw(mask).ellipse([1, 1, 158, 158], fill=255)
    ic.putalpha(mask)
    ic.save(os.path.join(out, n + '.png'), optimize=True)
    cols[n] = [int(v) for v in a[cy, cx - R + int(R * 0.14)]]
cols.update({'grow': [226, 108, 124], 'radar': [130, 92, 168], 'sim': [236, 170, 10], 'len': [90, 98, 192]})  # 自動取色被圖案蓋到的幾個用手動色
json.dump(cols, open(os.path.join(out, 'colors.json'), 'w'))
print(cols)
