#!/usr/bin/env python3
"""
make-zone-map.py —— 用程式畫「去字版位圖」（layout zone map）

為什麼不用修圖擦字：擦字一定留殘影，插畫又會被誤傷。
這張圖是由零開始畫的：只有框線、綠色標題條、面板、圓圈、雷達、頁腳帶，
再加 Z01–Z18 編號。冇任何物種文字，模型無得抄。

出圖時把它當 IMAGE 1（版面），原卡當 IMAGE 2（觀感參考），
再由 PRINTED TEXT 逐格填字。

用法：
  python3 scripts/cards/make-zone-map.py out.png [--fill]
    --fill  在格子裡畫淺灰色假字線（示意每格有幾行）
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 1536
CREAM = (247, 242, 228)
PANEL = (252, 248, 236)
GREEN = (47, 93, 58)
SAGE = (150, 166, 138)
INK = (70, 84, 66)
RED = (176, 58, 48)

# 左欄 28–330 / 中欄 350–660 / 右欄 690–1000
COLS = [(28, 330), (350, 660), (690, 1000)]


import os
FONT_DIR = os.path.expanduser('~/.fonts')


def font(sz, bold=False):
    """優先用 Noto Sans TC（有中文字形），後備 DejaVu"""
    cands = []
    if bold:
        cands += [f'{FONT_DIR}/NotoSansTC_700Bold.ttf', f'{FONT_DIR}/NotoSansTC_900Black.ttf']
    else:
        cands += [f'{FONT_DIR}/NotoSansTC_400Regular.ttf', f'{FONT_DIR}/NotoSansTC_700Bold.ttf']
    cands += ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold
              else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
    for p in cands:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            continue
    return ImageFont.load_default()


def rrect(d, box, r, **kw):
    d.rounded_rectangle(box, radius=r, **kw)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'zone-map.png'
    show_fill = '--fill' in sys.argv

    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)

    # ── 外框 ─────────────────────────────────────────────
    rrect(d, [12, 12, W - 12, H - 12], 26, outline=GREEN, width=3)
    rrect(d, [20, 20, W - 20, H - 20], 22, outline=(200, 208, 190), width=1)

    # ── 頂部綠色帶 ───────────────────────────────────────
    rrect(d, [30, 24, 246, 78], 10, fill=GREEN)
    d.text((150, 51), 'NO.', font=font(30, True), fill=CREAM, anchor='mm')
    d.text((330, 52), 'Z01', font=font(20, True), fill=INK, anchor='lm')

    # 名稱區（虛線框＝要填大字名）
    d.rounded_rectangle([258, 20, 744, 96], radius=8, outline=(180, 190, 170), width=2)
    d.text((262, 30), 'Z01 中文大名 / 英文名 / 學名 / 分類', font=font(15), fill=INK)
    d.text((262, 66), 'Z02 屬性 · Z05 分類', font=font(13), fill=(140, 152, 132))

    # 圖鑑介紹
    d.rounded_rectangle([262, 300, 706, 470], radius=10, outline=(180, 190, 170), width=2)
    rrect(d, [266, 302, 452, 336], 8, fill=GREEN)
    d.text((272, 319), 'Z04 PROFILE', font=font(15, True), fill=CREAM, anchor='lm')
    if show_fill:
        for i, y in enumerate(range(352, 460, 16)):
            d.line([(280, y), (280 + 380 - i * 12, y)], fill=(214, 208, 190), width=7)

    # 三格數值
    for i in range(3):
        x = 30 + i * 100
        rrect(d, [x, 402, x + 92, 466], 8, fill=PANEL, outline=(196, 204, 186), width=2)
    d.text((176, 434), 'Z03', font=font(16, True), fill=INK, anchor='mm')

    # 左上像素圖框
    rrect(d, [28, 96, 240, 372], 10, fill=(246, 246, 238), outline=GREEN, width=3)
    d.text((134, 234), 'Z02 PIXEL', font=font(17, True), fill=(150, 162, 142), anchor='mm')

    # ── 右側四個放大鏡 ───────────────────────────────────
    rrect(d, [766, 18, 1004, 58], 10, fill=GREEN)
    d.text((885, 38), 'Z15 CALL-OUTS ×4', font=font(16, True), fill=CREAM, anchor='mm')
    for i in range(4):
        cy = 118 + i * 152
        d.ellipse([772, cy - 44, 860, cy + 44], fill=(240, 240, 232), outline=GREEN, width=3)
        d.text((816, cy), str(i + 1), font=font(22, True), fill=(150, 162, 142), anchor='mm')
        # 說明文字框
        d.rounded_rectangle([872, cy - 50, 1004, cy + 50], radius=8,
                            outline=(180, 190, 170), width=2)
        if show_fill:
            d.line([(880, cy - 12), (996, cy - 12)], fill=(214, 208, 190), width=6)
            d.line([(880, cy + 8), (996, cy + 8)], fill=(214, 208, 190), width=6)

    # 中間大圖框（鳥）—— 只佔中欄上半，唔壓住下面三個面板
    d.rounded_rectangle([470, 212, 750, 716], radius=14, outline=GREEN, width=3)
    d.text((610, 470), 'BIRD', font=font(30, True), fill=(206, 198, 178), anchor='mm')

    # ── 左欄：分類資訊 ───────────────────────────────────
    rrect(d, [28, 478, 340, 510], 10, fill=GREEN)
    d.text((38, 494), 'Z05 CLASSIFICATION', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([28, 512, 340, 708], radius=10, outline=(180, 190, 170), width=2)
    for i in range(7):
        y = 528 + i * 24
        d.ellipse([44, y - 7, 58, y + 7], outline=(150, 162, 142), width=2)
        if show_fill:
            d.line([(70, y), (150 + (i % 3) * 46, y)], fill=(214, 208, 190), width=7)

    # 生態習性
    rrect(d, [28, 734, 340, 766], 10, fill=GREEN)
    d.text((38, 750), 'Z06 ECOLOGICAL HABITS', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([28, 768, 340, 932], radius=10, outline=(180, 190, 170), width=2)
    for i in range(4):
        y = 792 + i * 34
        d.ellipse([42, y - 9, 60, y + 9], outline=(150, 162, 142), width=2)
        if show_fill:
            d.line([(70, y), (300 - i * 22, y)], fill=(214, 208, 190), width=7)

    # 成長與繁殖
    rrect(d, [28, 942, 340, 972], 10, fill=GREEN)
    d.text((38, 957), 'Z09 GROWTH', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([28, 974, 340, 1150], radius=10, outline=(180, 190, 170), width=2)
    d.ellipse([212, 1000, 320, 1130], fill=(238, 238, 228), outline=SAGE, width=2)
    d.text((266, 1065), 'NEST', font=font(14, True), fill=(176, 184, 164), anchor='mm')
    if show_fill:
        for i, y in enumerate(range(996, 1136, 22)):
            d.line([(46, y), (46 + 150 - (i % 3) * 30, y)], fill=(214, 208, 190), width=7)

    # 評分卡
    rrect(d, [28, 1152, 340, 1186], 10, fill=GREEN)
    d.text((38, 1169), 'Z12 ECOLOGICAL VALUE', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([28, 1188, 340, 1372], radius=10, outline=(180, 190, 170), width=2)
    cx, cy, r = 178, 1262, 62
    pts = [(cx + r * np.cos(-np.pi / 2 + i * 2 * np.pi / 5),
            cy + r * np.sin(-np.pi / 2 + i * 2 * np.pi / 5)) for i in range(5)]
    d.polygon(pts, fill=(240, 240, 230), outline=GREEN, width=2)
    for p in pts:
        d.line([(cx, cy), p], fill=SAGE, width=1)
    d.text((cx, cy), 'RADAR', font=font(13, True), fill=(160, 170, 148), anchor='mm')
    for i, p in enumerate(pts):
        d.text((p[0], p[1] + (-22 if i == 0 else 22)), str(i + 1),
               font=font(14, True), fill=INK, anchor='mm')

    # 總評分
    rrect(d, [28, 1408, 236, 1436], 8, fill=GREEN)
    d.text((36, 1422), 'Z12 TOTAL', font=font(14, True), fill=CREAM, anchor='lm')
    for i in range(5):
        x = 62 + i * 34
        d.regular_polygon((x, 1392, 14), 5, rotation=0, outline=(176, 168, 140), width=2)
    d.text((300, 1392), 'x.x/5', font=font(16, True), fill=INK, anchor='mm')

    # ── 中欄 ─────────────────────────────────────────────
    rrect(d, [350, 734, 660, 766], 10, fill=GREEN)
    d.text((360, 750), 'Z07 DIET', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([350, 768, 660, 932], radius=10, outline=(180, 190, 170), width=2)
    for i in range(4):
        x = 372 + i * 66
        d.ellipse([x, 782, x + 44, 826], outline=SAGE, width=2)
    if show_fill:
        for i, y in enumerate(range(848, 926, 20)):
            d.line([(364, y), (640 - (i % 3) * 40, y)], fill=(214, 208, 190), width=7)

    rrect(d, [350, 942, 660, 972], 10, fill=GREEN)
    d.text((360, 957), 'Z10 KEY KNOWLEDGE', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([350, 974, 660, 1150], radius=10, outline=(180, 190, 170), width=2)
    for i in range(5):
        y = 994 + i * 30
        d.ellipse([362, y - 9, 380, y + 9], fill=GREEN)
        d.text((371, y), str(i + 1), font=font(12, True), fill=CREAM, anchor='mm')
        if show_fill:
            d.line([(392, y), (632 - (i % 3) * 34, y)], fill=(214, 208, 190), width=7)

    rrect(d, [350, 1152, 660, 1186], 10, fill=GREEN)
    d.text((360, 1169), 'Z13 OBSERVATION TIPS', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([350, 1188, 660, 1372], radius=10, outline=(180, 190, 170), width=2)
    for i in range(4):
        y = 1214 + i * 38
        d.ellipse([364, y - 10, 384, y + 10], outline=SAGE, width=2)
        if show_fill:
            d.line([(394, y), (628 - i * 20, y)], fill=(214, 208, 190), width=7)

    # ── 右欄 ─────────────────────────────────────────────
    rrect(d, [690, 734, 1000, 766], 10, fill=GREEN)
    d.text((700, 750), 'Z08 DISTRIBUTION', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([690, 768, 1000, 932], radius=10, outline=(180, 190, 170), width=2)
    d.rounded_rectangle([706, 824, 900, 916], radius=8, fill=(226, 232, 216), outline=SAGE, width=2)
    d.text((803, 870), 'MAP', font=font(15, True), fill=(166, 176, 152), anchor='mm')
    if show_fill:
        d.line([(706, 796), (940, 796)], fill=(214, 208, 190), width=7)

    rrect(d, [690, 942, 1000, 972], 10, fill=GREEN)
    d.text((700, 957), 'Z11 TRIVIA', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([690, 974, 1000, 1150], radius=10, outline=(180, 190, 170), width=2)
    for i in range(3):
        y = 1006 + i * 44
        d.text((706, y), '★', font=font(20), fill=(150, 162, 142), anchor='lm')
        if show_fill:
            d.line([(730, y), (972 - i * 30, y)], fill=(214, 208, 190), width=7)

    rrect(d, [690, 1152, 1000, 1186], 10, fill=RED)
    d.text((700, 1169), 'Z14 PRECAUTIONS', font=font(15, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([690, 1188, 1000, 1372], radius=10, outline=(180, 190, 170), width=2)
    for i in range(3):
        y = 1226 + i * 42
        d.polygon([(706, y + 12), (718, y - 10), (730, y + 12)], outline=(196, 128, 60), width=2)
        if show_fill:
            d.line([(744, y), (976 - i * 24, y)], fill=(214, 208, 190), width=7)

    # ── 頁腳三格 ─────────────────────────────────────────
    rrect(d, [28, 1408, 340, 1436], 8, fill=GREEN)
    d.text((36, 1422), 'Z18 CALL', font=font(14, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([28, 1438, 340, 1524], radius=8, outline=(180, 190, 170), width=2)
    rng = np.random.default_rng(3)
    for x in range(44, 330, 3):
        h = int(abs(rng.normal(0, 10)) + 2)
        d.line([(x, 1462 - h), (x, 1462 + h)], fill=(160, 170, 150), width=2)
    if show_fill:
        d.line([(44, 1508), (320, 1508)], fill=(214, 208, 190), width=7)

    rrect(d, [350, 1408, 660, 1436], 8, fill=GREEN)
    d.text((358, 1422), 'Z16 SIMILAR SPECIES', font=font(14, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([350, 1438, 660, 1524], radius=8, outline=(180, 190, 170), width=2)
    for i in range(2):
        x = 356 + i * 152
        d.ellipse([x, 1444, x + 62, 1506], fill=(238, 238, 228), outline=SAGE, width=2)
        d.rounded_rectangle([x + 68, 1448, x + 146, 1500], radius=6,
                            outline=(180, 190, 170), width=2)
        if show_fill:
            d.line([(x + 74, 1462), (x + 140, 1462)], fill=(214, 208, 190), width=6)
            d.line([(x + 74, 1480), (x + 134, 1480)], fill=(214, 208, 190), width=6)

    rrect(d, [690, 1408, 1000, 1436], 8, fill=GREEN)
    d.text((698, 1422), 'Z17 CONSERVATION', font=font(14, True), fill=CREAM, anchor='lm')
    d.rounded_rectangle([690, 1438, 1000, 1524], radius=8, outline=(180, 190, 170), width=2)
    d.ellipse([708, 1450, 768, 1510], outline=GREEN, width=2)
    d.text((738, 1480), 'LC', font=font(16, True), fill=(150, 162, 142), anchor='mm')
    if show_fill:
        d.line([(782, 1464), (976, 1464)], fill=(214, 208, 190), width=6)
        d.line([(782, 1492), (950, 1492)], fill=(214, 208, 190), width=6)

    img.save(out)
    print(f'已寫入 {out}（{W}×{H}）')


if __name__ == '__main__':
    main()
