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
OUT_SCALE = int(os.environ.get('AVX_OUT_SCALE', '1'))   # 輸出倍率：預設 1 → 1024×1536；2 → 2048×3072
VERBOSE = bool(os.environ.get('AVX_VERBOSE'))
LAYOUT_MODE = os.environ.get('AVX_LAYOUT', 'mobile')   # mobile＝手機精簡版（預設）；full＝完整版（v3 full-art）
SS = 2                      # 超取樣倍率（先畫 2 倍再縮小，邊緣才平滑）

CREAM = (247, 242, 228)
INK = (48, 60, 46)
WHITE = (252, 251, 246)
GREEN = (47, 93, 58)
# 頂部標題列配色（預設：單一主題色，見 apply_theme）
HDR = {'no': (190, 94, 18), 'title': (47, 93, 58), 'tax': (47, 93, 58), 'zoom': (47, 93, 58)}
# 配色（依 playerkousas-rgb/readme 設計指南 + 實體 TCG 做法）：
#   一張卡只用一個「主題色」（依目分組，同 TCG 的屬性色）＋中性紙色＋一個暖橙強調（只用在編號塊）。
#   保育等級、雷達圖、圖示維持各自的語意／多彩，不跟主題走。
#   AVX_PALETTE=multi 可還原舊的「每個框不同顏色」。
PALETTE = os.environ.get('AVX_PALETTE', 'theme')
THEMES = {   # 組 → 主題色（白字對比 ≥ 4.5:1）
    'water': (38, 100, 146),     # 水鳥：雁形／鸛形／鰹鳥／鷺／鷗／鶴等
    'raptor': (122, 74, 33),     # 猛禽：鷹形／隼形／鴞形
    'passerine': (44, 90, 60),   # 雀形目
    'other': (74, 88, 122),      # 其他：鳩／杜鵑／翠鳥／啄木鳥…
}
WATER = {'Anseriformes', 'Podicipediformes', 'Suliformes', 'Pelecaniformes', 'Charadriiformes', 'Gruiformes',
         'Phaethontiformes', 'Procellariiformes', 'Gaviiformes', 'Ciconiiformes', 'Phoenicopteriformes'}
SHIFT = {   # key: (色相偏移°, 飽和度倍數, 明度倍數)
    'tax': (0, 1.0, 1.0), 'hab': (-12, 1.0, 1.12), 'diet': (12, 0.95, 0.98), 'map': (-22, 0.9, 1.12),
    'grow': (20, 0.9, 1.08), 'radar': (0, 1.1, 0.92), 'sim': (8, 0.95, 1.12), 'cons': (-8, 1.0, 0.96),
    'zoom': (0, 1.0, 1.0), 'len': (-14, 0.95, 1.1), 'mass': (14, 0.95, 1.0), 'level': (0, 1.0, 1.0),
}
RAPTOR = {'Accipitriformes', 'Falconiformes', 'Strigiformes'}

COL = {k: tuple(v) for k, v in json.load(open(os.path.join(ICON_DIR, 'colors.json'))).items()}
COL['zoom'] = (39, 101, 62)

SCALE = [('EX', (0, 0, 0)), ('EW', (84, 35, 68)), ('CR', (216, 30, 5)), ('EN', (252, 127, 63)),
         ('VU', (249, 232, 20)), ('NT', (204, 226, 38)), ('LC', (96, 198, 89))]
INFO = {'LC': ('無危', 'Least Concern'), 'NT': ('近危', 'Near Threatened'), 'VU': ('易危', 'Vulnerable'),
        'EN': ('瀕危', 'Endangered'), 'CR': ('極危', 'Critically Endangered'),
        'EW': ('野外滅絕', 'Extinct in the Wild'), 'EX': ('滅絕', 'Extinct'), 'NE': ('未評估', 'Not Evaluated')}

# ── 版面（1× 座標，1024×1536）────────────────────────────
PHOTO = (24, 24, 1000, 800)                 # v3：滿版主圖（像遊戲卡的 full-art），資訊疊在圖上
PIXEL_FRAME = (28, 620, 220, 796)
PIXEL = (36, 628, 212, 788)
ZOOM_C = [(936, 300 + i * 128, 50) for i in range(4)]
ZOOM_LABELS = ['頭部', '羽色', '翼部', '腳部']
# 下方資訊區：大小刻意不一（寬／高都不同）
R1, R1E = 814, 1058
R2, R2E = 1070, 1318
R3, R3E = 1330, 1506
TAX = (28, R1, 300, R1E)
HABP = (312, R1, 668, R1E)
GROWP = (680, R1, 996, R1E)
MAPP = (28, R2, 396, R2E)
RADP = (408, R2, 736, R2E)
DIETP = (748, R2, 996, R2E)
SIMP = (28, R3, 452, R3E)
CONSP = (464, R3, 996, R3E)
MAP = (MAPP[0] + 6, MAPP[1] + 6, MAPP[2] - 6, MAPP[3] - 6)
HAB = (HABP[0] + 8, HABP[1] + 8, HABP[2] - 8, HABP[3] - 8)
GROW_C = [(GROWP[0] + 52 + i * 106, R1 + 128, 42) for i in range(3)]
SIM_X = (128, 352)
SIM_Y = 1394


def diet_positions(n):         # 食物（相對 DIETP 左上角）
    return {1: [(124, 124, 70)], 2: [(124, 70, 52), (124, 178, 52)],
            3: [(72, 74, 44), (176, 74, 44), (124, 180, 44)],
            4: [(72, 74, 44), (176, 74, 44), (72, 176, 44), (176, 176, 44)]}.get(n, [])


def slots(f):
    """所有要請 AI 填圖的位置：(名稱, 'rect'|'circle', 座標, 外框線位置)——外框線用來校正 AI 輸出的偏移"""
    box = lambda b, k: (b[0] - k, b[1] - k, b[2] + k, b[3] + k)
    out = [('photo', 'rect', PHOTO, box(PHOTO, 1.5)),
           ('pixel', 'rect', PIXEL, box(PIXEL, 1.5)), ('map', 'rect', MAP, box(MAP, 1.5)),
           ('hab', 'rect', HAB, box(HAB, 1.5))]
    out += [(f'zoom{i}', 'circle', c, c[2] + 3.5) for i, c in enumerate(ZOOM_C)]
    out += [(f'diet{i}', 'circle', (DIETP[0] + dx, DIETP[1] + dy, r), r + 3.5) for i, (dx, dy, r) in enumerate(diet_positions(min(4, len(f['diet']))))]
    out += [(f'grow{i}', 'circle', c, c[2] + 3.5) for i, c in enumerate(GROW_C)]
    out += [(f'sim{i}', 'circle', (SIM_X[i], SIM_Y, 46), 49.5) for i in range(2)]
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


def slim_feature_label(label):
    """Fit a feature caption inside its 238px column, without shrinking short labels.

    Grow the original 100px capsule to at most 210px, keeping 24px padding.
    Overlong captions retain a readable >=18px font and are ellipsized; specs
    should still prefer concise features or body-part names over sentences.
    """
    label = ' '.join(str(label).split())
    size, padding, maximum = 22, 24, 210
    def width(text, sz):
        f = font(sz)
        box = f.getbbox(text)
        return max(f.getlength(text), box[2] - box[0]) / SS
    while size > 18 and width(label, size) + padding > maximum:
        size -= 1
    if width(label, size) + padding > maximum:
        while label and width(label + '…', size) + padding > maximum:
            label = label[:-1]
        label += '…'
    return label, size, min(maximum, max(100, math.ceil(width(label, size) + padding)))


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

    def glass(self, pts, fill, alpha=225, outline=None, width=0):
        """半透明色塊（多邊形或矩形）。"""
        if len(pts) == 4 and not isinstance(pts[0], (tuple, list)):
            x0, y0, x1, y1 = pts
            pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
        ov = Image.new('RGBA', self.img.size, (0, 0, 0, 0))
        dd = ImageDraw.Draw(ov)
        sp = [tuple(self.s(p)) for p in pts]
        dd.polygon(sp, fill=tuple(fill) + (alpha,))
        self.img.paste(ov, (0, 0), ov)
        self.d = ImageDraw.Draw(self.img)
        if outline:
            self.poly(pts, outline=outline, width=width)

    def ball(self, cx, cy, r, on=True):
        """乾淨精靈球：紅上白下、一條粗帶橫貫全球、中央白色按鈕、粗外環。
        先在小圖上畫好再用圓形 mask 貼上（紅頂與白底之間不會露縫），外環最後畫蓋住接縫。"""
        top = (214, 62, 52) if on else (205, 205, 198)
        bot = (250, 250, 244) if on else (236, 236, 230)
        edge = (40, 44, 40) if on else (150, 156, 148)
        ring = max(2.0, r * 0.24)
        ri = r - ring / 2
        bx = self.s((cx - ri, cy - ri, cx + ri, cy + ri))
        w, h = bx[2] - bx[0], bx[3] - bx[1]
        tile = Image.new('RGB', (w, h), bot)
        ImageDraw.Draw(tile).pieslice([0, 0, w - 1, h - 1], 180, 360, fill=top)
        band = max(3.0, r * 0.44) * SS
        ImageDraw.Draw(tile).rectangle([0, h // 2 - band // 2, w - 1, h // 2 + band // 2], fill=edge)
        mask = Image.new('L', (w, h), 0)
        ImageDraw.Draw(mask).ellipse([0, 0, w - 1, h - 1], fill=255)
        self.img.paste(tile, (bx[0], bx[1]), mask)
        self.circ(cx, cy, r * 0.40, fill=bot, outline=edge, width=max(1.6, r * 0.16))
        self.circ(cx, cy, r, outline=edge, width=ring)

    def paste_art(self, art, kind, geo, sh=(0, 0), rad=8):
        """從 AI 輸出（原始解析度）裁出一個框的內容，一次縮放貼進卡片（避免二次重採樣變糊）"""
        ax, ay = art.width / W, art.height / H
        if kind == 'rect':
            x0, y0, x1, y1 = geo
            m = 3
            box = ((x0 + m + sh[0]) * ax, (y0 + m + sh[1]) * ay, (x1 - m + sh[0]) * ax, (y1 - m + sh[1]) * ay)
            crop = art.resize((self.s(x1 - x0), self.s(y1 - y0)), Image.LANCZOS, box=box)
            mask = Image.new('L', crop.size, 0)
            ImageDraw.Draw(mask).rounded_rectangle([0, 0, crop.size[0] - 1, crop.size[1] - 1], radius=self.s(rad), fill=255)
            self.img.paste(crop, (self.s(x0), self.s(y0)), mask)
        else:
            cx, cy, r = geo
            k = 0.9
            box = ((cx - r * k + sh[0]) * ax, (cy - r * k + sh[1]) * ay, (cx + r * k + sh[0]) * ax, (cy + r * k + sh[1]) * ay)
            crop = art.resize((self.s(2 * r), self.s(2 * r)), Image.LANCZOS, box=box)
            mask = Image.new('L', crop.size, 0)
            ImageDraw.Draw(mask).ellipse([0, 0, crop.size[0] - 1, crop.size[1] - 1], fill=255)
            self.img.paste(crop, (self.s(cx - r), self.s(cy - r)), mask)

    def done(self, scale=None):
        scale = scale or OUT_SCALE
        if scale == SS:
            return self.img
        return self.img.resize((W * scale, H * scale), Image.LANCZOS)


def panel(cv, box, key, shade=0.82, dark_bg=False):
    """v3：大小不一的平塗格；無標題條、無框線。dark_bg＝深色格（拉開明暗層次）。"""
    col = COL[key]
    fill = dark(col, 0.28) if dark_bg else tint(col, shade)
    cv.rr(box, 18, fill=fill)


def badge(cv, box, key):
    """圖示章：半個伸出格子左上角，像貼紙。"""
    cv.icon(key, box[0] + 8, box[1] + 8, 38)


# ── 導引圖：只有空框、零文字 ───────────────────────────
def draw_guide(f):
    cv = Canvas()
    cv.rr((12, 12, W - 12, H - 12), 26, outline=GREEN, width=3)
    for name, kind, geo, _r in (slim_slots(f) if LAYOUT_MODE == 'mobile' else slots(f)):
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
    return cv.done(1)


def hsv_shift(rgb, dh, sm, vm):
    import colorsys
    h, sat, v = colorsys.rgb_to_hsv(*[c / 255 for c in rgb])
    h = (h + dh / 360) % 1.0
    r, g, b = colorsys.hsv_to_rgb(h, min(1, sat * sm), min(1, v * vm))
    return (round(r * 255), round(g * 255), round(b * 255))


def apply_theme(f):
    """依目決定本卡主題色，改寫 COL / GREEN / HDR（只在 theme 模式）。"""
    global GREEN
    if PALETTE != 'theme':
        return
    o = (f.get('order') or [None, None])[1] or ''
    grp = 'water' if o in WATER else 'raptor' if o in RAPTOR else 'passerine' if o == 'Passeriformes' else 'other'
    mid = THEMES[grp]
    # 同色系微調：每個框在主題色上轉一點色相／明度（類似色），整體統一又不單調
    for k in list(COL):
        dh, sm, vm = SHIFT.get(k, (0, 1, 1))
        COL[k] = hsv_shift(mid, dh, sm, vm)
    GREEN = mid
    HDR.update({'title': mid, 'tax': mid, 'zoom': mid})


# ── 合成卡 ────────────────────────────────────────────
def compose(f, art, out_scale=None):
    apply_theme(f)
    art_hi = art.convert('RGB') if art is not None else None
    art = art_hi.resize((W, H), Image.LANCZOS) if art_hi is not None else None   # 只用於對位檢查
    code = f['iucn']['code']
    zh, en = INFO.get(code, ('資料待查', ''))
    TH = HDR['title']
    cv = Canvas()
    cv.rr((8, 8, W - 8, H - 8), 30, outline=TH, width=6)

    # ── 1. 下方資訊區（先畫，圖貼在最後）
    c = COL['tax']
    panel(cv, TAX, 'tax')
    g = f['genus']
    rows = [('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'),
            ('目', ' '.join(filter(None, f['order'])) or '資料待查'), ('科', ' '.join(filter(None, f['family'])) or '資料待查'),
            ('屬', (g + ' 屬') if g else '資料待查'),
            ('種', f['z'] + (' ' + g[0] + '. ' + f['epithet'] if g and f['epithet'] else ''))]
    for i, (k, v) in enumerate(rows):
        y = TAX[1] + 62 + i * 28
        x = TAX[0] + 22 + i * 8
        last = i == len(rows) - 1
        cv.text(x, y, k, 19, dark(c, 0.15))
        cv.text(x + 26, y, v, 17 if not last else 18, INK if not last else dark(c, 0.2), bold=last, maxw=TAX[2] - x - 38)

    panel(cv, HABP, 'hab', 0.78)
    panel(cv, GROWP, 'grow')
    c = COL['grow']
    for i, (cx, cy, r) in enumerate(GROW_C):
        cv.circ(cx, cy, r + 5, fill=tint(c, 0.7), outline=c, width=3)
        if i < 2:
            ax = cx + r + 12
            cv.poly([(ax, cy - 7), (ax + 8, cy), (ax, cy + 7)], fill=mix(c, WHITE, 0.1))
    panel(cv, MAPP, 'map', 0.7)
    cv.rr((MAP[0] - 3, MAP[1] - 3, MAP[2] + 3, MAP[3] + 3), 12, outline=COL['map'], width=3)

    # 評分雷達：深色格（保留五個維度名）
    panel(cv, RADP, 'radar', dark_bg=True)
    c = mix(COL['radar'], WHITE, 0.65)
    x0 = RADP[0]
    cx, cy, R = x0 + 164, R2 + 112, 58
    sc = f['score']
    names = [('重要性', 'i'), ('適應力', 'a'), ('研究', 'r'), ('保育', 'c'), ('觀賞', 'v')]
    ang = [-math.pi / 2 + i * 2 * math.pi / 5 for i in range(5)]
    for lv in (1, 2, 3, 4, 5):
        cv.poly([(cx + R * lv / 5 * math.cos(a), cy + R * lv / 5 * math.sin(a)) for a in ang],
                outline=c if lv == 5 else mix(c, dark(COL['radar'], 0.28), 0.55), width=2.4 if lv == 5 else 1.2)
    for a in ang:
        cv.line([(cx, cy), (cx + R * math.cos(a), cy + R * math.sin(a))], mix(c, dark(COL['radar'], 0.28), 0.55), 1.2)
    pv = [float(sc[k]) if sc[k] else 0 for _, k in names]
    pts = [(cx + R * v / 5 * math.cos(a), cy + R * v / 5 * math.sin(a)) for v, a in zip(pv, ang)]
    cv.glass(pts, (255, 214, 90), 150)
    cv.poly(pts, outline=(255, 226, 120), width=2.6)
    for p in pts:
        cv.circ(p[0], p[1], 3.2, fill=(255, 226, 120))
    for (nm, k), a in zip(names, ang):
        lx, ly = cx + (R + 40) * math.cos(a), cy + (R + 26) * math.sin(a)
        cv.text(lx, ly - 10, nm, 16, WHITE, anchor='mm')
        v = sc[k] or '待查'
        cv.rr((lx - 22, ly + 1, lx + 22, ly + 22), 7, fill=WHITE)
        cv.text(lx, ly + 12, v, 16, dark(COL['radar'], 0.3), anchor='mm')
    try:
        n = max(0, min(5, round(float(sc['o']))))
    except (TypeError, ValueError):
        n = None
    yS = R2E - 22
    for i in range(5):
        cv.star(x0 + 58 + i * 27, yS, 11, (244, 190, 30) if n is not None and i < n else mix((244, 190, 30), dark(COL['radar'], 0.28), 0.7), (196, 140, 10))
    cv.text(x0 + 214, yS, sc['o'] or '?', 28, WHITE, anchor='lm', maxw=80)

    panel(cv, DIETP, 'diet')
    c = COL['diet']
    diet = f['diet'][:4]
    if not diet:
        cv.text((DIETP[0] + DIETP[2]) / 2, R2 + 124, '資料待查', 24, mix(INK, WHITE, 0.2), anchor='mm')
    for dx, dy, r in diet_positions(len(diet)):
        cv.circ(DIETP[0] + dx, DIETP[1] + dy, r + 5, fill=tint(c, 0.7), outline=c, width=3)

    panel(cv, SIMP, 'sim')
    c = COL['sim']
    cv.icon('sim', 240, SIM_Y, 52)
    for i in range(2):
        cx = SIM_X[i]
        cv.circ(cx, SIM_Y, 50, fill=tint(c, 0.7), outline=c, width=3)
        nm = f['sim'][i] if i < len(f['sim']) else ''
        if nm:
            cv.rr((cx - 92, 1458, cx + 92, 1488), 10, fill=WHITE)
            cv.text(cx, 1473, nm, 20, INK, anchor='mm', maxw=172)

    panel(cv, CONSP, 'cons', 0.8)
    cur = dict(SCALE).get(code)
    cy = 1394
    for i, (k, col) in enumerate(SCALE):
        x = 532 + i * 66
        if k == code:
            cv.circ(x, cy, 36, fill=col, outline=INK, width=5)
            cv.text(x, cy + 1, k, 28, WHITE if sum(col) < 450 else INK, anchor='mm')
            cv.poly([(x - 9, cy + 45), (x + 9, cy + 45), (x, cy + 56)], fill=INK)
        else:
            soft = mix(col, WHITE, 0.45)
            cv.circ(x, cy, 21, fill=soft, outline=(215, 215, 205), width=2)
            cv.text(x, cy + 1, k, 14, WHITE if sum(soft) < 420 else (90, 100, 88), anchor='mm')
    cv.text(730, 1481, zh, 28, INK, anchor='mm', maxw=440)

    # ── 2. 主圖（滿版）與其框
    shifts = {}
    base_np = art_np = None
    if art is not None:
        base_np = np.array(compose(f, None, 1)).astype(float)
        art_np = np.array(art).astype(float)

    def put(name, kind, geo, ring):
        key = ''.join(ch for ch in name if not ch.isdigit())
        if art is not None:
            dx, dy, cst, c0 = align(base_np, art_np, kind, geo, ring)
            use = c0 > 25 and cst < c0 * 0.6 and cst < 60
            if VERBOSE:
                print(f'  {name}: shift ({dx:+d},{dy:+d}) cost {cst:.0f} (原位 {c0:.0f}){" 採用" if use else ""}')
            cv.paste_art(art_hi, kind, geo, (dx, dy) if use else (0, 0), rad=20 if name == 'photo' else 12)
        else:
            col = COL[{'pixel': 'tax', 'photo': 'zoom', 'zoom': 'zoom', 'map': 'map', 'hab': 'hab', 'diet': 'diet', 'grow': 'grow', 'sim': 'sim'}[key]]
            if kind == 'rect':
                cv.rr(geo, 14, fill=tint(col, 0.75))
            else:
                cv.circ(geo[0], geo[1], geo[2], fill=tint(col, 0.75))

    allslots = slots(f)
    for sl in allslots:
        if sl[0] == 'photo':
            put(*sl)
    cv.rr((PHOTO[0] - 3, PHOTO[1] - 3, PHOTO[2] + 3, PHOTO[3] + 3), 22, outline=TH, width=4)

    # ── 3. 疊在圖上的資訊（半透明斜角色塊）
    # 編號（全卡唯一暖色強調）
    cv.glass([(34, 34), (246, 34), (232, 104), (34, 104)], HDR['no'], 255)
    cv.circ(66, 69, 17, outline=WHITE, width=4)
    cv.line([(49, 69), (83, 69)], WHITE, 4)
    cv.circ(66, 69, 6, fill=HDR['no'], outline=WHITE, width=3)
    cv.text(92, 70, 'NO.' + f['id'], 33, WHITE, anchor='lm', maxw=140)
    # 名稱
    cv.glass([(254, 34), (706, 34), (690, 130), (254, 130)], TH, 238)
    cv.text(472, 58, f['z'], 48, WHITE, anchor='mm', maxw=420)
    cv.text(472, 92, f['e'], 23, (236, 244, 230), anchor='mm', maxw=420)
    cv.text(472, 114, f['s'], 18, (200, 224, 196), bold=False, anchor='mm', maxw=420, italic=True)
    # 目／科／身長／體重／常見度：長條
    sx0, sx1 = 722, 996
    strips = [(36, 68, '目', f['order'][0]), (72, 104, '科', f['family'][0]),
              (112, 144, '身長', f['len']), (148, 180, '體重', f['mass'])]
    for y0, y1, lab, val in strips:
        cv.glass([(sx0, y0), (sx1, y0), (sx1, y1), (sx0, y1)], (252, 251, 246), 238)
        cv.rr((sx0, y0, sx0 + 4, y1), 2, fill=TH)
        cv.text(sx0 + 16, (y0 + y1) / 2, lab, 20, dark(TH, 0.1))
        cv.text(sx0 + 84, (y0 + y1) / 2, val or '資料待查', 21, INK, maxw=sx1 - sx0 - 94)
    cv.glass([(sx0, 188), (sx1, 188), (sx1, 222), (sx0, 222)], (252, 251, 246), 238)
    cv.rr((sx0, 188, sx0 + 4, 222), 2, fill=TH)
    cv.text(sx0 + 16, 205, '常見度', 20, dark(TH, 0.1))
    fq = f.get('freq')
    if fq is None:
        cv.text(sx0 + 98, 205, '資料待查', 21, INK)
    else:
        for i in range(5):
            cv.ball(sx0 + 110 + i * 30, 205, 11, on=i < int(fq))
    # 像素圖貼紙
    cv.rr(PIXEL_FRAME, 16, fill=WHITE, outline=TH, width=3)
    # 四個特徵圓
    c = COL['zoom']
    for (cx, cy, r) in ZOOM_C:
        cv.circ(cx, cy, r + 6, fill=WHITE)
        cv.circ(cx, cy, r + 4, outline=c, width=3)

    # ── 4. 其餘圖片
    for sl in allslots:
        if sl[0] != 'photo':
            put(*sl)

    # ── 5. 蓋在圖上的小標：特徵名牌、圖示章
    for (cx, cy, r), lab in zip(ZOOM_C, ZOOM_LABELS):
        cv.rr((cx - 38, cy + r - 8, cx + 38, cy + r + 18), 13, fill=TH, outline=WHITE, width=2)
        cv.text(cx, cy + r + 5, lab, 18, WHITE, anchor='mm')
    badge(cv, TAX, 'tax')
    badge(cv, HABP, 'hab')
    badge(cv, GROWP, 'grow')
    badge(cv, DIETP, 'diet')
    return cv.done(out_scale)



# ══════════════════════════════════════════════════════════════
# 手機精簡版（AVX_LAYOUT=mobile，預設）
#   用戶 2026-11-12：資訊圖卡在手機上太擠。詳細資料頁已經有的東西（編號、名稱、目科、身長體重、
#   棲地、食性、繁殖、行為）全部拿走，只留「詳細資料頁沒有的」：
#   像素圖、常見度、分類階層、四個特徵放大圈、分佈圖、評分雷達、保育級別、相似鳥。
#   → 8 個元素，每個都比完整版大，手機上一眼讀得到。完整版仍可用 AVX_LAYOUT=full。
# ══════════════════════════════════════════════════════════════
M_BG_K = 0.82           # 底色：主題色壓暗到幾乎黑，保留一點色相
GOLD = (222, 188, 112)
GOLD_D = (150, 122, 64)
M_PIXEL_FRAME = (36, 36, 356, 356)
M_PIXEL = (46, 46, 346, 346)
M_RARE = (36, 368, 356, 416)
M_TAX = (372, 36, 988, 416)
M_ZOOMP = (36, 432, 988, 660)
M_ZOOM = [(36 + 238 * (i + 0.5), 536, 88) for i in range(4)]
M_RADP = (36, 676, 988, 1170)
M_MAPP = (36, 1186, 540, 1500)
M_MAP = (M_MAPP[0] + 8, M_MAPP[1] + 8, M_MAPP[2] - 8, M_MAPP[3] - 8)
M_SIMP = (556, 1186, 988, 1500)
M_SIM = [(668, 1330, 70), (876, 1330, 70)]
RARE_OF = {'LC': 1, 'NT': 2, 'VU': 3, 'EN': 4, 'CR': 5, 'EW': 6, 'EX': 7}   # 用戶 2026-11-12：七星，滅絕 7、野外滅絕 6、極危 5


def rarity(f):
    """卡片稀有度 1–7 星，只看保育級別（用戶 2026-11-12：常見度不參與）。
    無危 1、近危 2、易危 3、瀕危 4、極危 5、野外滅絕 6、滅絕 7；未評估／缺資料＝0（全不點亮，不亂填）。"""
    return RARE_OF.get((f.get('iucn') or {}).get('code'), 0)


def slim_slots(f):
    box = lambda b, k: (b[0] - k, b[1] - k, b[2] + k, b[3] + k)
    out = [('pixel', 'rect', M_PIXEL, box(M_PIXEL, 1.5)), ('map', 'rect', M_MAP, box(M_MAP, 1.5))]
    out += [(f'zoom{i}', 'circle', (round(c[0]), c[1], c[2]), c[2] + 3.5) for i, c in enumerate(M_ZOOM)]
    out += [(f'sim{i}', 'circle', c, c[2] + 3.5) for i, c in enumerate(M_SIM)]
    return out


def sparkle(cv, cx, cy, r, fill, outline):
    """四角星（✦），像角色面板的星級"""
    k = 0.34
    pts = []
    for i in range(8):
        a = -math.pi / 2 + i * math.pi / 4
        rr = r if i % 2 == 0 else r * k
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    cv.poly(pts, fill=fill, outline=outline, width=1.6)


def diamond(cv, cx, cy, r, fill=None, outline=None, width=2):
    cv.poly([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=fill, outline=outline, width=width)


def gpanel(cv, box, th, k=0.55, hi=False):
    """遊戲面板：深色玻璃底 + 金色細框 + 四角小菱形"""
    x0, y0, x1, y1 = box
    cv.rr(box, 14, fill=mix(dark(th, 0.62), (0, 0, 0), 0.0) if not hi else dark(th, 0.5), outline=GOLD_D, width=2)
    cv.rr((x0 + 5, y0 + 5, x1 - 5, y1 - 5), 10, outline=mix(GOLD_D, dark(th, 0.62), 0.55), width=1)
    for (x, y) in ((x0, y0), (x1, y0), (x0, y1), (x1, y1)):
        diamond(cv, x, y, 7, fill=GOLD, outline=dark(GOLD, 0.45), width=1.5)


def slim_radar_points(scores, names, angles, cx, cy, radius):
    """Unknown axes are absent, not points at zero; explicit zero remains valid."""
    return [(cx + radius * float(scores[k]) / 5 * math.cos(a),
             cy + radius * float(scores[k]) / 5 * math.sin(a))
            if scores[k] not in ('', None) else None for (_, k), a in zip(names, angles)]


def compose_slim(f, art, out_scale=None):
    apply_theme(f)
    art_hi = art.convert('RGB') if art is not None else None
    art = art_hi.resize((W, H), Image.LANCZOS) if art_hi is not None else None
    code = f['iucn']['code']
    zh, _en = INFO.get(code, ('資料待查', ''))
    TH = HDR['title']
    BG = dark(TH, M_BG_K)
    cv = Canvas()
    cv.d.rectangle([0, 0, W * SS, H * SS], fill=BG)
    # 面板底紋：細金線的斜紋，像遊戲面板的暗紋
    for i in range(-H, W, 46):
        cv.line([(i, 0), (i + H * 0.55, H)], mix(BG, GOLD, 0.05), 1)
    cv.rr((8, 8, W - 8, H - 8), 28, outline=GOLD, width=4)
    cv.rr((16, 16, W - 16, H - 16), 22, outline=GOLD_D, width=1.5)
    cream = (244, 238, 222)

    # ── 像素圖：金色雙框 ──
    cv.rr(M_PIXEL_FRAME, 18, fill=mix(TH, WHITE, 0.55), outline=GOLD, width=4)
    cv.rr((M_PIXEL_FRAME[0] + 6, M_PIXEL_FRAME[1] + 6, M_PIXEL_FRAME[2] - 6, M_PIXEL_FRAME[3] - 6), 13, outline=GOLD_D, width=1.5)

    # ── 稀有度：小標示（5 顆菱形 + 保育級別小章），不佔版面 ──
    n = rarity(f)
    ry = (M_RARE[1] + M_RARE[3]) / 2
    for i in range(7):
        on = i < n
        sparkle(cv, 54 + i * 29, ry, 13.5, GOLD if on else mix(BG, GOLD, 0.14), GOLD if on else GOLD_D)
    col = dict(SCALE).get(code)
    if col:
        px0, px1 = 262, 354
        py = (M_RARE[1] + M_RARE[3]) / 2
        cv.rr((px0, py - 19, px1, py + 19), 19, fill=col, outline=cream, width=2)
        cv.text((px0 + px1) / 2, py + 1, zh, 22, WHITE if sum(col) < 450 else INK, anchor='mm', maxw=90)

    # ── 分類階層 ──
    gpanel(cv, M_TAX, TH)
    g = f['genus']
    rows = [('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'),
            ('目', ' '.join(filter(None, f['order'])) or '資料待查'), ('科', ' '.join(filter(None, f['family'])) or '資料待查'),
            ('屬', (g + ' 屬') if g else '資料待查'),
            ('種', f['z'] + (' ' + g[0] + '. ' + f['epithet'] if g and f['epithet'] else ''))]
    for i, (k, v) in enumerate(rows):
        y = M_TAX[1] + 56 + i * 49
        x = M_TAX[0] + 34 + i * 12
        last = i == len(rows) - 1
        cv.text(x, y, k, 30, GOLD)
        cv.text(x + 44, y, v, 26 if not last else 28, cream if not last else (255, 232, 160), bold=last, maxw=M_TAX[2] - x - 70)
        if not last:
            cv.line([(x + 44, y + 25), (M_TAX[2] - 26, y + 25)], mix(BG, GOLD, 0.16), 1)

    # ── 特徵放大圈（金環 + 菱形節點）──
    gpanel(cv, M_ZOOMP, TH)
    for (cx, cy, r) in M_ZOOM:
        cv.circ(cx, cy, r + 9, outline=GOLD_D, width=1.5)
        cv.circ(cx, cy, r + 5, fill=WHITE)
        cv.circ(cx, cy, r + 3, outline=GOLD, width=4)
        for (dx, dy) in ((0, -1), (1, 0), (-1, 0)):
            diamond(cv, cx + dx * (r + 9), cy + dy * (r + 9), 6, fill=GOLD, outline=dark(GOLD, 0.45), width=1)

    # ── 雷達（主角）：放大、五個菱形節點，像角色面板的五芒共鳴圖 ──
    gpanel(cv, M_RADP, TH, hi=True)
    x0, y0, x1, y1 = M_RADP
    cx, cy, R = (x0 + x1) / 2 + 80, y0 + 254, 150
    for rr_ in (R + 150, R + 104, R + 64):
        cv.circ(cx, cy, rr_, outline=mix(dark(TH, 0.5), GOLD, 0.16), width=1)
    ang = [-math.pi / 2 + i * 2 * math.pi / 5 for i in range(5)]
    for a in ang:     # 外圈五角連線
        pass
    sc = f['score']
    names = [('重要性', 'i'), ('適應力', 'a'), ('研究', 'r'), ('保育', 'c'), ('觀賞', 'v')]
    for lv in (1, 2, 3, 4, 5):
        cv.poly([(cx + R * lv / 5 * math.cos(a), cy + R * lv / 5 * math.sin(a)) for a in ang],
                outline=GOLD if lv == 5 else mix(dark(TH, 0.5), GOLD, 0.30), width=2.6 if lv == 5 else 1.2)
    for a in ang:
        cv.line([(cx, cy), (cx + R * math.cos(a), cy + R * math.sin(a))], mix(dark(TH, 0.5), GOLD, 0.30), 1.2)
    # An unknown score is not zero: never draw a point at the origin or fill a
    # polygon through it. Show known points and only edges between adjacent
    # known axes; retain the original filled polygon when all axes are known.
    pts = slim_radar_points(sc, names, ang, cx, cy, R)
    if all(p is not None for p in pts):
        cv.glass(pts, (255, 206, 90), 140)
        cv.poly(pts, outline=(255, 226, 130), width=3.4)
    else:
        for i, p in enumerate(pts):
            other = pts[(i + 1) % len(pts)]
            if p is not None and other is not None:
                cv.line([p, other], (255, 226, 130), 3.4)
    for q in pts:
        if q is not None:
            diamond(cv, q[0], q[1], 7, fill=(255, 238, 170), outline=(150, 110, 30), width=1.5)
    for (nm, k), a in zip(names, ang):
        lx, ly = cx + (R + 46) * math.cos(a), cy + (R + 46) * math.sin(a)
        diamond(cv, lx, ly, 42, fill=dark(TH, 0.35), outline=GOLD, width=2.5)
        diamond(cv, lx, ly, 36, outline=GOLD_D, width=1)
        cv.text(lx, ly - 11, nm, 17, cream, anchor='mm', maxw=50)
        v = sc[k] or '待查'
        cv.text(lx, ly + 12, v, 24, (255, 226, 130), anchor='mm', maxw=50)
    # 總分：五星 + 大數字
    try:
        nstar = max(0, min(5, round(float(sc['o']))))
    except (TypeError, ValueError):
        nstar = None
    # 總分放左側當主角：大數字 + 五星（像角色面板的等級／星級）
    sy = cy - 24
    cv.text(x0 + 52, sy, sc['o'] or '?', 104, (255, 232, 160), anchor='lm', maxw=170)
    for i in range(5):
        cv.star(x0 + 70 + i * 40, sy + 78, 17, (244, 190, 30) if nstar is not None and i < nstar else mix(BG, (244, 190, 30), 0.22), (196, 140, 10))

    # ── 分佈圖 ──
    gpanel(cv, M_MAPP, TH)
    cv.rr((M_MAP[0] - 3, M_MAP[1] - 3, M_MAP[2] + 3, M_MAP[3] + 3), 12, outline=GOLD, width=2.5)

    # ── 相似鳥 ──
    gpanel(cv, M_SIMP, TH)
    cv.icon('sim', (M_SIMP[0] + M_SIMP[2]) / 2, M_SIMP[1] + 44, 46)
    for (cx, cy, r) in M_SIM:
        cv.circ(cx, cy, r + 8, outline=GOLD_D, width=1.5)
        cv.circ(cx, cy, r + 5, fill=WHITE)
        cv.circ(cx, cy, r + 3, outline=GOLD, width=3.5)

    # ── 貼 AI 圖 ──
    base_np = art_np = None
    if art is not None:
        base_np = np.array(compose_slim(f, None, 1)).astype(float)
        art_np = np.array(art).astype(float)
    for name, kind, geo, ring in slim_slots(f):
        key = ''.join(ch for ch in name if not ch.isdigit())
        if art is not None:
            dx, dy, cst, c0 = align(base_np, art_np, kind, geo, ring)
            use = c0 > 25 and cst < c0 * 0.6 and cst < 60
            if VERBOSE:
                print(f'  {name}: shift ({dx:+d},{dy:+d}) cost {cst:.0f} (原位 {c0:.0f}){" 採用" if use else ""}')
            cv.paste_art(art_hi, kind, geo, (dx, dy) if use else (0, 0), rad=14 if kind == 'rect' else 12)
        else:
            fillc = mix(TH, WHITE, 0.55)
            if kind == 'rect':
                cv.rr(geo, 14, fill=fillc)
            else:
                cv.circ(geo[0], geo[1], geo[2], fill=fillc)

    # ── 名牌 ──
    for (cx, cy, r), lab in zip(M_ZOOM, ZOOM_LABELS):
        label, label_size, label_width = slim_feature_label(lab)
        cv.rr((cx - label_width / 2, cy + r - 6, cx + label_width / 2, cy + r + 26), 16, fill=dark(TH, 0.3), outline=GOLD, width=2.5)
        cv.text(cx, cy + r + 10, label, label_size, cream, anchor='mm')
    for i, (cx, cy, r) in enumerate(M_SIM):
        nm = f['sim'][i] if i < len(f['sim']) else ''
        if nm:
            cv.rr((cx - 98, cy + r + 14, cx + 98, cy + r + 48), 14, fill=dark(TH, 0.3), outline=GOLD, width=2)
            cv.text(cx, cy + r + 31, nm, 23, cream, anchor='mm', maxw=180)
    return cv.done(out_scale)


def art_prompt_slim(f):
    L = [
        f"IMAGE 1 is a compact dark game-style character-panel bird information card for {f['z']} ({f['e']}, {f['s']}) that is finished except for its EMPTY PICTURE SLOTS (flat pale-coloured rectangles and circles). Fill ONLY those slots with illustrations. Use correct plumage and bare-part colours for this species; one species only.",
        'Keep everything else in IMAGE 1 exactly as it is: all layout, panels, colours, icons, numbers and text stay untouched at the same positions; do not redraw, move, resize or retype anything. Each picture must fill its slot edge to edge with the subject centred and fully inside the slot (circles: the whole subject inside the circle, nothing cut off by the rim) and contain NO text, letters, numbers or watermarks.',
        'Slots:',
        '  · Large square sticker (top-left): 16-bit pixel art of the bird, side view, plain light background.',
        '  · Four big circles in one row (upper-middle of the card), left to right: close-ups of (1) head and bill, (2) plumage pattern, (3) folded or spread wing, (4) feet and legs.',
        '  · Frame at the bottom-left (the frame itself is the map): flat world map in soft pale colours, no country borders in different colours, with the species range shaded green' + (f" (range: {f.get('range')})" if f.get('range') else '') + '.',
        '  · Bottom-right panel: two circles below the small glasses icon: realistic head-and-neck portraits of two different similar species — ' + ' and '.join(f['sim'][:2]) + '.',
        'Style for pictures: clean, bright, crisp, kid-friendly. Do not add anything outside the slots.',
    ]
    return '\n'.join(L)


# ── 給生圖 AI 的 prompt：零文字 ─────────────────────────
def art_prompt(f):
    hab = f['hab'][:4]
    diet = f['diet'][:4]
    L = [
        f"IMAGE 1 is a bird information card for {f['z']} ({f['e']}, {f['s']}) that is finished except for its EMPTY PICTURE SLOTS (flat pale-coloured rectangles and circles). Fill ONLY those slots with illustrations. Use correct plumage and bare-part colours for this species; one species only.",
        'Keep everything else in IMAGE 1 exactly as it is: all layout, panels, colours, titles, icons, numbers and text stay untouched at the same positions; do not redraw, move, resize or retype anything. Each picture must fill its slot edge to edge with the subject centred and fully inside the slot (circles: the whole subject inside the circle, nothing cut off by the rim) and contain NO text, letters, numbers or watermarks.',
        'Slots:',
        '  · HUGE top frame (almost the whole upper half of the card, full-art style): photorealistic photo of the bird, whole body, in its natural habitat. Keep the bird in the CENTRE of the frame, large, and keep the top strip, the right-hand column and the bottom-left corner as plain background (other panels overlap them).',
        '  · Small square sticker (bottom-left over the big photo): 16-bit pixel art of the bird, side view, plain light background.',
        '  · Right column over the photo, 4 circles top to bottom: close-ups of (1) head and bill, (2) plumage pattern, (3) folded or spread wing, (4) feet and legs.',
        '  · Lower-left wide frame (the frame itself is the map): flat world map in soft pale colours, no country borders in different colours, with the species range shaded green' + (f" (range: {f.get('range')})" if f.get('range') else '') + '.',
    ]
    if hab:
        L.append('  · Habitat: ONE wide panoramic frame (middle of the first lower row) — a single flat colourful illustration scene combining: ' + '; '.join(hab) + '.')
    if diet:
        L.append('  · Food circles (right panel of the second lower row): ' + '; '.join(f'{i + 1}. {h}' for i, h in enumerate(diet)) + ' — colourful flat sticker-style illustrations of the typical food items in natural food colours.')
    L.append('  · Growth circles (right panel of the first lower row) three circles left to right: (1) a nest, (2) eggs, (3) a chick — colourful flat sticker style, typical for this species.')
    L.append('  · Bottom-left panel: two circles either side of the small glasses icon: realistic head-and-neck portraits of two different similar species — ' + ' and '.join(f['sim'][:2]) + '.')
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
        (compose_slim if LAYOUT_MODE == 'mobile' else compose)(f, None, 1).save(sys.argv[4])
    elif mode == 'prompt':
        print(art_prompt_slim(f) if LAYOUT_MODE == 'mobile' else art_prompt(f))
    elif mode == 'compose':
        (compose_slim if LAYOUT_MODE == 'mobile' else compose)(f, Image.open(sys.argv[4])).save(sys.argv[5], optimize=True)
    else:
        raise SystemExit(__doc__)


if __name__ == '__main__':
    main()
