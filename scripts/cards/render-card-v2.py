#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
資訊卡 v2 —— 貼近用戶原版卡（docs/assets/dexcard-0008-example.png）的觀感。

與 v1 的分別（v1 太似網頁、太似自創版式）：
  · 每個欄目改成「深綠圓角標籤 + 白色圖示 + 白字」，同原版一模一樣
  · 格子底部加小圖示（食性／棲地／章節圖示），文字唔夠的地方用圖示補
  · 用襯線字做標題、黑體做內文（同原版一致）
  · 底版仍然由 AI 畫（無字），文字一律由 JSON 印 —— 資料不會假

用法：python3 scripts/cards/render-card-v2.py 0013
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
ART = os.path.join(ROOT, 'data', 'card-demo')
PLATES = os.path.join(ART, 'plates')
ICONS = os.path.join(ART, 'icons')
FONTS = os.path.expanduser('~/.fonts')

W, H = 1200, 1600

DEEP = (17, 63, 42)
DEEP_SOFT = (231, 239, 230)
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


# 底版各區（由 plate-a.png 量度）
PLATE_A = {
    'header': (0.087, 0.070, 0.900, 0.143),
    'photo': (0.106, 0.170, 0.688, 0.484),
    'box1': (0.726, 0.170, 0.905, 0.312),
    'box2': (0.726, 0.342, 0.905, 0.486),
    'row1_y': (0.512, 0.686),
    'row2_y': (0.711, 0.884),
    'cols': [(0.093, 0.272), (0.305, 0.484), (0.517, 0.696), (0.729, 0.907)],
    'footer': (0.093, 0.910, 0.906, 0.933),
    'badge': (0.855, 0.112, 0.048),
}

DIET_ICON = {
    'insect': 'diet-insect', 'fish': 'diet-fish', 'amphibian': 'diet-amphibian',
    'reptile': 'diet-reptile', 'crustacean': 'diet-crustacean', 'mollusc': 'diet-mollusc',
    'worm': 'diet-worm', 'spider': 'diet-spider', 'fruit': 'diet-fruit', 'seed': 'diet-seed',
    'nectar': 'diet-nectar', 'bud': 'diet-bud', 'carrion': 'diet-carrion',
    'rodent': 'diet-rodent', 'bird': 'diet-bird', 'plant': 'diet-plant',
    'omnivore': 'diet-omnivore',
}
HAB_ICON = {
    'forest': 'habitat-forest', 'wetland': 'habitat-wetland', 'water': 'habitat-water',
    'grassland': 'habitat-grassland', 'urban': 'habitat-urban', 'mountain': 'habitat-mountain',
    'open': 'habitat-open',
}


def load(rel):
    with open(os.path.join(DATA, rel), encoding='utf-8') as f:
        return json.load(f)


def icon(name, color='white', size=128):
    p = os.path.join(ICONS, f'{name}_{color}_{size}.png')
    if not os.path.exists(p):
        p = os.path.join(ICONS, f'{name}_white_{size}.png')
    if not os.path.exists(p):
        return None
    return Image.open(p).convert('RGBA')


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


def para(d, xy, s, f, maxw, leading=1.45, limit=None, fill=INK):
    x, y = xy
    lines = wrap(d, s, f, maxw)
    if limit:
        lines = lines[:limit]
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill)
        y += int(f.size * leading)
    return y


def fit(d, s, maxw, maxh, start=13, down=9, leading=1.45, weight='regular'):
    size = start
    while size >= down:
        f = font(size, weight)
        lines = wrap(d, s, f, maxw)
        if len(lines) * int(size * leading) <= maxh:
            return f, lines
        size -= 1
    f = font(down, weight)
    return f, wrap(d, s, f, maxw)


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    return im.crop(((im.width - w) // 2, (im.height - h) // 2,
                    (im.width - w) // 2 + w, (im.height - h) // 2 + h))


def contain_blur(path, w, h):
    im = Image.open(path).convert('RGB')
    bg = cover(path, w, h).filter(ImageFilter.GaussianBlur(20))
    bg = Image.blend(bg, Image.new('RGB', (w, h), (240, 243, 236)), 0.30)
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


def pill_label(img, x, y, title, icon_name=None, size=15):
    """深綠圓角標籤 + 白色圖示 + 白字（原版卡的欄目樣式）"""
    d = ImageDraw.Draw(img)
    f = font(size, 'bold', serif=True)
    t_w = tw(d, title, f)
    ic = 22 if icon_name else 0
    pad_l, pad_r, gap = 8, 14, 6
    w = pad_l + (ic + gap if ic else 0) + t_w + pad_r
    h = size + 14
    d.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=DEEP)
    cx = x + pad_l
    if ic:
        im = icon(icon_name, 'white', 128)
        if im:
            im = im.resize((ic, ic), Image.LANCZOS)
            img.paste(im, (int(cx), int(y + (h - ic) / 2)), im)
        cx += ic + gap
    d.text((cx, y + (h - size) / 2 - 2), title, font=f, fill=(255, 255, 255))
    return h


def render(bird_id, out_path, plate='plate-a.png'):
    birds = {b['id']: b for b in load('birds.json')}
    tax = load('birdTaxonomy.json')
    copy = load('cardCopy.json')
    meas = load('measurements.json').get(bird_id, {})
    src = load('cardSources.json').get('sources', {}).get(bird_id, '')
    idx_bird = load('explorerIndex.json')['birds'].get(bird_id, {})

    b = birds.get(bird_id, {})
    t = tax.get(bird_id, {})
    c = copy.get(bird_id, {})
    zh = b.get('name', '')
    en = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')

    img = Image.open(os.path.join(PLATES, plate)).convert('RGB').resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    P = PLATE_A

    def px(v):
        return int(v * W)

    def py(v):
        return int(v * H)

    # ══════ 書眉 ══════
    hx0, hy0, hx1, hy1 = px(P['header'][0]), py(P['header'][1]), px(P['header'][2]), py(P['header'][3])
    d.text((hx0, hy0 + 2), f'NO.{bird_id}', font=font(20, 'bold'), fill=GOLD)
    f_zh = font(58, 'black', serif=True)
    while tw(d, zh, f_zh) > 250 and f_zh.size > 24:
        f_zh = font(f_zh.size - 2, 'black', serif=True)
    d.text((hx0 - 3, hy0 + 26), zh, font=f_zh, fill=(255, 255, 255))

    mid = hx0 + 286
    d.text((mid, hy0 + 30), sci, font=font(16, 'regular', serif=True), fill=(198, 216, 202))
    pw = tw(d, en, font(14, 'bold')) + 22
    d.rounded_rectangle((mid, hy0 + 56, mid + pw, hy0 + 84), radius=14, fill=(255, 255, 255))
    d.text((mid + 11, hy0 + 61), en, font=font(14, 'bold'), fill=DEEP)

    right = hx1 - 126
    for i, key in enumerate(('order', 'family')):
        line = f"{t.get(key + 'Zh', '')} {t.get(key, '')}".strip()
        d.text((right - tw(d, line, font(11)), hy0 + 4 + i * 15), line,
               font=font(11), fill=(180, 203, 184))

    # ══════ 主相片 ══════
    x0, y0, x1, y1 = px(P['photo'][0]), py(P['photo'][1]), px(P['photo'][2]), py(P['photo'][3])
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    if os.path.exists(photo):
        img.paste(contain_blur(photo, x1 - x0, y1 - y0), (x0, y0))
    else:
        d.rectangle((x0, y0, x1, y1), fill=DEEP_SOFT)
        d.text((x0 + 14, y0 + (y1 - y0) // 2), f'插畫待補：{en}', font=font(15), fill=INK2)

    # ══════ 右上兩格 ══════
    def mm(k):
        v = str(meas.get(k, '') or '').strip()
        return f'{v} mm' if v else '待補'

    def g(k='mass'):
        v = str(meas.get(k, '') or '').strip()
        return f'{v} g' if v else '待補'

    bx0, by0, bx1, by1 = px(P['box1'][0]), py(P['box1'][1]), px(P['box1'][2]), py(P['box1'][3])
    ph = pill_label(img, bx0 + 8, by0 + 6, '量度', 'ui-ruler', 14)
    d = ImageDraw.Draw(img)
    yy = by0 + 10 + ph + 8
    for lab, val in (('翼長', mm('wing')), ('尾長', mm('tail')), ('嘴峰', mm('bill')),
                     ('跗蹠', mm('tarsus')), ('體重', g())):
        d.text((bx0 + 12, yy), lab, font=font(11, 'bold'), fill=INK2)
        fv = font(12, 'bold')
        ok = '待補' not in val
        d.text((bx1 - 10 - tw(d, val, fv), yy), val, font=fv,
               fill=INK if ok else (172, 165, 152))
        yy += 16

    bx0, by0, bx1, by1 = px(P['box2'][0]), py(P['box2'][1]), px(P['box2'][2]), py(P['box2'][3])
    ph = pill_label(img, bx0 + 8, by0 + 6, '分類資訊', 'ui-taxonomy', 14)
    d = ImageDraw.Draw(img)
    yy = by0 + 10 + ph + 8
    genus = sci.split(' ')[0] if sci else ''
    for lab, val in (('目', f"{t.get('orderZh','')} {t.get('order','')}".strip()),
                     ('科', f"{t.get('familyZh','')} {t.get('family','')}".strip()),
                     ('屬', genus), ('種', zh)):
        d.text((bx0 + 12, yy), lab, font=font(10, 'bold'), fill=ACCENT)
        f, lines = fit(d, val, bx1 - bx0 - 42, 34, 11, 9, 1.3)
        d.text((bx0 + 30, yy - 1), lines[0] if lines else '', font=f, fill=INK)
        yy += 17
    if src:
        one = src.replace('｜', ' · ')
        f9 = font(8)
        while tw(d, one, f9) > bx1 - bx0 - 26 and len(one) > 14:
            one = one[:-2]
        d.text((bx0 + 10, by1 - 18), one.rstrip(' ·，') + '…', font=f9, fill=(158, 150, 136))

    # ══════ 兩排四格 ══════
    def panel(col, y_band, title, icon_name, val, numbered=False, tails=None, extra=None):
        nonlocal d
        x0, x1 = px(P['cols'][col][0]), px(P['cols'][col][1])
        y0, y1 = py(y_band[0]), py(y_band[1])
        ph = pill_label(img, x0 + 8, y0 + 6, title, icon_name, 14)
        d = ImageDraw.Draw(img)
        body_y = y0 + 10 + ph + 7
        maxw = x1 - x0 - 20
        # 底部小圖示列（如果有）
        tail_h = 0
        if tails:
            tail_h = 34
        maxh = y1 - body_y - 8 - tail_h
        if not val:
            d.text((x0 + 12, body_y + 2), '資料待查', font=font(12), fill=(172, 165, 152))
        elif numbered:
            yy = body_y
            for n, it in enumerate(val[:5], 1):
                d.text((x0 + 10, yy), f'{n}', font=font(11, 'bold'), fill=ACCENT)
                f = font(11, 'regular')
                ln = wrap(d, it, f, maxw - 14)[:2]
                for j, s2 in enumerate(ln):
                    d.text((x0 + 23, yy + j * 15), s2, font=f, fill=INK)
                yy += 15 * len(ln) + 3
                if yy > y1 - 20:
                    break
        else:
            f, lines = fit(d, val, maxw, maxh, 15, 11, 1.55)
            yy = para(d, (x0 + 11, body_y), val, f, maxw, leading=1.55, limit=len(lines))
            # 補充段（真實欄位，細標題 + 細字），填滿下半
            if extra:
                for label, text in extra:
                    if not text or yy > y1 - 46:
                        break
                    if yy + 22 > y1 - 10:
                        break
                    d.text((x0 + 11, yy + 4), label, font=font(10, 'bold'), fill=ACCENT)
                    yy += 18
                    f2, l2 = fit(d, text, maxw, y1 - yy - 8, 12, 9, 1.5)
                    yy = para(d, (x0 + 11, yy), text, f2, maxw, leading=1.5,
                              limit=max(1, (y1 - yy - 8) // int(12 * 1.5)), fill=INK)
        if tails:
            n = len(tails)
            cw_ = maxw / max(n, 1)
            for i, (nm, label) in enumerate(tails):
                im = icon(nm, 'deep', 128)
                if not im:
                    continue
                sz = 30
                im = im.resize((sz, sz), Image.LANCZOS)
                cx = x0 + 11 + i * cw_ + (cw_ - sz) / 2
                img.paste(im, (int(cx), int(y1 - 30)), im)
                d2 = ImageDraw.Draw(img)
                d2.text((cx + sz / 2, y1 - 32), label, font=font(8), fill=INK2, anchor='ms')

    def join(*parts):
        return ''.join(p for p in parts if p)

    # 第一排：主段 + 補充段（每個都是卡上其他真實欄位，唔重複同一句）
    panel(0, P['row1_y'], '分佈地區', 'ui-map', c.get('range'),
          extra=[('遷徙', c.get('migration'))])
    panel(1, P['row1_y'], '棲息環境', 'habitat-forest', c.get('habitat'),
          extra=[('與人', c.get('humanRelation'))])
    panel(2, P['row1_y'], '食物', 'ui-feed', c.get('diet'),
          tails=[(DIET_ICON[i], '') for i in (idx_bird.get('d') or [])[:4] if i in DIET_ICON],
          extra=[('名稱由來', c.get('etymology'))])
    panel(3, P['row1_y'], 'Top 5 亮點', 'ui-funfact', c.get('highlights'), numbered=True)

    # 第二排
    panel(0, P['row2_y'], '成長與繁殖', 'ui-nest', c.get('breeding'),
          extra=[('鳴聲', c.get('voice'))])
    panel(1, P['row2_y'], '行為特徵', 'ui-behaviour', c.get('behavior'),
          tails=[(HAB_ICON[i], '') for i in (idx_bird.get('h') or [])[:4] if i in HAB_ICON])
    panel(2, P['row2_y'], '有趣冷知識', 'ui-funfact', c.get('funFact'))
    panel(3, P['row2_y'], '注意事項', 'ui-shield', c.get('conservation'))

    # ══════ IUCN 圓徽章 ══════
    bcx, bcy = px(P['badge'][0]), py(P['badge'][1])
    br = min(px(P['badge'][2]), int((py(P['header'][3]) - py(P['header'][1])) * 0.44))
    iucn = c.get('iucn') or ''
    code = ''
    for k, v in (('無危', 'LC'), ('近危', 'NT'), ('易危', 'VU'), ('瀕危', 'EN'), ('極危', 'CR')):
        if k in iucn:
            code = v
            break
    color = {'LC': (28, 122, 78), 'NT': (138, 124, 18), 'VU': (168, 116, 19),
             'EN': (176, 74, 30), 'CR': (143, 31, 34)}.get(code, (96, 110, 100))
    d.ellipse((bcx - br, bcy - br, bcx + br, bcy + br), fill=color,
              outline=(255, 255, 255), width=3)
    d.text((bcx, bcy - 10), code or '—', font=font(int(br * 1.05), 'black', serif=True),
           fill=(255, 255, 255), anchor='mm')
    d.text((bcx, bcy + int(br * 0.55)), iucn.split()[0] if iucn else '待查',
           font=font(int(br * 0.42), 'bold'), fill=(255, 255, 255), anchor='mm')

    # ══════ 底欄 ══════
    fx0, fy0, fx1, fy1 = (px(P['footer'][0]), py(P['footer'][1]),
                          px(P['footer'][2]), py(P['footer'][3]))
    d.text((fx0 + 8, fy0 + 6), f'NO.{bird_id}', font=font(15, 'bold'), fill=GOLD)
    nm = f'{zh}（{sci}）'
    d.text(((fx0 + fx1) / 2 - tw(d, nm, font(14, 'bold')) / 2, fy0 + 7), nm,
           font=font(14, 'bold'), fill=(255, 255, 255))
    ver = 'v2.0 · 資訊卡'
    d.text((fx1 - 10 - tw(d, ver, font(12, 'bold')), fy0 + 9), ver,
           font=font(12, 'bold'), fill=(190, 212, 194))

    os.makedirs(os.path.join(ART, 'out'), exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size)


if __name__ == '__main__':
    bid = (sys.argv[1] if len(sys.argv) > 1 else '0013').zfill(4)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ART, 'out', f'v2-{bid}.png')
    render(bid, out)
