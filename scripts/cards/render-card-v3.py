#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
資訊卡 v3 —— 百科全書式「大圖 + 小標註」＋ 遊戲感。

v2 的問題（用戶原話）：
  「太多字太小圖了，還是太工式化像一本書多過一張卡」
  「外框好多了，但沒有遊戲感」
  「應該參考的排版，就是真的百科全書」

所以 v3 的規矩：
  · 一個大圖窗（佔卡面一半以上），鳥就是主角
  · 下面的資料帶用「模擬寵物小精靈」的畫法：粗數值條、屬性晶片、徽章
  · 四塊小牌只放「一句」——一句原文，唔係一段
  · 全部文字仍然由 JSON 印，唔經 AI（唔會有假字）

用法：python3 scripts/cards/render-card-v3.py 0013
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
CREAM = (247, 243, 233)
INK = (28, 26, 22)
INK2 = (96, 89, 78)
GOLD = (206, 152, 32)
ACCENT = (196, 84, 60)
CARD = (255, 255, 255)

SERIF = {'black': 'NotoSerifTC_900Black.ttf', 'bold': 'NotoSerifTC_600SemiBold.ttf',
         'regular': 'NotoSerifTC_400Regular.ttf'}
SANS = {'black': 'NotoSansTC_900Black.ttf', 'bold': 'NotoSansTC_700Bold.ttf',
        'regular': 'NotoSansTC_400Regular.ttf'}

# 由 ai-base-v3.png 量出來（見 scripts/cards/measure-plate.py）
PLATE = {
    'header': (0.040, 0.028, 0.828, 0.150),
    'window': (0.115, 0.180, 0.885, 0.604),
    'stats': (0.115, 0.642, 0.885, 0.788),
    'row': (0.104, 0.802, 0.892, 0.892),
    'footer': (0.090, 0.907, 0.912, 0.953),
    'badge': (0.894, 0.114, 0.080),
}


def font(size, weight='bold', serif=False):
    return ImageFont.truetype(os.path.join(FONTS, (SERIF if serif else SANS)[weight]), int(size))


def load(rel):
    with open(os.path.join(DATA, rel), encoding='utf-8') as f:
        return json.load(f)


def tw(d, s, f):
    return d.textlength(s, font=f)


def wrap(d, s, f, maxw):
    lines, cur = [], ''
    for ch in str(s or ''):
        if tw(d, cur + ch, f) <= maxw:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def one_line(d, s, f, maxw, ellipsis='…'):
    """只留一句／一行：超出就截，唔會轉行（小標註用）"""
    s = str(s or '').replace('\n', ' ').strip()
    if tw(d, s, f) <= maxw:
        return s
    while s and tw(d, s + ellipsis, f) > maxw:
        s = s[:-1]
    return s.rstrip('，、；：') + ellipsis


def first_sentence(s, maxlen=40):
    s = str(s or '').replace('\n', ' ').strip()
    for sep in ('。', '；'):
        i = s.find(sep)
        if 0 < i <= maxlen:
            return s[:i + 1]
    return s[:maxlen].rstrip('，、；：') + ('…' if len(s) > maxlen else '')


def icon(name, color='white', size=128):
    for c in (color, 'white', 'deep'):
        p = os.path.join(ICONS, f'{name}_{c}_{size}.png')
        if os.path.exists(p):
            return Image.open(p).convert('RGBA')
    return None


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def contain_blur(path, w, h):
    im = Image.open(path).convert('RGB')
    bg = cover(path, w, h).filter(ImageFilter.GaussianBlur(24))
    bg = Image.blend(bg, Image.new('RGB', (w, h), (238, 242, 234)), 0.35)
    r = min(w / im.width, h / im.height)
    fg = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    bg.paste(fg, ((w - fg.width) // 2, (h - fg.height) // 2))
    return bg


DIET_ZH = {
    'insect': '昆蟲', 'fish': '魚類', 'amphibian': '蛙類', 'reptile': '爬蟲類',
    'crustacean': '蟹蝦', 'mollusc': '螺貝', 'worm': '蠕蟲', 'spider': '蜘蛛',
    'fruit': '果實', 'seed': '種子', 'nectar': '花蜜', 'bud': '嫩芽',
    'carrion': '腐肉', 'rodent': '鼠類', 'bird': '鳥類', 'plant': '植物',
    'omnivore': '雜食',
}
HAB_ZH = {
    'forest': '森林', 'wetland': '濕地', 'water': '水邊', 'grassland': '農田草地',
    'urban': '城市公園', 'mountain': '山地', 'open': '開闊地',
}


def render(bird_id, out_path, plate='plate-v3.png'):
    birds = {b['id']: b for b in load('birds.json')}
    tax = load('birdTaxonomy.json')
    copy = load('cardCopy.json')
    meas = load('measurements.json').get(bird_id, {})
    scores = load('dexScores.json').get('scores', {}).get(bird_id, {})
    idx_bird = load('explorerIndex.json')['birds'].get(bird_id, {})

    b, t, c = birds.get(bird_id, {}), tax.get(bird_id, {}), copy.get(bird_id, {})
    zh = b.get('name', '')
    en = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')

    img = Image.open(os.path.join(PLATES, plate)).convert('RGB').resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    P = PLATE

    def X(v):
        return int(v * W)

    def Y(v):
        return int(v * H)

    # ══════ ① 書眉：NO. / 名稱 / 學名 / 英文 ══════
    hx0, hy0, hx1, hy1 = X(P['header'][0]), Y(P['header'][1]), X(P['header'][2]), Y(P['header'][3])
    bx, by, br = X(P['badge'][0]), Y(P['badge'][1]), X(P['badge'][2])
    right_edge = bx - br - 18           # 所有右對齊都停在徽章左邊

    # 底版右上已有一個空圓：直接把 IUCN 徽章畫進那個圓（唔蓋、唔重疊）
    base_cx, base_cy, base_r = 0.894 * W, 0.114 * H, 0.086 * W
    d.text((hx0 + 14, hy0 + 8), f'NO.{bird_id}', font=font(18, 'bold'), fill=GOLD)

    # 英文膠囊（右上）
    pw = tw(d, en, font(13, 'bold')) + 22
    d.rounded_rectangle((right_edge - pw, hy0 + 6, right_edge, hy0 + 32), radius=13,
                        fill=(255, 255, 255))
    d.text((right_edge - pw + 11, hy0 + 10), en, font=font(13, 'bold'), fill=DEEP)
    # 目 / 科
    for i, key in enumerate(('order', 'family')):
        line = f"{t.get(key + 'Zh', '')} {t.get(key, '')}".strip()
        d.text((right_edge - tw(d, line, font(11)), hy0 + 38 + i * 15), line,
               font=font(11), fill=(182, 204, 186))

    # 中文名 + 學名（左下，字級自動收細，唔會撞到右邊）
    f_zh = font(56, 'black', serif=True)
    while tw(d, zh, f_zh) > (right_edge - hx0 - 24) and f_zh.size > 24:
        f_zh = font(f_zh.size - 2, 'black', serif=True)
    d.text((hx0 + 12, hy0 + 32), zh, font=f_zh, fill=(255, 255, 255))
    d.text((hx0 + 14, hy0 + 32 + int(f_zh.size * 1.14)), sci,
           font=font(14, 'regular', serif=True), fill=(198, 216, 202))

    # ══════ ② 大圖窗 ══════
    wx0, wy0, wx1, wy1 = X(P['window'][0]), Y(P['window'][1]), X(P['window'][2]), Y(P['window'][3])
    art_path = None
    for cand in (os.path.join(ART, f'{bird_id}-art.jpg'), os.path.join(ART, f'{bird_id}-photo.jpg')):
        if os.path.exists(cand):
            art_path = cand
            break
    if art_path:
        # 有插畫就鋪滿（唔留灰邊）；只有舊卡裁圖才用 contain_blur
        fn = cover if art_path.endswith('-art.jpg') else contain_blur
        img.paste(fn(art_path, wx1 - wx0, wy1 - wy0), (wx0, wy0))
    else:
        d.rectangle((wx0, wy0, wx1, wy1), fill=(234, 240, 232))
        d.text(((wx0 + wx1) // 2, (wy0 + wy1) // 2), f'插畫待補 {en}',
               font=font(16), fill=INK2, anchor='mm')

    # 圖窗左上：屬性晶片（棲地圖示 + 名，遊戲感）
    chips = [(HAB_ZH[i], f'habitat-{i}') for i in (idx_bird.get('h') or [])[:2] if i in HAB_ZH]
    cx = wx0 + 16
    for name, ic in chips:
        ic_im = icon(ic, 'white', 128)
        f = font(14, 'bold', serif=True)
        wch = 12 + 22 + 6 + tw(d, name, f) + 14
        d.rounded_rectangle((cx, wy0 + 16, cx + wch, wy0 + 16 + 34), radius=17, fill=DEEP)
        if ic_im:
            ic_im = ic_im.resize((22, 22), Image.LANCZOS)
            img.paste(ic_im, (int(cx + 12), int(wy0 + 22)), ic_im)
        d.text((cx + 12 + 22 + 6, wy0 + 22), name, font=f, fill=(255, 255, 255))
        cx += wch + 8

    # 圖窗左下：銘牌（用 numpy 做雙向漸層遮罩，邊緣自然淡出）
    import numpy as np
    plate_w, plate_h = 620, 132
    px0, py0 = wx0, wy1 - plate_h
    region = np.asarray(img.crop((px0, py0, px0 + plate_w, py0 + plate_h)).convert('RGB')).astype(np.float32)
    gx = np.linspace(0, 1, plate_w)[None, :]          # 左 0 → 右 1
    gy = np.linspace(0, 1, plate_h)[:, None]          # 上 0 → 下 1
    alpha = np.clip(1 - gx ** 1.5, 0, 1) * np.clip(gy ** 0.8, 0, 1) * 0.92
    a3 = alpha[:, :, None]
    deep = np.array(DEEP, dtype=np.float32)[None, None, :]
    blended = region * (1 - a3) + deep * a3
    img.paste(Image.fromarray(blended.astype('uint8')), (px0, py0))
    d.text((wx0 + 26, py0 + 30), zh, font=font(40, 'black', serif=True), fill=(255, 255, 255))
    d.text((wx0 + 28, py0 + 82), sci, font=font(13, 'regular', serif=True), fill=(212, 228, 214))

    # 圖窗右下：IUCN 徽章
    iucn = c.get('iucn') or ''
    code = next((v for k, v in (('無危', 'LC'), ('近危', 'NT'), ('易危', 'VU'),
                                ('瀕危', 'EN'), ('極危', 'CR')) if k in iucn), '')
    col = {'LC': (28, 122, 78), 'NT': (138, 124, 18), 'VU': (168, 116, 19),
           'EN': (176, 74, 30), 'CR': (143, 31, 34)}.get(code, (110, 120, 112))
    d.ellipse((bx - br, by - br, bx + br, by + br), fill=col, outline=(255, 255, 255), width=4)
    d.text((bx, by - 6), code or '—', font=font(int(br * 1.0), 'black', serif=True),
           fill=(255, 255, 255), anchor='mm')
    d.text((bx, by + int(br * 0.55)), iucn.split()[0] if iucn else '待查',
           font=font(int(br * 0.40), 'bold'), fill=(255, 255, 255), anchor='mm')

    # ══════ ③ 數值帶（遊戲感：粗條 + 數值 + 圖示）══════
    sx0, sy0, sx1, sy1 = X(P['stats'][0]), Y(P['stats'][1]), X(P['stats'][2]), Y(P['stats'][3])
    d.rounded_rectangle((sx0, sy0, sx1, sy1), radius=10, outline=(223, 214, 197), width=2)
    rows = [
        ('體長', f"{idx_bird.get('len') or '—'}", 'cm', 214),
        ('體重', str(meas.get('mass', '—')), 'g', 240),
        ('圖鑑評分', f"{scores.get('o', 0):.1f}" if scores.get('o') else '—', '/5', 5),
    ]
    inner_x = sx0 + 14
    bar_x0 = sx0 + int((sx1 - sx0) * 0.30)
    bar_x1 = sx1 - 118
    band_h = sy1 - sy0
    yy = sy0 + int(band_h * 0.10)
    for label, val, unit, mx in rows:
        d.text((inner_x, yy + 2), label, font=font(14, 'bold', serif=True), fill=DEEP)
        # 粗條
        track_h = 18
        d.rounded_rectangle((bar_x0, yy + 4, bar_x1, yy + 4 + track_h), radius=9, fill=(232, 227, 214))
        try:
            frac = max(0.06, min(1.0, float(str(val).replace('—', '0') or 0) / mx))
        except ValueError:
            frac = 0.06
        d.rounded_rectangle((bar_x0, yy + 4, bar_x0 + int((bar_x1 - bar_x0) * frac), yy + 4 + track_h),
                            radius=9, fill=GOLD)
        d.text((bar_x1 + 12, yy + 1), f'{val}', font=font(20, 'black', serif=True), fill=DEEP)
        d.text((bar_x1 + 12 + tw(d, str(val), font(20, 'black', serif=True)) + 4, yy + 9),
               unit, font=font(12, 'bold'), fill=INK2)
        yy += int(band_h * 0.17)

    # 數值帶下面：食性晶片（遊戲感，圖示 + 名）
    cy2 = sy1 - 44
    cx2 = inner_x
    for tid in (idx_bird.get('d') or [])[:5]:
        if tid not in DIET_ZH:
            continue
        nm = DIET_ZH[tid]
        f = font(12, 'bold', serif=True)
        wc = 9 + 17 + 5 + tw(d, nm, f) + 11
        d.rounded_rectangle((cx2, cy2, cx2 + wc, cy2 + 27), radius=14,
                            fill=(238, 233, 219), outline=(219, 210, 191), width=1)
        ci = icon(f'diet-{tid}', 'deep', 128)
        if ci:
            ci = ci.resize((17, 17), Image.LANCZOS)
            img.paste(ci, (int(cx2 + 9), int(cy2 + 5)), ci)
        d.text((cx2 + 9 + 17 + 5, cy2 + 6), nm, font=f, fill=DEEP)
        cx2 += wc + 7

    # ══════ ④ 四塊小牌：一句話（百科全書式小標註）══════
    rx0, ry0, rx1, ry1 = X(P['row'][0]), Y(P['row'][1]), X(P['row'][2]), Y(P['row'][3])
    gap = 12
    pw_ = (rx1 - rx0 - gap * 3) // 4
    cards = [
        ('外形', 'ui-feather', c.get('look')),
        ('食性', 'ui-feed', c.get('diet')),
        ('鳴聲', 'ui-voice', c.get('voice')),
        ('冷知識', 'ui-funfact', c.get('funFact')),
    ]
    for i, (label, ic, text) in enumerate(cards):
        x = rx0 + i * (pw_ + gap)
        d.rounded_rectangle((x, ry0, x + pw_, ry1), radius=12, fill=CARD,
                            outline=(224, 217, 202), width=2)
        # 細標籤（深綠底 + 白圖示 + 白字）
        f = font(12, 'bold', serif=True)
        lw = 10 + 16 + 5 + tw(d, label, f) + 12
        d.rounded_rectangle((x + 10, ry0 + 9, x + 10 + lw, ry0 + 9 + 24), radius=12, fill=DEEP)
        ic_im = icon(ic, 'white', 128)
        if ic_im:
            ic_im = ic_im.resize((16, 16), Image.LANCZOS)
            img.paste(ic_im, (int(x + 20), int(ry0 + 13)), ic_im)
        d.text((x + 10 + 10 + 16 + 5, ry0 + 14), label, font=f, fill=(255, 255, 255))
        # 內文：最多 3 行，字級自動
        body = first_sentence(text, 60) if text else '資料待查'
        maxw = pw_ - 22
        size = 13
        while size > 10:
            fb = font(size, 'regular')
            if len(wrap(d, body, fb, maxw)) <= 4:
                break
            size -= 1
        fb = font(size, 'regular')
        lines = wrap(d, body, fb, maxw)[:4]
        byy = ry0 + 42
        for ln in lines:
            d.text((x + 11, byy), ln, font=fb, fill=INK)
            byy += int(size * 1.45)

    # ══════ ⑤ 底欄 ══════
    fx0, fy0, fx1, fy1 = X(P['footer'][0]), Y(P['footer'][1]), X(P['footer'][2]), Y(P['footer'][3])
    d.text((fx0 + 8, fy0 + 8), f'NO.{bird_id}', font=font(15, 'bold'), fill=GOLD)
    nm = f'{zh}（{sci}）'
    d.text(((fx0 + fx1) / 2 - tw(d, nm, font(14, 'bold')) / 2, fy0 + 9), nm,
           font=font(14, 'bold'), fill=(255, 255, 255))
    src = load('cardSources.json').get('sources', {}).get(bird_id, '')
    if src:
        one = src.replace('｜', ' · ')
        f9 = font(9)
        one = one_line(d, one, f9, int((fx1 - fx0) * 0.34))
        d.text((fx1 - 10 - tw(d, one, f9), fy0 + 11), one, font=f9, fill=(152, 178, 160))

    os.makedirs(os.path.join(ART, 'out'), exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size)


if __name__ == '__main__':
    bid = (sys.argv[1] if len(sys.argv) > 1 else '0013').zfill(4)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ART, 'out', f'v3-{bid}.png')
    render(bid, out)
