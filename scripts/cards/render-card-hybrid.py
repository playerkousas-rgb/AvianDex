#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
混合式資訊卡（C2 路線）：AI 畫「無字底版」，程式印上真資料。

為甚麼要這樣分？
  docs/CARD_AI_VS_TEMPLATE.md 的實測結論：
    · Gemini／Nano Banana 出整張卡 → 版面 A、文字 C/D
      （中文 9 成字形正確但內容係編嘅；英文出假字，更難察覺）
    · 559 張 × 約 260 字 ≈ 14.5 萬字，人手無可能逐句核
  所以：AI 只准負責「畫」，一個字都唔准由 AI 出。
  文字全部由 repo 內已核實的 JSON 印上（同 Pillow 引擎一樣的規矩）。

用法：
  python3 scripts/cards/render-card-hybrid.py 0013 [出圖.png]
  底版放在 data/card-demo/plates/plate-a.png（AI 生成、無字）
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
ART = os.path.join(ROOT, 'data', 'card-demo')
PLATES = os.path.join(ART, 'plates')
FONTS = os.path.expanduser('~/.fonts')

W, H = 1200, 1600

DEEP = (17, 63, 42)
CREAM = (247, 243, 233)
INK = (28, 26, 22)
INK2 = (96, 89, 78)
RULE = (214, 205, 188)
GOLD = (186, 138, 40)
ACCENT = (196, 84, 60)

SERIF = {'black': 'NotoSerifTC_900Black.ttf', 'bold': 'NotoSerifTC_600SemiBold.ttf',
         'regular': 'NotoSerifTC_400Regular.ttf'}
SANS = {'black': 'NotoSansTC_900Black.ttf', 'bold': 'NotoSansTC_700Bold.ttf',
        'regular': 'NotoSansTC_400Regular.ttf'}


def font(size, weight='bold', serif=False):
    return ImageFont.truetype(os.path.join(FONTS, (SERIF if serif else SANS)[weight]), int(size))


# 底版上各區的相對位置（0..1），由 plate-a.png 量出來。
# 換底版只需改這一組數字，文字邏輯不變。
PLATE_A = {
    # 以下數值全部由 plate-a.png 逐像素量出來（見 scripts/cards/measure-plate.py）
    'header': (0.087, 0.070, 0.900, 0.143),   # 深綠橫帶
    'photo': (0.106, 0.170, 0.688, 0.484),    # 主相片窗（內框內側）
    'box1': (0.726, 0.170, 0.905, 0.312),     # 右上格（量度）
    'box2': (0.726, 0.342, 0.905, 0.486),     # 右上格（分類）
    'row1_y': (0.512, 0.686),
    'row2_y': (0.711, 0.884),
    'cols': [(0.093, 0.272), (0.305, 0.484), (0.517, 0.696), (0.729, 0.907)],
    'footer': (0.093, 0.910, 0.906, 0.933),   # 底深綠條
    'badge': (0.855, 0.112, 0.048),           # 頂右圓徽章
}


def load(rel):
    with open(os.path.join(DATA, rel), encoding='utf-8') as f:
        return json.load(f)


def tw(d, s, f):
    return d.textlength(s, font=f)


def wrap(d, s, f, maxw):
    lines, cur = [], ''
    for ch in str(s or ''):
        if ch == '\n':
            lines.append(cur)
            cur = ''
            continue
        if tw(d, cur + ch, f) <= maxw:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def para(d, xy, s, f, maxw, leading=1.5, limit=None, fill=INK):
    x, y = xy
    lines = wrap(d, s, f, maxw)
    if limit:
        lines = lines[:limit]
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill)
        y += int(f.size * leading)
    return y


def fit(d, s, maxw, maxh, start=15, down=9, leading=1.45, weight='regular', serif=False):
    """找最大可用字級，保證唔會溢出格。"""
    size = start
    while size >= down:
        f = font(size, weight, serif)
        lines = wrap(d, s, f, maxw)
        if len(lines) * int(size * leading) <= maxh:
            return f, lines
        size -= 1
    f = font(down, weight, serif)
    return f, wrap(d, s, f, maxw)


def cell_head(d, x, y, title, size=17, color=DEEP, offset=26):
    """欄目：襯線標題。底版每個格左上角已有金色小方塊，所以文字要右移。"""
    d.text((x + offset, y), title, font=font(size, 'bold', serif=True), fill=color)


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def contain_blur(path, w, h):
    """完整顯示整隻雀（唔裁頭），空白用同一張圖放大模糊填底。"""
    from PIL import ImageFilter
    im = Image.open(path).convert('RGB')
    bg = cover(path, w, h).filter(ImageFilter.GaussianBlur(18))
    bg = Image.blend(bg, Image.new('RGB', (w, h), (236, 240, 232)), 0.25)
    r = min(w / im.width, h / im.height)
    fg = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    bg.paste(fg, ((w - fg.width) // 2, (h - fg.height) // 2))
    return bg


def sent(s, limit=220):
    s = (s or '').replace('\n', ' ').strip()
    if len(s) <= limit:
        return s
    for sep in ('。', '；'):
        i = s.find(sep)
        if 0 < i < limit:
            return s[:i + 1]
    return s[:limit].rstrip('，、；：') + '…'


def render(bird_id, out_path, plate='plate-a.png'):
    birds = {b['id']: b for b in load('birds.json')}
    tax = load('birdTaxonomy.json')
    copy = load('cardCopy.json')
    meas = load('measurements.json').get(bird_id, {})
    scores = load('dexScores.json')['scores'].get(bird_id, {})
    src = load('cardSources.json')['sources'].get(bird_id, '')

    b = birds.get(bird_id, {})
    t = tax.get(bird_id, {})
    c = copy.get(bird_id, {})
    zh = b.get('name', '')
    en = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')

    plate_img = Image.open(os.path.join(PLATES, plate)).convert('RGB')
    img = plate_img.resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    P = PLATE_A

    def px(v):
        return int(v * W)

    def py(v):
        return int(v * H)

    # ---------- ① 書眉 ----------
    hx0, hy0, hx1, hy1 = px(P['header'][0]), py(P['header'][1]), px(P['header'][2]), py(P['header'][3])
    d.text((hx0, hy0 + 4), f'NO.{bird_id}', font=font(21, 'bold'), fill=GOLD)
    f_zh = font(56, 'black', serif=True)
    while tw(d, zh, f_zh) > 260 and f_zh.size > 24:
        f_zh = font(f_zh.size - 2, 'black', serif=True)
    d.text((hx0 - 2, hy0 + 26), zh, font=f_zh, fill=(255, 255, 255))

    # 學名 + 英文膠囊（中文名右邊）
    mid = hx0 + 292
    d.text((mid, hy0 + 26), sci, font=font(17, 'regular', serif=True), fill=(196, 216, 200))
    pw = tw(d, en, font(15, 'bold')) + 24
    d.rounded_rectangle((mid, hy0 + 54, mid + pw, hy0 + 84), radius=15, fill=(255, 255, 255))
    d.text((mid + 12, hy0 + 59), en, font=font(15, 'bold'), fill=DEEP)

    # 右上：目／科 + 常見度（右對齊到徽章左邊）
    right_edge = hx1 - 132
    for i, key in enumerate(('order', 'family')):
        zhk = t.get(f'{key}Zh', '') or c.get(f'{key}Zh', '')
        line = f"{zhk} {t.get(key, '')}".strip()
        d.text((right_edge - tw(d, line, font(11)), hy0 + 5 + i * 16), line,
               font=font(11), fill=(178, 202, 182))
    common = int(c.get('commonness') or 0) or 3
    d.text((right_edge - 96, hy0 + 40), '常見度', font=font(10, 'bold'), fill=(150, 178, 156))
    for i in range(5):
        cx = right_edge - 44 + i * 12
        d.ellipse((cx - 4, hy0 + 43, cx + 4, hy0 + 51),
                  fill=GOLD if i < common else (62, 104, 78))

    def mm(k):
        v = str(meas.get(k, '') or '').strip()
        return f'{v} mm' if v else '待補'

    def g(k='mass'):
        v = str(meas.get(k, '') or '').strip()
        return f'{v} g' if v else '待補'

    # ---------- ② 主相片 ----------
    x0, y0, x1, y1 = px(P['photo'][0]), py(P['photo'][1]), px(P['photo'][2]), py(P['photo'][3])
    pw_, ph_ = x1 - x0, y1 - y0
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    if os.path.exists(photo):
        img.paste(contain_blur(photo, pw_, ph_), (x0, y0))
    else:
        d.rectangle((x0, y0, x1, y1), fill=(231, 239, 230))
        d.text((x0 + 16, y0 + ph_ // 2 - 10), f'插畫待補：{en}', font=font(15), fill=INK2)

    # ---------- ③ 右邊兩個小格 ----------
    for key in ('box1', 'box2'):
        bx0, by0, bx1, by1 = (px(P[key][0]), py(P[key][1]), px(P[key][2]), py(P[key][3]))
        if key == 'box1':
            cell_head(d, bx0 + 10, by0 + 8, '量度', 15)
            yy = by0 + 32
            rows = [('翼長', mm('wing')), ('尾長', mm('tail')), ('嘴峰', mm('bill')),
                    ('跗蹠', mm('tarsus')), ('體重', g())]
            for lab, val in rows:
                d.text((bx0 + 12, yy), lab, font=font(11, 'bold'), fill=INK2)
                fv = font(12, 'bold')
                ok = '待補' not in val
                d.text((bx1 - 10 - tw(d, val, fv), yy), val, font=fv,
                       fill=INK if ok else (170, 163, 150))
                yy += 17
        else:
            cell_head(d, bx0 + 10, by0 + 8, '分類', 15)
            yy = by0 + 32
            genus = sci.split(' ')[0] if sci else ''
            rows = [('目', f"{t.get('orderZh','')} {t.get('order','')}".strip()),
                    ('科', f"{t.get('familyZh','')} {t.get('family','')}".strip()),
                    ('屬', genus), ('種', zh)]
            for lab, val in rows:
                d.text((bx0 + 12, yy), lab, font=font(10, 'bold'), fill=ACCENT)
                f, lines = fit(d, val, bx1 - bx0 - 40, 34, 11, 9, 1.3)
                d.text((bx0 + 30, yy - 1), lines[0] if lines else '', font=f, fill=INK)
                yy += 18
            if src:
                one = src.replace('｜', ' · ')
                f9 = font(8)
                if tw(d, one, f9) > bx1 - bx0 - 20:
                    while tw(d, one, f9) > bx1 - bx0 - 30 and len(one) > 14:
                        one = one[:-2]
                    one = one.rstrip(' ·，') + '…'
                d.text((bx0 + 10, by1 - 20), one, font=f9, fill=(150, 142, 128))

    # ---------- ④ 兩排四格 ----------
    def panel(box, title, val, numbered=False):
        x0, y0, x1, y1 = box
        cell_head(d, x0 + 9, y0 + 8, title, 15)
        body_y = y0 + 34
        maxw, maxh = x1 - x0 - 20, y1 - body_y - 8
        if not val:
            d.text((x0 + 10, body_y + 2), '資料待查', font=font(12), fill=(170, 163, 150))
            return
        if numbered:
            yy = body_y
            for n, it in enumerate(val[:5], 1):
                d.text((x0 + 9, yy), f'{n}', font=font(11, 'bold'), fill=ACCENT)
                f = font(11, 'regular')
                ln = wrap(d, it, f, maxw - 14)[:2]
                for j, s2 in enumerate(ln):
                    d.text((x0 + 22, yy + j * 15), s2, font=f, fill=INK)
                yy += 15 * len(ln) + 3
                if yy > y1 - 16:
                    break
            return
        f, lines = fit(d, val, maxw, maxh, 13, 9, 1.45)
        para(d, (x0 + 10, body_y), val, f, maxw, leading=1.45, limit=len(lines))

    row1 = [('分佈地區', c.get('range')), ('棲息環境', sent(c.get('habitat'))),
            ('食物', sent(c.get('diet')))]
    for i, (title, val) in enumerate(row1):
        x0, x1 = px(P['cols'][i][0]), px(P['cols'][i][1])
        panel((x0, py(P['row1_y'][0]), x1, py(P['row1_y'][1])), title, val)
    hx0c, hx1c = px(P['cols'][3][0]), px(P['cols'][3][1])
    panel((hx0c, py(P['row1_y'][0]), hx1c, py(P['row1_y'][1])), 'Top 5 亮點',
          c.get('highlights'), numbered=True)

    row2 = [('成長與繁殖', c.get('breeding')), ('行為特徵', sent(c.get('behavior'))),
            ('有趣冷知識', sent(c.get('funFact'))),
            ('注意事項', sent(c.get('conservation') or c.get('humanRelation')))]
    for i, (title, val) in enumerate(row2):
        x0, x1 = px(P['cols'][i][0]), px(P['cols'][i][1])
        panel((x0, py(P['row2_y'][0]), x1, py(P['row2_y'][1])), title, val)

    # ---------- ⑤ 圓徽章：IUCN ----------
    bcx = px(P['badge'][0])
    bcy = py(P['badge'][1])
    br = min(px(P['badge'][2]), int((py(P['header'][3]) - py(P['header'][1])) * 0.42))
    iucn = c.get('iucn') or ''
    level = iucn.split()[-1] if iucn else ''
    short = {'無危': 'LC', '近危': 'NT', '易危': 'VU', '瀕危': 'EN', '極危': 'CR'}
    code = short.get(iucn.split()[0] if iucn else '', level)
    color = {'LC': (28, 122, 78), 'NT': (138, 124, 18), 'VU': (168, 116, 19),
             'EN': (176, 74, 30), 'CR': (143, 31, 34)}.get(code, DEEP)
    d.ellipse((bcx - br, bcy - br, bcx + br, bcy + br), fill=color)
    d.text((bcx, bcy - 8), code or '—', font=font(22, 'black', serif=True),
           fill=(255, 255, 255), anchor='mm')
    d.text((bcx, bcy + 16), (iucn.split()[0] if iucn else '待查'), font=font(11, 'bold'),
           fill=(255, 255, 255), anchor='mm')

    # ---------- ⑥ 底欄 ----------
    fx0, fy0, fx1, fy1 = (px(P['footer'][0]), py(P['footer'][1]),
                          px(P['footer'][2]), py(P['footer'][3]))
    d.text((fx0 + 8, fy0 + 7), f'NO.{bird_id}', font=font(15, 'bold'), fill=GOLD)
    nm = f'{zh}（{sci}）'
    d.text(((fx0 + fx1) / 2 - tw(d, nm, font(14, 'bold')) / 2, fy0 + 8), nm,
           font=font(14, 'bold'), fill=(255, 255, 255))
    ver = 'v2.0 · 資訊卡'
    d.text((fx1 - 10 - tw(d, ver, font(12, 'bold')), fy0 + 10), ver,
           font=font(12, 'bold'), fill=(190, 212, 194))

    os.makedirs(os.path.join(ART, 'out'), exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size)


if __name__ == '__main__':
    bid = (sys.argv[1] if len(sys.argv) > 1 else '0013').zfill(4)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ART, 'out', f'hybrid-{bid}.png')
    render(bid, out)
