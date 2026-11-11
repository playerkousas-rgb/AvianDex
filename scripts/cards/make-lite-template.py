#!/usr/bin/env python3
"""
make-lite-template.py —— 「精簡圖示卡」版位圖（只留數字與圖示）

想法：AI 畫長句繁體會出錯字；所以卡面不放任何句子，只放
  名稱／數字／短標籤（目科屬種、棲地、食物各 2–3 字）＋ 圖示。
固定標題（身長、體重、分類資訊、棲息環境…）由本程式用真字體寫死在位圖上，
AI 只准保留，不准重畫；AI 只負責填「空位」：名稱、數字、短標籤、圖。

用法：python3 scripts/cards/make-lite-template.py docs/card-samples/lite-template.png
"""
import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 1536
CREAM = (247, 242, 228)
PANEL = (252, 249, 238)
GREEN = (47, 93, 58)
SAGE = (150, 166, 138)
LINE = (186, 196, 176)
INK = (52, 66, 50)
WHITE = (250, 250, 244)
FONT_DIR = os.path.expanduser('~/.fonts')


def font(sz, bold=True):
    for p in ([f'{FONT_DIR}/NotoSansTC_700Bold.ttf'] if bold else []) + [f'{FONT_DIR}/NotoSansTC_400Regular.ttf', f'{FONT_DIR}/NotoSansTC_700Bold.ttf']:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    raise SystemExit('找不到 Noto Sans TC 字體（放到 ~/.fonts）')


img = Image.new('RGB', (W, H), CREAM)
d = ImageDraw.Draw(img)


def rr(box, r=10, **kw):
    d.rounded_rectangle(box, radius=r, **kw)


def title_bar(x0, y0, x1, text, h=34):
    rr([x0, y0, x1, y0 + h], 9, fill=GREEN)
    d.text((x0 + 14, y0 + h // 2), text, font=font(20), fill=WHITE, anchor='lm')


def panel(x0, y0, x1, y1, title):
    rr([x0, y0 + 30, x1, y1], 10, fill=PANEL, outline=LINE, width=2)
    title_bar(x0, y0, x1, title)


def slot(box, r=8):
    """空位：留給 AI 填的字（淺虛框）"""
    x0, y0, x1, y1 = box
    rr(box, r, outline=(205, 212, 195), width=2)


def icon_circle(cx, cy, r=30):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(238, 240, 228), outline=SAGE, width=3)


# ── 外框 ───────────────────────────────────────────────
rr([12, 12, W - 12, H - 12], 26, outline=GREEN, width=3)
rr([20, 20, W - 20, H - 20], 22, outline=(200, 208, 190), width=1)

# ── 頂部 ───────────────────────────────────────────────
rr([30, 24, 246, 100], 12, fill=GREEN)
d.ellipse([42, 40, 76, 74], outline=WHITE, width=4)
d.line([(42, 57), (76, 57)], fill=WHITE, width=4)
d.text((92, 62), 'NO.', font=font(34), fill=WHITE, anchor='lm')
# NO. 後面 4 位數字留空（淺色虛位）
for i in range(4):
    x = 150 + i * 22
    d.line([(x, 76), (x + 14, 76)], fill=(160, 190, 160), width=3)

rr([256, 20, 744, 100], 10, fill=GREEN)
for x in range(276, 560, 46):
    d.line([(x, 46), (min(x + 34, 560), 46)], fill=(228, 240, 224), width=14)
for x in range(276, 480, 26):
    d.line([(x, 80), (min(x + 18, 480), 80)], fill=(196, 214, 194), width=8)

rr([766, 20, 1004, 100], 10, fill=PANEL, outline=LINE, width=2)
d.text((780, 44), '目', font=font(22), fill=INK, anchor='lm')
d.text((780, 78), '科', font=font(22), fill=INK, anchor='lm')
slot([814, 30, 996, 58], 6)
slot([814, 66, 996, 92], 6)

# ── 像素圖 ─────────────────────────────────────────────
rr([28, 120, 240, 332], 10, fill=(246, 246, 238), outline=GREEN, width=3)
for gx in range(40, 232, 16):
    d.line([(gx, 128), (gx, 324)], fill=(232, 236, 224), width=1)
for gy in range(128, 332, 16):
    d.line([(36, gy), (232, gy)], fill=(232, 236, 224), width=1)
d.text((134, 350), '像素圖鑑', font=font(17), fill=INK, anchor='mm')

# ── 三個數值（左欄）─────────────────────────────────────
def stat(y, label, unit_hint):
    rr([28, y, 240, y + 74], 10, fill=PANEL, outline=LINE, width=2)
    d.text((44, y + 22), label, font=font(21), fill=GREEN, anchor='lm')
    slot([44, y + 38, 226, y + 66], 6)


# 圖示：尺、秤、盾（保育）
stat(378, '身長', 'cm')
d.line([(206, 388), (206, 408)], fill=GREEN, width=3)
d.line([(196, 388), (216, 388)], fill=GREEN, width=3)
d.line([(196, 398), (216, 398)], fill=GREEN, width=2)
stat(466, '體重', 'g')
d.polygon([(198, 520), (214, 520), (218, 504), (194, 504)], outline=GREEN, fill=None)
d.ellipse([200, 494, 212, 506], outline=GREEN, width=3)
stat(554, '保育級別', '')
d.ellipse([196, 568, 218, 590], outline=GREEN, width=3)

# ── 主圖框 ─────────────────────────────────────────────
rr([262, 120, 740, 720], 14, outline=GREEN, width=3)

# ── 右欄：特徵放大鏡（4 個）──────────────────────────────
title_bar(766, 120, 1004, '特徵放大鏡', 36)
labels = ['頭部', '羽色', '翼部', '腳部']
for i, t in enumerate(labels):
    cy = 218 + i * 126
    d.ellipse([776, cy - 54, 884, cy + 54], fill=(240, 240, 232), outline=GREEN, width=3)
    d.text((944, cy), t, font=font(26), fill=INK, anchor='mm')

# ── 第一排面板：分類／棲息／食物 ───────────────────────────
COLS = [(28, 330), (350, 660), (690, 1000)]
Y1, Y1E = 742, 1016
panel(COLS[0][0], Y1, COLS[0][1], Y1E, '分類資訊')
rows = [('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'), ('目', None), ('科', None), ('屬', None), ('種', None)]
for i, (k, v) in enumerate(rows):
    y = Y1 + 56 + i * 31
    d.ellipse([42, y - 7, 56, y + 7], outline=SAGE, width=2)
    d.text((66, y), k, font=font(19), fill=GREEN, anchor='lm')
    if v:
        d.text((100, y), v, font=font(18, False), fill=INK, anchor='lm')
    else:
        slot([98, y - 12, 318, y + 12], 5)

for (x0, x1), title in zip(COLS[1:], ['棲息環境', '食物']):
    panel(x0, Y1, x1, Y1E, title)
    # 2×2 圖示格，每格下面一個 2–3 字短標籤空位
    for r in range(2):
        for c in range(2):
            cx = x0 + 78 + c * 154
            cy = Y1 + 96 + r * 110
            icon_circle(cx, cy, 38)
            slot([cx - 60, cy + 42, cx + 60, cy + 66], 5)

# ── 第二排：分佈／成長／評分 ─────────────────────────────
Y2, Y2E = 1040, 1300
panel(COLS[0][0], Y2, COLS[0][1], Y2E, '分佈地區')
rr([42, Y2 + 44, 316, Y2E - 14], 8, fill=(226, 236, 222), outline=SAGE, width=2)
panel(COLS[1][0], Y2, COLS[1][1], Y2E, '成長與繁殖')
for i in range(3):
    cx = COLS[1][0] + 62 + i * 92
    icon_circle(cx, Y2 + 130, 38)
panel(COLS[2][0], Y2, COLS[2][1], Y2E, '生態價值評分')
# 雷達：頂點順時針 重要性／適應力／研究價值／保育關注／觀賞價值
cx, cy, R = COLS[2][0] + 155, Y2 + 136, 46
pts = []
names = ['重要性', '適應力', '研究', '保育', '觀賞']
for i in range(5):
    a = -math.pi / 2 + i * 2 * math.pi / 5
    pts.append((cx + R * math.cos(a), cy + R * math.sin(a)))
d.polygon(pts, outline=GREEN, fill=(236, 242, 230))
for p in pts:
    d.line([(cx, cy), p], fill=(190, 204, 184), width=1)
for i, (p, n) in enumerate(zip(pts, names)):
    a = -math.pi / 2 + i * 2 * math.pi / 5
    lx, ly = cx + (R + 40) * math.cos(a), cy + (R + 22) * math.sin(a)
    d.text((lx, ly - 9), n, font=font(15), fill=INK, anchor='mm')
    slot([lx - 24, ly + 2, lx + 24, ly + 24], 4)
d.text((COLS[2][0] + 18, Y2E - 20), '總評分', font=font(18), fill=GREEN, anchor='lm')
slot([COLS[2][0] + 84, Y2E - 34, COLS[2][1] - 14, Y2E - 6], 6)

# ── 底排：叫聲／可混淆物種／保育狀態 ───────────────────────
Y3, Y3E = 1320, 1506
panel(COLS[0][0], Y3, COLS[0][1], Y3E, '叫聲')
for i, x in enumerate(range(46, 314, 6)):
    h = 8 + int(26 * abs(math.sin(i * 0.55)) * (0.4 + 0.6 * abs(math.sin(i * 0.17))))
    d.line([(x, 1428 - h), (x, 1428 + h)], fill=GREEN, width=3)
panel(COLS[1][0], Y3, COLS[1][1], Y3E, '可混淆物種')
for i in range(2):
    cx = COLS[1][0] + 62 + i * 156
    icon_circle(cx, 1404, 32)
    slot([cx - 56, 1442, cx + 56, 1466], 5)
panel(COLS[2][0], Y3, COLS[2][1], Y3E, '保育狀態')
d.ellipse([706, 1370, 786, 1450], outline=GREEN, width=4, fill=(238, 244, 232))
d.text((746, 1388), 'IUCN', font=font(14), fill=INK, anchor='mm')
slot([716, 1404, 776, 1436], 4)
slot([806, 1384, 990, 1416], 6)
slot([806, 1424, 990, 1456], 6)

out = sys.argv[1] if len(sys.argv) > 1 else 'lite-template.png'
img.save(out)
print('已寫入', out)
