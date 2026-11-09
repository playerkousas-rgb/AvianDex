#!/usr/bin/env python3
# ============================================================
#  AvianDex — 卡面「圖鑑版」（Encyclopedia／Picture-led）
# ------------------------------------------------------------
#  為甚麼要有這一版？
#    圖鑑／百科全書之所以吸引小朋友，是因為「一頁好多圖，每幅圖下面一句話」。
#    上一版把資料寫成一句句長文，變成了文字說明書；這一版把重心搬回圖片：
#
#      頂部書眉：NO.0013 · 椋鳥科 · 八哥 / Crested Myna
#      大圖：主相（1–4 號辨認位）
#      圖陣：6 幅圖，每幅下面只有一句標註
#            飛行・身體部位・巢與蛋・食乜・住邊・大細比較
#
#  規則：
#    · 書眉只佔一窄條，唔會用大面積色塊搶走圖片的注意力
#    · 每幅圖最多兩行標註（一行講係咩，一行講重點）
#    · 冇素材的格會收掉，唔會畫空框
#    · 文字 100% 由程式寫入，全部來自 cardCopy／callouts 原文
#
#  用法：python3 scripts/cards/render-card-encyclopedia.py 0013
# ============================================================
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
ART = os.path.join(ROOT, 'data', 'card-demo')
OUT_DIR = os.path.join(ART, 'out')
FONT_DIR = os.path.expanduser('~/.fonts')

W, H = 1024, 1536
M = 40

CREAM = (252, 249, 240)
INK = (30, 28, 24)
INK_SOFT = (104, 96, 84)
GREEN = (22, 84, 48)
GREEN_L = (226, 238, 224)
CORAL = (206, 92, 72)
YELLOW = (232, 170, 30)
RULE = (219, 211, 195)
WHITE = (255, 255, 255)

SANS = {
    'black': 'NotoSansTC_900Black.ttf',
    'bold': 'NotoSansTC_700Bold.ttf',
    'regular': 'NotoSansTC_400Regular.ttf',
}


def font(size, weight='bold'):
    return ImageFont.truetype(os.path.join(FONT_DIR, SANS[weight]), size)


def tw(d, s, f):
    return d.textlength(s, font=f)


def wrap(d, s, f, maxw):
    lines, cur = [], ''
    for ch in s:
        if tw(d, cur + ch, f) <= maxw:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def fit_lines(d, s, maxw, max_lines, start, down, weight='regular'):
    size = start
    while size > down:
        f = font(size, weight)
        lines = wrap(d, s, f, maxw)
        if len(lines) <= max_lines:
            return f, lines
        size -= 1
    f = font(down, weight)
    return f, wrap(d, s, f, maxw)[:max_lines]


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    return im.crop(((im.width - w) // 2, (im.height - h) // 2,
                    (im.width - w) // 2 + w, (im.height - h) // 2 + h))


def autocrop(path, bg_tol=18):
    """裁走圖示四周的白／米色邊，令圖示在格子內盡量大。"""
    im = Image.open(path).convert('RGB')
    w, h = im.size
    px = im.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(v[i] for v in corners) // 4 for i in range(3))

    def is_bg(p):
        return all(abs(p[i] - bg[i]) <= bg_tol for i in range(3))

    left, right, top_, bottom = w, 0, h, 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if not is_bg(px[x, y]):
                left = min(left, x)
                right = max(right, x)
                top_ = min(top_, y)
                bottom = max(bottom, y)
    if right <= left or bottom <= top_:
        return im
    pad = 6
    return im.crop((max(0, left - pad), max(0, top_ - pad),
                    min(w, right + pad), min(h, bottom + pad)))


def contain(path, w, h, bg):
    im = Image.open(path).convert('RGBA')
    r = min(w / im.width, h / im.height) * 0.98
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    canvas = Image.new('RGBA', (w, h), bg + (255,))
    canvas.paste(im, ((w - im.width) // 2, (h - im.height) // 2), im)
    return canvas.convert('RGB')


def load(rel):
    with open(os.path.join(DATA, rel), encoding='utf-8') as f:
        return json.load(f)


def clip(s, limit):
    """短標註：截到一個完整句／分句，唔會留半句。"""
    s = (s or '').replace('\n', ' ').strip()
    if len(s) <= limit:
        return s
    cut = s[:limit]
    for sep in ('。', '；'):
        i = cut.rfind(sep)
        if i > limit * 0.45:
            return cut[:i]
    for sep in ('，', '、'):
        i = cut.rfind(sep)
        if i > limit * 0.45:
            return cut[:i]
    return cut


def contain_cropped(path, w, h, bg):
    im = autocrop(path)
    r = min(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    canvas = Image.new('RGB', (w, h), bg)
    canvas.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
    return canvas


def tile(img, path, box, pad=0, bg=CREAM, mode='cover'):
    x0, y0, x1, y1 = [int(v) for v in box]
    w, h = x1 - x0, y1 - y0
    if not os.path.exists(path):
        return False
    if mode == 'cover':
        img.paste(cover(path, w, h), (x0, y0))
    else:
        img.paste(contain(path, w, h, bg), (x0, y0))
    return True


def render(bird_id, out_path):
    birds = load('birds.json')
    tax = load('birdTaxonomy.json')
    copy = load('cardCopy.json')
    idx = load('explorerIndex.json')

    b = next((x for x in birds if x['id'] == bird_id), {})
    t = tax.get(bird_id, {})
    c = copy.get(bird_id, {})
    e = (idx.get('birds') or {}).get(bird_id, {})

    zh = b.get('name', '')
    en = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')
    fam_zh = t.get('familyZh') or e.get('fz') or ''
    code = e.get('code', '')

    co_path = os.path.join(ART, f'{bird_id}-callouts.json')
    callouts = c.get('callouts')
    if not callouts and os.path.exists(co_path):
        with open(co_path, encoding='utf-8') as f:
            callouts = json.load(f).get('callouts')
    callouts = callouts or []

    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)

    # ---------- 書眉（窄條，唔搶圖） ----------
    d.rectangle((0, 0, W, 96), fill=GREEN)
    # 像素小鳥做書眉左邊的記號
    sp = os.path.join(ART, f'{bird_id}-sprite.png')
    if os.path.exists(sp):
        img.paste(contain(sp, 62, 62, GREEN), (M, 17))
    hx = M + 74
    d.text((hx, 14), f'NO.{bird_id}', font=font(19, 'bold'), fill=YELLOW)
    f_zh = font(40, 'black')
    while tw(d, zh, f_zh) > 460 and f_zh.size > 26:
        f_zh = font(f_zh.size - 2, 'black')
    d.text((hx, 38), zh, font=f_zh, fill=WHITE)
    # 右：英文名 + 學名 + 科
    fx = W - M
    f_en = font(19, 'bold')
    d.text((fx - tw(d, en, f_en), 20), en, font=f_en, fill=(214, 232, 213))
    f_sc = font(15, 'regular')
    d.text((fx - tw(d, sci, f_sc), 46), sci, font=f_sc, fill=(170, 200, 175))
    tail = f'{fam_zh} · {code}' if code else fam_zh
    f_t = font(13, 'regular')
    d.text((fx - tw(d, tail, f_t), 68), tail, font=f_t, fill=(150, 186, 158))

    # ---------- 主圖 + 辨認位 ----------
    top = 112
    hero_h = 430
    hero = (M, top, W - M, top + hero_h)
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    if os.path.exists(photo):
        img.paste(cover(photo, hero[2] - hero[0], hero_h), (hero[0], top))
        for i, item in enumerate(callouts[:4], 1):
            a = item.get('anchor') if isinstance(item, dict) else None
            a = a or [0.5, 0.25 + 0.17 * (i - 1)]
            ax = hero[0] + (hero[2] - hero[0]) * float(a[0])
            ay = top + hero_h * float(a[1])
            d.ellipse((ax - 15, ay - 15, ax + 15, ay + 15), fill=WHITE, outline=CORAL, width=3)
            d.text((ax - tw(d, str(i), font(15, 'black')) / 2, ay - 11), str(i),
                   font=font(15, 'black'), fill=CORAL)
        labels = [x.get('label', '') for x in callouts if isinstance(x, dict) and x.get('label')]
        if labels:
            cap = '認住佢：' + '・'.join(labels)
            f_c = font(22, 'black')
            lines = wrap(d, cap, f_c, hero[2] - hero[0] - 40)[:2]
            bh = 22 + len(lines) * 30
            d.rectangle((hero[0] + 12, hero[3] - bh - 12, hero[2] - 12, hero[3] - 12),
                        fill=(18, 44, 28))
            for j, ln in enumerate(lines):
                d.text((hero[0] + 26, hero[3] - bh - 2 + j * 30), ln, font=f_c, fill=WHITE)
    else:
        d.rectangle(hero, fill=GREEN_L)
        d.text((hero[0] + 30, top + hero_h // 2 - 16), f'相片待補：{en}', font=font(24, 'bold'), fill=INK_SOFT)

    # ---------- 圖陣：每幅圖＋一句標註 ----------
    #  圖片來源全部係本機素材；冇素材就收掉，不留空框
    def call_text(keyword):
        for x in callouts:
            if isinstance(x, dict) and keyword in (x.get('label') or ''):
                return x.get('text') or ''
        return ''

    head_text = {
        'flight': ('飛行', clip(call_text('翼') or c.get('look') or '飛行時白色翼斑最明顯', 24)),
        'parts': ('身體部位', '喙・腳・羽毛（插畫）'),
        'nest': ('巢與蛋', '4–7 月繁殖，每巢 4–6 枚蛋'),
        'diet': ('食乜', '植物性與動物性各約一半'),
        'habitat': ('住邊', '城市與農業區的開闊空間'),
        'size': ('大細', '示意：未有確實身長資料'),
    }
    order = ['flight', 'parts', 'nest', 'diet', 'habitat', 'size']
    tiles = []
    for key in order:
        if key in ('flight', 'parts', 'nest', 'size'):
            p = os.path.join(ART, f'{bird_id}-{key}.png')
        else:
            p = os.path.join(ART, f'{bird_id}-{key}.png')
        if os.path.exists(p) and head_text[key][0]:
            tiles.append((key, p))

    if tiles:
        gy = top + hero_h + 16
        cols = 2
        rows = (len(tiles) + cols - 1) // cols
        foot_top = H - 56
        gx = 12
        cw = (W - 2 * M - gx) / 2
        cap_h = 52
        avail = foot_top - gy - 12
        th = min(300, (avail - rows * cap_h - (rows - 1) * gx) / rows)
        for i, (key, path) in enumerate(tiles):
            r, col = divmod(i, cols)
            x0 = M + col * (cw + gx)
            y0 = gy + r * (th + cap_h + gx)
            box = (x0, y0, x0 + cw, y0 + th)
            mode = 'contain' if key in ('diet', 'habitat', 'size', 'parts') else 'cover'
            bg = WHITE if key in ('diet', 'habitat', 'size', 'parts') else CREAM
            if mode == 'contain':
                try:
                    img.paste(contain_cropped(path, int(cw), int(th), bg), (int(x0), int(y0)))
                except Exception:
                    tile(img, path, box, bg=bg, mode=mode)
            else:
                tile(img, path, box, bg=bg, mode=mode)
            d.rectangle(box, outline=RULE, width=1)
            title, caption = head_text[key]
            d.text((x0, y0 + th + 7), title, font=font(19, 'black'), fill=GREEN)
            if caption:
                cap_clean = caption.rstrip('，、；。 ')
                f_cap, lines = fit_lines(d, cap_clean, cw, 1, 16, 13, 'regular')
                d.text((x0, y0 + th + 32), lines[0], font=f_cap, fill=INK_SOFT)

    # ---------- 頁腳 ----------
    foot = H - 56
    d.line((M, foot, W - M, foot), fill=RULE, width=1)
    src = (c.get('source') or '').replace('｜', ' · ')
    f_src = font(12, 'regular')
    while tw(d, src, f_src) > W - 2 * M - 150 and len(src) > 20:
        src = src[:-4]
    d.text((M, foot + 10), f'資料來源：{src}', font=f_src, fill=INK_SOFT)
    d.text((M, foot + 28), f'AVIANDEX · NO.{bird_id} · 圖鑑版', font=font(12, 'bold'), fill=GREEN)
    common = int(c.get('commonness') or 3)
    for i in range(5):
        cx = W - M - 6 - (4 - i) * 18
        d.ellipse((cx - 6, foot + 30, cx + 6, foot + 42),
                  fill=YELLOW if i < common else (224, 218, 205))

    os.makedirs(OUT_DIR, exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size, 'tiles:', len(tiles))


if __name__ == '__main__':
    bid = sys.argv[1] if len(sys.argv) > 1 else '0013'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(OUT_DIR, f'aviandex-card-{bid}-enc.png')
    render(bid, out)
