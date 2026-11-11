#!/usr/bin/env python3
"""
compose-card.py —— 「AI 只生圖、字由我們填」的合成卡

流程（每隻鳥）：
  1. guide : 依資料畫一張「只有空框、完全無字」的導引圖（框的位置固定）→ 交給生圖 AI 填圖
  2. compose: 從 AI 輸出裁出各個框的內容（照固定座標裁，AI 偏幾 px 也無妨），
              貼進我們自己畫的卡片，再用真字體把所有文字／數字／雷達／星星／IUCN 色階畫上去。
  → AI 完全沒機會寫錯任何字。

用法：
  node scripts/cards/export-card-fields.mjs fields.json          # 先輸出每隻鳥要印的資料
  python3 scripts/cards/compose-card.py base    0024 fields.json base-0024.png       # 給生圖 AI 的輸入（字已印好、圖位留空）
  python3 scripts/cards/compose-card.py guide   0024 fields.json guide-0024.png
  python3 scripts/cards/compose-card.py compose 0024 fields.json art-0024.png card-0024.png
  python3 scripts/cards/compose-card.py prompt  0024 fields.json            # 印出給生圖 AI 的 prompt（零文字）
字體：Noto Sans TC（放 ~/.fonts 或 $AVX_FONT_DIR；OFL 授權，不入庫）
"""
import json
import math
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ICON_DIR = os.path.join(ROOT, 'docs/card-samples/card-icons')
FONT_DIR = os.environ.get('AVX_FONT_DIR', os.path.expanduser('~/.fonts'))
W, H = 1024, 1536
VERBOSE = bool(os.environ.get('AVX_VERBOSE'))
SS = 2                      # 超取樣倍率（先畫 2 倍再縮小，邊緣才平滑）

CREAM = (247, 242, 228)
INK = (48, 60, 46)
WHITE = (252, 251, 246)
GREEN = (47, 93, 58)

COL = {k: tuple(v) for k, v in json.load(open(os.path.join(ICON_DIR, 'colors.json'))).items()}
COL['zoom'] = (39, 101, 62)

SCALE = [('EX', (0, 0, 0)), ('EW', (84, 35, 68)), ('CR', (216, 30, 5)), ('EN', (252, 127, 63)),
         ('VU', (249, 232, 20)), ('NT', (204, 226, 38)), ('LC', (96, 198, 89))]
INFO = {'LC': ('無危', 'Least Concern'), 'NT': ('近危', 'Near Threatened'), 'VU': ('易危', 'Vulnerable'),
        'EN': ('瀕危', 'Endangered'), 'CR': ('極危', 'Critically Endangered'),
        'EW': ('野外滅絕', 'Extinct in the Wild'), 'EX': ('滅絕', 'Extinct'), 'NE': ('未評估', 'Not Evaluated')}

# ── 版面（1× 座標，1024×1536）────────────────────────────
PIXEL = (28, 120, 240, 332)
PHOTO = (262, 140, 740, 720)
ZOOM_C = [(830, 238 + i * 122, 52) for i in range(4)]
ZOOM_LABELS = ['頭部', '羽色', '翼部', '腳部']
COLS = [(28, 330), (350, 660), (690, 1000)]
Y1, Y1E = 742, 1016
Y2, Y2E = 1040, 1300
Y3, Y3E = 1320, 1506
MAP = (42, Y2 + 44, 316, Y2E - 14)
STATS = [(372, 'len', '身長'), (492, 'mass', '體重'), (612, 'level', '保育級別')]


def tag_positions(n):          # 棲息環境：圓圈＋下方短標籤
    row = lambda xs, y: [(x, y) for x in xs]
    return {1: row([155], 140), 2: row([78, 232], 140),
            3: row([78, 232], 96) + [(155, 206)], 4: row([78, 232], 96) + row([78, 232], 206)}.get(n, [])


def diet_positions(n):         # 食物：只有圖，圓圈放大置中
    return {1: [(155, 150, 60)], 2: [(78, 150, 52), (232, 150, 52)],
            3: [(78, 104, 46), (232, 104, 46), (155, 214, 46)],
            4: [(78, 104, 46), (232, 104, 46), (78, 214, 46), (232, 214, 46)]}.get(n, [])


def slots(f):
    """所有要請 AI 填圖的位置：(名稱, 'rect'|'circle', 座標, 外框線位置)——外框線用來校正 AI 輸出的偏移"""
    box = lambda b, k: (b[0] - k, b[1] - k, b[2] + k, b[3] + k)
    out = [('pixel', 'rect', (PIXEL[0] + 8, PIXEL[1] + 8, PIXEL[2] - 8, PIXEL[3] - 8), box(PIXEL, 1.5)),
           ('photo', 'rect', PHOTO, box(PHOTO, 1.5)), ('map', 'rect', MAP, box(MAP, 1.5))]
    out += [(f'zoom{i}', 'circle', c, c[2] + 3.5) for i, c in enumerate(ZOOM_C)]
    hx = COLS[1][0]
    out += [(f'hab{i}', 'circle', (hx + dx, Y1 + dy, 38), 41.5) for i, (dx, dy) in enumerate(tag_positions(min(4, len(f['hab']))))]
    dx0 = COLS[2][0]
    out += [(f'diet{i}', 'circle', (dx0 + dx, Y1 + dy, r), r + 3.5) for i, (dx, dy, r) in enumerate(diet_positions(min(4, len(f['diet']))))]
    gx = COLS[1][0]
    out += [(f'grow{i}', 'circle', (gx + 55 + i * 100, Y2 + 150, 40), 43.5) for i in range(3)]
    out += [(f'sim{i}', 'circle', (148 + i * 230, 1408, 48), 51.5) for i in range(2)]
    return out


def ring_points(kind, geo, ring):
    if kind == 'circle':
        cx, cy, _ = geo
        return [(cx + ring * math.cos(a), cy + ring * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 120, endpoint=False)]
    x0, y0, x1, y1 = ring
    pts = []
    for t in np.linspace(0, 1, 40, endpoint=False):
        pts += [(x0 + 14 + (x1 - x0 - 28) * t, y0), (x0 + 14 + (x1 - x0 - 28) * t, y1), (x0, y0 + 14 + (y1 - y0 - 28) * t), (x1, y0 + 14 + (y1 - y0 - 28) * t)]
    return pts


def align(base_np, art_np, kind, geo, ring, rng=10):
    """在 ±rng px 內找出 AI 輸出相對底圖的偏移（比對該框的外框線顏色），回傳 (dx, dy, 殘差)"""
    pts = np.array([(round(x), round(y)) for x, y in ring_points(kind, geo, ring)])
    xs, ys = pts[:, 0], pts[:, 1]
    ref = base_np[ys, xs]

    def cost(dx, dy):
        x2, y2 = xs + dx, ys + dy
        ok = (x2 >= 0) & (x2 < W) & (y2 >= 0) & (y2 < H)
        if ok.sum() < len(xs) * 0.8:
            return 1e9
        return np.abs(art_np[y2[ok], x2[ok]] - ref[ok]).sum(axis=1).mean()

    c0 = cost(0, 0)
    best = min(((cost(dx, dy), dx, dy) for dx in range(-rng, rng + 1, 2) for dy in range(-rng, rng + 1, 2)))
    c, bx, by = best
    for dx in range(bx - 2, bx + 3):
        for dy in range(by - 2, by + 3):
            cc = cost(dx, dy)
            if cc < c:
                c, bx, by = cc, dx, dy
    return bx, by, c, c0


# ── 繪圖小工具（全部用 1× 座標）──────────────────────────
def mix(c, t, k):
    return tuple(int(c[i] * (1 - k) + t[i] * k) for i in range(3))


def dark(c, k=0.22):
    return mix(c, (0, 0, 0), k)


def tint(c, k=0.9):
    return mix(c, (255, 255, 255), k)


_fc = {}


def font(sz, bold=True):
    key = (round(sz * SS), bold)
    if key not in _fc:
        name = 'NotoSansTC_700Bold.ttf' if bold else 'NotoSansTC_400Regular.ttf'
        _fc[key] = ImageFont.truetype(os.path.join(FONT_DIR, name), key[0])
    return _fc[key]


class Canvas:
    def __init__(self):
        self.img = Image.new('RGB', (W * SS, H * SS), CREAM)
        self.d = ImageDraw.Draw(self.img)

    def s(self, v):
        return [round(x * SS) for x in v] if isinstance(v, (list, tuple)) else round(v * SS)

    def rr(self, box, r=10, fill=None, outline=None, width=0):
        self.d.rounded_rectangle(self.s(box), radius=self.s(r), fill=fill, outline=outline, width=self.s(width) if width else 0)

    def ell(self, box, fill=None, outline=None, width=0):
        self.d.ellipse(self.s(box), fill=fill, outline=outline, width=self.s(width) if width else 0)

    def circ(self, cx, cy, r, **kw):
        self.ell((cx - r, cy - r, cx + r, cy + r), **kw)

    def line(self, pts, fill, width=1):
        self.d.line([tuple(self.s(p)) for p in pts], fill=fill, width=self.s(width))

    def poly(self, pts, fill=None, outline=None, width=1):
        sp = [tuple(self.s(p)) for p in pts]
        if fill:
            self.d.polygon(sp, fill=fill)
        if outline:
            self.d.line(sp + [sp[0]], fill=outline, width=self.s(width), joint='curve')

    def text(self, x, y, t, size, fill=INK, bold=True, anchor='lm', maxw=None, italic=False):
        t = str(t)
        sz = size
        while maxw and sz > 9 and self.d.textlength(t, font=font(sz, bold)) > maxw * SS:
            sz -= 1
        if not italic:
            self.d.text(tuple(self.s((x, y))), t, font=font(sz, bold), fill=fill, anchor=anchor)
            return
        f = font(sz, bold)
        tw = int(self.d.textlength(t, font=f)) + 40 * SS
        th = int(sz * SS * 1.8)
        layer = Image.new('L', (tw, th), 0)
        ImageDraw.Draw(layer).text((20 * SS, th // 2), t, font=f, fill=255, anchor='lm')
        layer = layer.transform(layer.size, Image.AFFINE, (1, 0.22, -0.22 * th / 2, 0, 1, 0), Image.BICUBIC)
        ox = {'lm': 0, 'mm': -(tw - 40 * SS) // 2, 'rm': -(tw - 40 * SS)}[anchor]
        self.img.paste(Image.new('RGB', layer.size, fill), (self.s(x) + ox - 20 * SS, self.s(y) - th // 2), layer)

    def icon(self, name, cx, cy, size, ring=True):
        ic = Image.open(os.path.join(ICON_DIR, name + '.png')).convert('RGBA')
        px = self.s(size)
        if ring:
            self.circ(cx, cy, size / 2 + 2.5, fill=WHITE)
        ic = ic.resize((px, px), Image.LANCZOS)
        self.img.paste(ic, (self.s(cx) - px // 2, self.s(cy) - px // 2), ic)

    def star(self, cx, cy, r, fill, outline):
        pts = []
        for i in range(10):
            a = -math.pi / 2 + i * math.pi / 5
            rr = r if i % 2 == 0 else r * 0.42
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        self.poly(pts, fill=fill, outline=outline, width=1.4)

    def paste_art(self, art, kind, geo, sh=(0, 0)):
        """從 AI 輸出（已縮成 W×H）裁出一個框的內容，貼進卡片"""
        if kind == 'rect':
            x0, y0, x1, y1 = geo
            m = 3
            crop = art.crop((x0 + m + sh[0], y0 + m + sh[1], x1 - m + sh[0], y1 - m + sh[1])).resize((self.s(x1 - x0), self.s(y1 - y0)), Image.LANCZOS)
            mask = Image.new('L', crop.size, 0)
            ImageDraw.Draw(mask).rounded_rectangle([0, 0, crop.size[0] - 1, crop.size[1] - 1], radius=self.s(8), fill=255)
            self.img.paste(crop, (self.s(x0), self.s(y0)), mask)
        else:
            cx, cy, r = geo
            k = 0.9
            crop = art.crop((round(cx - r * k + sh[0]), round(cy - r * k + sh[1]), round(cx + r * k + sh[0]), round(cy + r * k + sh[1]))).resize((self.s(2 * r), self.s(2 * r)), Image.LANCZOS)
            mask = Image.new('L', crop.size, 0)
            ImageDraw.Draw(mask).ellipse([0, 0, crop.size[0] - 1, crop.size[1] - 1], fill=255)
            self.img.paste(crop, (self.s(cx - r), self.s(cy - r)), mask)

    def done(self):
        return self.img.resize((W, H), Image.LANCZOS)


def panel(cv, x0, y0, x1, y1, title, key):
    col = COL[key]
    cv.rr((x0, y0 + 28, x1, y1), 12, fill=tint(col, 0.9), outline=mix(col, (0, 0, 0), 0.1), width=3)
    cv.rr((x0, y0, x1, y0 + 36), 10, fill=dark(col, 0.2))
    cv.text(x0 + 16, y0 + 18, title, 21, WHITE)
    cv.icon(key, x1 - 28, y0 + 18, 46)


# ── 導引圖：只有空框、零文字 ───────────────────────────
def draw_guide(f):
    cv = Canvas()
    cv.rr((12, 12, W - 12, H - 12), 26, outline=GREEN, width=3)
    for name, kind, geo, _r in slots(f):
        key = ''.join(ch for ch in name if not ch.isdigit())
        col = COL.get({'pixel': 'tax', 'photo': 'zoom', 'zoom': 'zoom', 'map': 'map', 'hab': 'hab', 'diet': 'diet',
                       'grow': 'grow', 'sim': 'sim'}[key], GREEN)
        if kind == 'rect':
            x0, y0, x1, y1 = geo
            cv.rr((x0 - 6, y0 - 6, x1 + 6, y1 + 6), 12, fill=tint(col, 0.85), outline=col, width=3)
            cv.rr(geo, 8, fill=tint(col, 0.7), outline=dark(col, 0.1), width=2)
        else:
            cx, cy, r = geo
            cv.circ(cx, cy, r + 5, fill=tint(col, 0.85), outline=col, width=3)
            cv.circ(cx, cy, r, fill=tint(col, 0.7), outline=dark(col, 0.1), width=2)
    return cv.done()


# ── 合成卡 ────────────────────────────────────────────
def compose(f, art):
    art = art.convert('RGB').resize((W, H), Image.LANCZOS) if art is not None else None
    cv = Canvas()
    cv.rr((12, 12, W - 12, H - 12), 26, outline=GREEN, width=3)
    cv.rr((20, 20, W - 20, H - 20), 22, outline=(200, 208, 190), width=1)
    code = f['iucn']['code']
    zh, en = INFO.get(code, ('資料待查', ''))
    cur = dict(SCALE).get(code)

    # 編號
    cv.rr((30, 24, 246, 100), 12, fill=GREEN)
    cv.circ(60, 62, 17, outline=WHITE, width=4)
    cv.line([(43, 62), (77, 62)], WHITE, 4)
    cv.circ(60, 62, 6, fill=GREEN, outline=WHITE, width=3)
    cv.text(86, 63, 'NO.' + f['id'], 34, WHITE, anchor='lm', maxw=150)
    # 名稱帶
    cv.rr((256, 20, 744, 128), 12, fill=GREEN)
    cv.text(500, 50, f['z'], 46, WHITE, anchor='mm', maxw=440)
    cv.text(500, 88, f['e'], 22, (236, 244, 230), bold=True, anchor='mm', maxw=450)
    cv.text(500, 112, f['s'], 20, (200, 224, 196), bold=False, anchor='mm', maxw=450, italic=True)
    # 目／科
    c = COL['tax']
    cv.rr((766, 20, 1004, 128), 12, fill=tint(c, 0.9), outline=c, width=3)
    for i, (lab, v) in enumerate([('目', f['order'][0]), ('科', f['family'][0])]):
        y = 56 + i * 44
        cv.text(784, y, lab, 25, dark(c, 0.15))
        cv.text(822, y, v or '資料待查', 25, INK, maxw=170)

    # 像素圖
    c = COL['tax']
    cv.rr((PIXEL[0] - 0, PIXEL[1], PIXEL[2], PIXEL[3]), 12, fill=(246, 246, 238), outline=GREEN, width=3)
    cv.text(134, 352, '像素圖鑑', 18, GREEN, anchor='mm')
    # 主照片框
    cv.rr((PHOTO[0] - 3, PHOTO[1] - 3, PHOTO[2] + 3, PHOTO[3] + 3), 16, outline=GREEN, width=3)
    # 特徵放大鏡
    c = COL['zoom']
    cv.rr((766, 140, 1004, 176), 10, fill=dark(c, 0.15))
    cv.text(782, 158, '特徵放大鏡', 21, WHITE)
    cv.icon('zoom', 976, 158, 46)
    for (cx, cy, r), lab in zip(ZOOM_C, ZOOM_LABELS):
        cv.circ(cx, cy, r + 5, fill=tint(c, 0.85), outline=c, width=3)
        cv.text(940, cy, lab, 28, dark(c, 0.1), anchor='mm')

    # 三個數值
    vals = {'len': f['len'], 'mass': f['mass'], 'level': (zh + ' ' + code) if code in INFO else zh}
    for y, key, lab in STATS:
        c = COL[key] if key != 'level' else (cur or COL['level'])
        c0 = COL[key]
        cv.rr((28, y, 240, y + 108), 12, fill=tint(c0, 0.9), outline=c0, width=3)
        cv.text(46, y + 28, lab, 22, dark(c0, 0.3))
        cv.icon(key, 206, y + 28, 44)
        if key == 'level':
            cv.circ(52, y + 76, 11, fill=c, outline=INK, width=2)
            cv.text(72, y + 76, vals[key], 28, INK, anchor='lm', maxw=150)
        else:
            cv.text(134, y + 76, vals[key], 28, INK, anchor='mm', maxw=190)

    # 分類資訊
    x0, x1 = COLS[0]
    panel(cv, x0, Y1, x1, Y1E, '分類資訊', 'tax')
    g = f['genus']
    rows = [('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'),
            ('目', ' '.join(filter(None, f['order'])) or '資料待查'), ('科', ' '.join(filter(None, f['family'])) or '資料待查'),
            ('屬', (g + ' 屬') if g else '資料待查'),
            ('種', f['z'] + (' ' + g[0] + '. ' + f['epithet'] if g and f['epithet'] else ''))]
    c = COL['tax']
    for i, (k, v) in enumerate(rows):
        y = Y1 + 58 + i * 31
        cv.circ(50, y, 6, outline=mix(c, WHITE, 0.3), width=2)
        cv.text(66, y, k, 20, dark(c, 0.1))
        cv.text(98, y, v, 18, INK, bold=False, maxw=222)

    # 棲息環境（圖＋短標籤）
    x0, x1 = COLS[1]
    panel(cv, x0, Y1, x1, Y1E, '棲息環境', 'hab')
    c = COL['hab']
    hab = f['hab'][:4]
    if not hab:
        cv.text((x0 + x1) / 2, Y1 + 150, '資料待查', 24, mix(INK, WHITE, 0.2), anchor='mm')
    for i, (dx, dy) in enumerate(tag_positions(len(hab))):
        cx, cy = x0 + dx, Y1 + dy
        cv.circ(cx, cy, 43, fill=tint(c, 0.85), outline=c, width=3)
        cv.rr((cx - 60, cy + 46, cx + 60, cy + 72), 8, fill=WHITE, outline=mix(c, WHITE, 0.3), width=2)
        cv.text(cx, cy + 59, hab[i], 17, dark(c, 0.35), anchor='mm', maxw=112)

    # 食物（只放圖）
    x0, x1 = COLS[2]
    panel(cv, x0, Y1, x1, Y1E, '食物', 'diet')
    c = COL['diet']
    diet = f['diet'][:4]
    if not diet:
        cv.text((x0 + x1) / 2, Y1 + 150, '資料待查', 24, mix(INK, WHITE, 0.2), anchor='mm')
    for dx, dy, r in diet_positions(len(diet)):
        cv.circ(x0 + dx, Y1 + dy, r + 5, fill=tint(c, 0.85), outline=c, width=3)

    # 分佈地區
    x0, x1 = COLS[0]
    panel(cv, x0, Y2, x1, Y2E, '分佈地區', 'map')
    cv.rr((MAP[0] - 3, MAP[1] - 3, MAP[2] + 3, MAP[3] + 3), 10, outline=COL['map'], width=3)

    # 成長與繁殖（只放圖）
    x0, x1 = COLS[1]
    panel(cv, x0, Y2, x1, Y2E, '成長與繁殖', 'grow')
    c = COL['grow']
    for i in range(3):
        cv.circ(x0 + 55 + i * 100, Y2 + 150, 45, fill=tint(c, 0.85), outline=c, width=3)
        if i < 2:
            cv.poly([(x0 + 55 + i * 100 + 49, Y2 + 145), (x0 + 55 + i * 100 + 55, Y2 + 150), (x0 + 55 + i * 100 + 49, Y2 + 155)], fill=mix(c, WHITE, 0.2))

    # 生態價值評分（雷達）
    x0, x1 = COLS[2]
    panel(cv, x0, Y2, x1, Y2E, '生態價值評分', 'radar')
    c = COL['radar']
    cx, cy, R = x0 + 155, Y2 + 142, 46
    sc = f['score']
    names = [('重要性', 'i'), ('適應力', 'a'), ('研究', 'r'), ('保育', 'c'), ('觀賞', 'v')]
    ang = [-math.pi / 2 + i * 2 * math.pi / 5 for i in range(5)]
    for lv in (1, 2, 3, 4, 5):
        cv.poly([(cx + R * lv / 5 * math.cos(a), cy + R * lv / 5 * math.sin(a)) for a in ang], outline=mix(c, WHITE, 0.6), width=1)
    for a in ang:
        cv.line([(cx, cy), (cx + R * math.cos(a), cy + R * math.sin(a))], mix(c, WHITE, 0.6), 1)
    pv = [float(sc[k]) if sc[k] else 0 for _, k in names]
    pts = [(cx + R * v / 5 * math.cos(a), cy + R * v / 5 * math.sin(a)) for v, a in zip(pv, ang)]
    ov = Image.new('RGBA', cv.img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ov).polygon([tuple(cv.s(p)) for p in pts], fill=c + (110,))
    cv.img.paste(ov, (0, 0), ov)
    cv.d = ImageDraw.Draw(cv.img)
    cv.poly(pts, outline=c, width=2.5)
    for p in pts:
        cv.circ(p[0], p[1], 3, fill=c)
    for (nm, k), a in zip(names, ang):
        lx, ly = cx + (R + 40) * math.cos(a), cy + (R + 24) * math.sin(a)
        cv.text(lx, ly - 10, nm, 15, INK, anchor='mm')
        v = sc[k] or '待查'
        cv.rr((lx - 22, ly + 1, lx + 22, ly + 22), 6, fill=WHITE, outline=c, width=2)
        cv.text(lx, ly + 12, v, 16, dark(c, 0.25), anchor='mm')
    cv.text(x0 + 16, Y2E - 22, '總評分', 18, dark(c, 0.15))
    try:
        n = max(0, min(5, round(float(sc['o']))))
    except (TypeError, ValueError):
        n = None
    for i in range(5):
        cv.star(x0 + 98 + i * 24, Y2E - 22, 10, (244, 190, 30) if n is not None and i < n else tint((244, 190, 30), 0.75), (196, 140, 10))
    cv.text(x0 + 214, Y2E - 22, (sc['o'] + ' / 5') if sc['o'] else '資料待查', 18, INK, maxw=76)

    # 可混淆物種
    panel(cv, 28, Y3, 495, Y3E, '可混淆物種', 'sim')
    c = COL['sim']
    for i in range(2):
        cx = 148 + i * 230
        cv.circ(cx, 1408, 53, fill=tint(c, 0.85), outline=c, width=3)
        nm = f['sim'][i] if i < len(f['sim']) else ''
        if nm:
            cv.rr((cx - 100, 1466, cx + 100, 1494), 9, fill=WHITE, outline=mix(c, WHITE, 0.2), width=2)
            cv.text(cx, 1480, nm, 18, INK, anchor='mm', maxw=188)

    # 保育狀態（IUCN 色階）
    panel(cv, 515, Y3, 1000, Y3E, '保育狀態', 'cons')
    cy = 1408
    for i, (k, col) in enumerate(SCALE):
        x = 566 + i * 64
        if k == code:
            cv.circ(x, cy, 33, fill=col, outline=INK, width=5)
            cv.text(x, cy + 1, k, 26, WHITE if sum(col) < 450 else INK, anchor='mm')
            cv.poly([(x - 9, cy + 41), (x + 9, cy + 41), (x, cy + 52)], fill=INK)
        else:
            soft = mix(col, WHITE, 0.45)
            cv.circ(x, cy, 20, fill=soft, outline=(215, 215, 205), width=2)
            cv.text(x, cy + 1, k, 14, WHITE if sum(soft) < 420 else (90, 100, 88), anchor='mm')
    cv.text(758, 1482, (zh + '  ' + en) if en else zh, 24, INK, anchor='mm', maxw=440)

    # AI 生成的圖貼上（最後貼，蓋在框內）
    base_np = art_np = None
    if art is not None:
        base_np = np.array(compose(f, None)).astype(float)
        art_np = np.array(art).astype(float)
    for name, kind, geo, ring in slots(f):
        if art is not None:
            dx, dy, c, c0 = align(base_np, art_np, kind, geo, ring)
            use = c0 > 25 and c < c0 * 0.6 and c < 60          # 只有明顯更準才採用偏移，否則維持原位
            if VERBOSE:
                print(f'  {name}: shift ({dx:+d},{dy:+d}) cost {c:.0f} (原位 {c0:.0f}){" 採用" if use else ""}')
            cv.paste_art(art, kind, geo, (dx, dy) if use else (0, 0))
        else:   # 空位：給 AI 看的「待填」底色
            key = ''.join(ch for ch in name if not ch.isdigit())
            col = COL[{'pixel': 'tax', 'photo': 'zoom', 'zoom': 'zoom', 'map': 'map', 'hab': 'hab', 'diet': 'diet', 'grow': 'grow', 'sim': 'sim'}[key]]
            if kind == 'rect':
                cv.rr(geo, 8, fill=tint(col, 0.75))
            else:
                cv.circ(geo[0], geo[1], geo[2], fill=tint(col, 0.75))
    return cv.done()


# ── 給生圖 AI 的 prompt：零文字 ─────────────────────────
def art_prompt(f):
    hab = f['hab'][:4]
    diet = f['diet'][:4]
    L = [
        f"IMAGE 1 is a bird information card for {f['z']} ({f['e']}, {f['s']}) that is finished except for its EMPTY PICTURE SLOTS (flat pale-coloured rectangles and circles). Fill ONLY those slots with illustrations. Use correct plumage and bare-part colours for this species; one species only.",
        'Keep everything else in IMAGE 1 exactly as it is: all layout, panels, colours, titles, icons, numbers and text stay untouched at the same positions; do not redraw, move, resize or retype anything. Each picture must fill its slot edge to edge with the subject centred and fully inside the slot (circles: the whole subject inside the circle, nothing cut off by the rim) and contain NO text, letters, numbers or watermarks.',
        'Slots:',
        '  · Top-left square (under the pokéball number chip): small 16-bit pixel art of the bird, side view, plain light background.',
        '  · Large centre frame: photorealistic photo of the bird, whole body, in its natural habitat.',
        '  · Right column, 4 circles top to bottom (頭部/羽色/翼部/腳部): close-ups of (1) head and bill, (2) plumage pattern, (3) folded or spread wing, (4) feet and legs.',
        '  · 分佈地區 wide frame: flat world map in soft colours with the species range shaded green' + (f" (range: {f.get('range')})" if f.get('range') else '') + '.',
    ]
    if hab:
        L.append('  · 棲息環境 circles (left to right, top to bottom): ' + '; '.join(f'{i + 1}. {h}' for i, h in enumerate(hab)) + ' — colourful flat sticker-style icons (3–4 colours each).')
    if diet:
        L.append('  · 食物 circles (left to right, top to bottom): ' + '; '.join(f'{i + 1}. {h}' for i, h in enumerate(diet)) + ' — colourful flat sticker-style illustrations of the typical food items in natural food colours.')
    L.append('  · 成長與繁殖 three circles left to right: (1) a nest, (2) eggs, (3) a chick — colourful flat sticker style, typical for this species.')
    L.append('  · 可混淆物種 two circles: realistic head-and-neck portraits of two different similar species — ' + ' and '.join(f['sim'][:2]) + '.')
    L.append('Style for pictures: clean, bright, crisp, kid-friendly. Do not add anything outside the slots.')
    return '\n'.join(L)


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    mode, bid, fp = sys.argv[1:4]
    f = json.load(open(fp, encoding='utf8'))[bid]
    if mode == 'guide':
        draw_guide(f).save(sys.argv[4])
    elif mode == 'base':       # 給 AI 的輸入：字全部已印好、只留空位
        compose(f, None).save(sys.argv[4])
    elif mode == 'prompt':
        print(art_prompt(f))
    elif mode == 'compose':
        compose(f, Image.open(sys.argv[4])).save(sys.argv[5], optimize=True)
    else:
        raise SystemExit(__doc__)


if __name__ == '__main__':
    main()
