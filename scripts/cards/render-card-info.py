#!/usr/bin/env python3
# ============================================================
#  AvianDex — 資訊圖卡（Info Card）
# ------------------------------------------------------------
#  依據用戶原版圖卡（docs/assets/dexcard-0008-example.png）的結構重做：
#    一張卡 = 一個完整資訊單元，分格清楚，每格講一件事。
#
#    書眉：NO. / 中文名 / 學名 / 英文 / 目・科 / 身長・體重・常見度
#    左欄：像素圖 → 基本介紹 → 分類資訊
#    主圖：真雀相 + 右邊 4 個圓形特寫（用引線連住相片上的位置）
#    第一排 4 格：分佈地區（地圖）／棲息環境／食物／Top 5 亮點
#    第二排 4 格：成長與繁殖／行為特徵／有趣冷知識／注意事項
#    評分卡：5 項 + 綜合（未評分就寫「未評分」，唔會作假分）
#    底欄：NO. + 名稱 + 版本
#
#  與上一版的差別（唔再犯 AI 味）：
#    · 冇漸層、冇彩色光暈、冇每格一個圓形 icon
#    · 實色書眉、1px 細邊界、留白分隔
#    · 只用兩個字族：Noto Serif TC（名字／欄目）、Noto Sans TC（內文）
#    · 每格文字有垂直預算，唔會爆格或踩落下一格
#
#  用法：python3 scripts/cards/render-card-info.py 0013
# ============================================================
import json
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
ART = os.path.join(ROOT, 'data', 'card-demo')
OUT_DIR = os.path.join(ART, 'out')
FONTS = os.path.expanduser('~/.fonts')

W, H = 1024, 1536
M = 30

CREAM = (250, 247, 239)
WHITE = (255, 255, 255)
INK = (28, 26, 22)
INK2 = (96, 89, 78)
RULE = (222, 215, 200)
DEEP = (17, 63, 42)       # 書眉深綠（實色）
DEEP_L = (231, 239, 230)  # 深綠淺底
ACCENT = (196, 84, 60)    # 珊瑚（只做細重點）
GOLD = (206, 152, 32)

SERIF = {'black': 'NotoSerifTC_900Black.ttf', 'bold': 'NotoSerifTC_600SemiBold.ttf',
         'regular': 'NotoSerifTC_400Regular.ttf'}
SANS = {'black': 'NotoSansTC_900Black.ttf', 'bold': 'NotoSansTC_700Bold.ttf',
        'regular': 'NotoSansTC_400Regular.ttf'}


def font(size, weight='bold', serif=False):
    return ImageFont.truetype(os.path.join(FONTS, (SERIF if serif else SANS)[weight]), size)


def tw(d, s, f):
    return d.textlength(s, font=f)


def wrap(d, s, f, maxw):
    lines, cur = [], ''
    for ch in s:
        if tw(d, cur + ch, f) <= maxw:
            cur += ch
        else:
            if cur:
                lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def para(d, xy, s, f, maxw, leading=1.55, limit=None, fill=INK):
    x, y = xy
    lines = wrap(d, s, f, maxw)
    if limit:
        lines = lines[:limit]
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill)
        y += int(f.size * leading)
    return y


def fit(d, s, maxw, maxh, start=16, down=11, leading=1.55, limit=None, weight='regular'):
    """在給定寬高內找最大可用字級；保證唔會溢出。"""
    size = start
    while size >= down:
        f = font(size, weight)
        lines = wrap(d, s, f, maxw)
        if limit:
            lines = lines[:limit]
        if len(lines) * int(size * leading) <= maxh:
            return f, lines
        size -= 1
    f = font(down, weight)
    return f, wrap(d, s, f, maxw)[:limit or 99]


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def autocrop(path, tol=16):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    px = im.load()
    cs = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in cs) // 4 for i in range(3))

    def isbg(p):
        return all(abs(p[i] - bg[i]) <= tol for i in range(3))

    l, r, t, b = w, 0, h, 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if not isbg(px[x, y]):
                l, r, t, b = min(l, x), max(r, x), min(t, y), max(b, y)
    if r <= l or b <= t:
        return im
    return im.crop((max(0, l - 4), max(0, t - 4), min(w, r + 4), min(h, b + 4)))


def contain(path, w, h, bg=WHITE):
    im = autocrop(path)
    r = min(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    c = Image.new('RGB', (w, h), bg)
    c.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
    return c


def load(rel):
    with open(os.path.join(DATA, rel), encoding='utf-8') as f:
        return json.load(f)


def sent(s, limit=200):
    """取第一個完整句（唔截半句）。"""
    s = (s or '').replace('\n', ' ').strip()
    if len(s) <= limit:
        return s
    for sep in ('。', '；'):
        i = s.find(sep)
        if 0 < i < limit:
            return s[:i + 1]
    return s[:limit].rstrip('，、；：') + '…'


def block(d, box, fill=WHITE, outline=RULE, r=8, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def cell_head_light(d, x, y, title, size=17):
    """深色書眉區域用的欄目（淺字）。"""
    d.rectangle((x, y + 3, x + 4, y + 3 + size - 3), fill=GOLD)
    d.text((x + 11, y), title, font=font(size, 'bold', serif=True), fill=(212, 226, 214))


def cell_head(d, x, y, title, size=19):
    """欄目：細色塊 + 襯線標題（唔用圓形 icon）。"""
    d.rectangle((x, y + 4, x + 5, y + 4 + size - 2), fill=DEEP)
    d.text((x + 12, y), title, font=font(size, 'bold', serif=True), fill=DEEP)


def render(bird_id, out_path):
    birds = load('birds.json')
    tax = load('birdTaxonomy.json')
    copy = load('cardCopy.json')

    b = next((x for x in birds if x['id'] == bird_id), {})
    t = tax.get(bird_id, {})
    c = copy.get(bird_id, {})
    zh = b.get('name', '')
    en = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')
    order_zh, family_zh = t.get('orderZh', ''), t.get('familyZh', '')

    co = os.path.join(ART, f'{bird_id}-callouts.json')
    callouts = c.get('callouts')
    if not callouts and os.path.exists(co):
        with open(co, encoding='utf-8') as f:
            callouts = json.load(f).get('callouts')

    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)

    FOOT = 56
    footer_y = H - FOOT

    # ---------- 縱向預算（由底排上去） ----------
    GAP = 12
    ROW1, ROW2, SCORE = 214, 182, 76
    score_y = footer_y - 12 - SCORE
    row2_y = score_y - GAP - ROW2
    row1_y = row2_y - GAP - ROW1

    # ---------- ① 書眉 ----------
    head_h = 118
    d.rectangle((0, 0, W, head_h), fill=DEEP)
    sp = os.path.join(ART, f'{bird_id}-sprite.png')
    if os.path.exists(sp):
        img.paste(contain(sp, 78, 78, DEEP), (M, (head_h - 78) // 2))
    hx = M + 92
    d.text((hx, 16), f'NO.{bird_id}', font=font(22, 'bold'), fill=GOLD)
    f_zh = font(56, 'black', serif=True)
    while tw(d, zh, f_zh) > 330 and f_zh.size > 30:
        f_zh = font(f_zh.size - 2, 'black', serif=True)
    d.text((hx - 2, 40), zh, font=f_zh, fill=WHITE)

    # 學名 / 英文（中文名右邊）
    mid_x = M + 300
    d.text((mid_x, 40), sci, font=font(17, 'regular', serif=True), fill=(190, 212, 194))
    pw = tw(d, en, font(16, 'bold')) + 22
    d.rounded_rectangle((mid_x, 68, mid_x + pw, 68 + 28), radius=14, fill=WHITE)
    d.text((mid_x + 11, 72), en, font=font(16, 'bold'), fill=DEEP)

    # 右上：目／科 + 身長／體重／常見度（細行，唔用藥丸）
    rx = W - M
    f_small = font(14, 'regular')
    for i, (zhv, lv) in enumerate([(order_zh, t.get('order', '')), (family_zh, t.get('family', ''))]):
        line = f'{zhv} {lv}'.strip()
        d.text((rx - tw(d, line, f_small), 12 + i * 21), line, font=f_small, fill=(178, 202, 182))

    stats = [('身長', c.get('length')), ('體重', c.get('weight'))]
    sy = 54
    for label, val in stats:
        d.text((rx - 250, sy), label, font=font(12, 'bold'), fill=(150, 178, 156))
        v = val or '待補'
        fv = font(14, 'bold')
        d.text((rx - tw(d, v, fv), sy - 1), v, font=fv, fill=WHITE if val else (150, 178, 156))
        sy += 20
    d.text((rx - 250, sy + 2), '常見度', font=font(12, 'bold'), fill=(150, 178, 156))
    common = int(c.get('commonness') or 3)
    for i in range(5):
        cx = rx - 14 - (4 - i) * 15
        d.ellipse((cx - 5, sy + 3, cx + 5, sy + 13),
                  fill=GOLD if i < common else (62, 104, 78))

    content_top = head_h + 14

    # ---------- ② 左欄 ----------
    lx, col_w = M, 262
    main_h = row1_y - GAP - content_top

    tax_rows = [
        ('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'),
        ('目', f'{order_zh} {t.get("order", "")}'.strip()),
        ('科', f'{family_zh} {t.get("family", "")}'.strip()),
        ('屬', sci.split(' ')[0] if sci else '—'),
        ('種', f'{zh} {short_sci(sci)}'.strip()),
    ]
    tax_h = 40 + len(tax_rows) * 26
    intro_text = c.get('intro_zh') or build_intro(c, zh)
    # 先量基本介紹需要幾高（最多 9 行），剩餘高度全部讓給像素圖
    f_i = font(15, 'regular')
    intro_lines = min(len(wrap(d, intro_text, f_i, col_w - 26)), 9)
    intro_h = 46 + intro_lines * int(15 * 1.6) + 8
    sprite_h = max(120, main_h - intro_h - tax_h - 2 * 10)

    block(d, (lx, content_top, lx + col_w, content_top + sprite_h))
    if os.path.exists(sp):
        img.paste(contain(sp, col_w - 18, sprite_h - 18, WHITE), (lx + 9, content_top + 9))
    else:
        d.text((lx + 14, content_top + sprite_h // 2), '像素圖待補', font=font(14), fill=INK2)

    iy = content_top + sprite_h + 10
    block(d, (lx, iy, lx + col_w, iy + intro_h))
    cell_head(d, lx + 11, iy + 8, '基本介紹', 18)
    f, lines = fit(d, intro_text, col_w - 26, intro_h - 52, 15, 12, 1.6, weight='regular')
    para(d, (lx + 13, iy + 38), intro_text, f, col_w - 26, leading=1.6, limit=len(lines))

    ty = iy + intro_h + 10
    block(d, (lx, ty, lx + col_w, ty + tax_h))
    cell_head(d, lx + 11, ty + 7, '分類資訊', 18)
    ry = ty + 38
    for k, v in tax_rows:
        d.text((lx + 13, ry), f'{k}', font=font(12, 'bold'), fill=ACCENT)
        d.text((lx + 32, ry - 1), v, font=font(13, 'regular'), fill=INK)
        ry += 26

    # ---------- ③ 主圖 + 特寫 ----------
    mx = lx + col_w + 12
    right_col = 208
    photo_w = W - M - mx - right_col - 10
    box = (mx, content_top, mx + photo_w, content_top + main_h)
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    if os.path.exists(photo):
        img.paste(cover(photo, photo_w, main_h), (mx, content_top))
        d.rectangle(box, outline=RULE, width=1)
    else:
        d.rectangle(box, fill=DEEP_L)
        d.text((mx + 20, content_top + main_h // 2 - 14), f'相片待補：{en}', font=font(19, 'bold'), fill=INK2)

    insets = []
    for i, item in enumerate((callouts or [])[:4], 1):
        key = (item.get('inset') if isinstance(item, dict) else None) or ['crest', 'eye', 'wing', 'feet'][i - 1]
        p = os.path.join(ART, f'{bird_id}-inset-{key}.jpg')
        if os.path.exists(p):
            insets.append((i, item, key, p))

    if insets and os.path.exists(photo):
        col_x = mx + photo_w + 10
        rad = 30
        for n, (i, item, key, p) in enumerate(insets):
            a = item.get('anchor') if isinstance(item, dict) else None
            a = a or [0.5, 0.22 + 0.2 * n]
            ax = mx + photo_w * max(0.58, float(a[0]))
            ay = content_top + main_h * float(a[1])
            # 相片上的細圈（唔遮主體）
            d.ellipse((ax - 11, ay - 11, ax + 11, ay + 11), outline=WHITE, width=2)
            d.ellipse((ax - 3, ay - 3, ax + 3, ay + 3), fill=ACCENT)
            # 右邊特寫圓
            cy = content_top + rad + 8 + n * (rad * 2 + 26)
            cx = col_x + rad
            im = cover(p, rad * 2, rad * 2)
            mask = Image.new('L', (rad * 2, rad * 2), 0)
            ImageDraw.Draw(mask).ellipse((0, 0, rad * 2 - 1, rad * 2 - 1), fill=255)
            img.paste(im, (int(cx - rad), int(cy - rad)), mask)
            d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), outline=RULE, width=2)
            # 引線：由相片圓點拉去特寫
            d.line((ax + 11, ay, cx - rad - 4, cy), fill=(190, 182, 166), width=1)
            # 文字
            f1 = font(14, 'bold', serif=True)
            d.text((cx + rad + 8, cy - rad + 2), (item.get('label') if isinstance(item, dict) else '') or '',
                   font=f1, fill=INK)
            txt = (item.get('text') if isinstance(item, dict) else '') or ''
            ft = font(11, 'regular')
            for j, ln in enumerate(wrap(d, txt, ft, right_col - rad * 2 - 12)[:3]):
                d.text((cx + rad + 8, cy - rad + 22 + j * 15), ln, font=ft, fill=INK2)

        # 特寫下面：名稱由來（參考圖也有）
        ny = content_top + rad + 8 + len(insets) * (rad * 2 + 26) - 4
        if c.get('etymology'):
            d.line((col_x, ny - 12, W - M, ny - 12), fill=(70, 110, 84), width=1)
            cell_head_light(d, col_x, ny, '名稱由來', 17)
            fe, lines = fit(d, c['etymology'], W - M - col_x, content_top + main_h - ny - 42,
                            13, 10, 1.5, weight='regular')
            para(d, (col_x, ny + 26), c['etymology'], fe, W - M - col_x,
                 leading=1.5, limit=len(lines), fill=(186, 206, 190))

    # ---------- ④ 第一排四格 ----------
    gap = 10
    cw = (W - 2 * M - 3 * gap) / 4
    row1 = [('分佈地區', c.get('range'), 'map'),
            ('棲息環境', c.get('habitat'), 'habitat'),
            ('食物', c.get('diet'), 'diet'),
            ('Top 5 亮點', c.get('highlights'), 'top5')]
    for i, (title, val, kind) in enumerate(row1):
        x0 = M + i * (cw + gap)
        block(d, (x0, row1_y, x0 + cw, row1_y + ROW1))
        cell_head(d, x0 + 10, row1_y + 8, title, 17)
        ty0 = row1_y + 42
        if kind == 'map':
            mp = os.path.join(ART, f'{bird_id}-map.png')
            if os.path.exists(mp):
                img.paste(cover(mp, int(cw) - 18, 76), (int(x0) + 9, ty0))
                d.rectangle((x0 + 9, ty0, x0 + cw - 9, ty0 + 76), outline=RULE, width=1)
                ty0 += 84
            if val:
                f, lines = fit(d, val, cw - 22, row1_y + ROW1 - ty0 - 8, 13, 10, 1.45, limit=6)
                para(d, (x0 + 10, ty0), val, f, cw - 22, leading=1.45, limit=len(lines))
        elif kind == 'top5':
            yy = ty0
            for n, it in enumerate((c.get('highlights') or [])[:5], 1):
                d.text((x0 + 10, yy - 1), f'{n}', font=font(12, 'bold'), fill=ACCENT)
                f = font(12, 'regular')
                ln = wrap(d, clean(it), f, cw - 34)[:2]
                for j, s2 in enumerate(ln):
                    d.text((x0 + 24, yy + j * 16), s2, font=f, fill=INK)
                yy += 16 * len(ln) + 6
                if yy > row1_y + ROW1 - 18:
                    break
        else:
            pic = os.path.join(ART, f'{bird_id}-{kind}.png')
            if os.path.exists(pic):
                pic_h = 104 if kind == 'diet' else 62
                img.paste(contain(pic, int(cw) - 18, pic_h, WHITE), (int(x0) + 9, ty0))
                ty0 += pic_h + 4
            if val:
                f, lines = fit(d, val, cw - 22, row1_y + ROW1 - ty0 - 8, 13, 10, 1.45, limit=6)
                para(d, (x0 + 10, ty0), val, f, cw - 22, leading=1.45, limit=len(lines))
            elif not os.path.exists(pic):
                d.text((x0 + 10, ty0 + 4), '資料待查', font=font(13), fill=INK2)

    # ---------- ⑤ 第二排四格 ----------
    row2 = [('成長與繁殖', c.get('breeding')), ('行為特徵', c.get('behavior')),
            ('有趣冷知識', c.get('funFact')), ('注意事項', c.get('caution') or c.get('conservation'))]
    for i, (title, val) in enumerate(row2):
        x0 = M + i * (cw + gap)
        block(d, (x0, row2_y, x0 + cw, row2_y + ROW2))
        cell_head(d, x0 + 10, row2_y + 8, title, 17)
        body = row2_y + 40
        if isinstance(val, list):
            yy = body
            for it in val[:4]:
                f, lines = fit(d, clean(it), cw - 28, 46, 12, 10, 1.4, limit=2)
                for j, s2 in enumerate(lines):
                    d.text((x0 + 11 + (0 if j else 0), yy + j * 17), ('・' if j == 0 else '  ') + s2 if j == 0 else '  ' + s2,
                           font=f, fill=INK)
                yy += 17 * len(lines) + 6
        elif val:
            f, lines = fit(d, val, cw - 22, row2_y + ROW2 - body - 8, 13, 10, 1.45, limit=7)
            para(d, (x0 + 10, body), val, f, cw - 22, leading=1.45, limit=len(lines))
        else:
            d.text((x0 + 10, body + 2), '資料待查', font=font(13), fill=INK2)

    # ---------- ⑥ 評分卡（唔作假分數） ----------
    block(d, (M, score_y, W - M, score_y + SCORE))
    cell_head(d, M + 11, score_y + 7, '生態價值評分卡', 17)
    sc = c.get('scores') or {}
    keys = ['生態重要性', '適應力', '觀賞價值', '研究價值', '保育關注度']
    sw = (W - 2 * M - 210) / 5
    for i, k in enumerate(keys):
        x0 = M + 14 + i * sw
        d.text((x0, score_y + 36), k, font=font(12, 'bold'), fill=INK2)
        v = sc.get(k)
        if v:
            for j in range(5):
                cx = x0 + j * 15
                d.ellipse((cx, score_y + 54, cx + 10, score_y + 64),
                          fill=GOLD if j < float(v) else (228, 222, 208))
            d.text((x0 + 78, score_y + 51), f'{v}', font=font(12, 'bold'), fill=INK)
        else:
            d.text((x0, score_y + 53), '未評分', font=font(11, 'regular'), fill=(170, 163, 150))
    ox = W - M - 186
    d.text((ox, score_y + 34), '綜合評分', font=font(12, 'bold'), fill=INK2)
    if sc:
        avg = sum(float(v) for v in sc.values()) / len(sc)
        d.text((ox, score_y + 46), f'{avg:.1f}', font=font(30, 'black', serif=True), fill=DEEP)
        d.text((ox + tw(d, f'{avg:.1f}', font(30, 'black', serif=True)) + 4, score_y + 58), '/5',
               font=font(14, 'bold'), fill=INK2)
    else:
        d.text((ox, score_y + 40), '—', font=font(26, 'black', serif=True), fill=(198, 192, 180))
        d.text((ox + 34, score_y + 50), '待編者評分', font=font(10, 'regular'), fill=(176, 169, 156))

    # ---------- ⑦ 底欄 ----------
    d.rectangle((0, footer_y, W, H), fill=DEEP)
    d.text((M, footer_y + 18), f'NO.{bird_id}', font=font(16, 'bold'), fill=GOLD)
    nm = f'{zh}（{sci}）'
    d.text((W / 2 - tw(d, nm, font(15, 'bold')) / 2, footer_y + 19), nm, font=font(15, 'bold'), fill=WHITE)
    ver = 'v2.0 · 資訊卡'
    d.text((W - M - tw(d, ver, font(14, 'bold')), footer_y + 20), ver, font=font(14, 'bold'), fill=GOLD)

    os.makedirs(OUT_DIR, exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size, 'insets:', len(insets))


def clean(s):
    s = (s or '').replace('\n', ' ').strip()
    for sep in ('。', '；'):
        i = s.find(sep)
        if 0 < i < 40:
            return s[:i]
    return s[:38].rstrip('，、；：')


def short_sci(sci):
    p = (sci or '').split()
    return f'{p[0][0]}. {p[1]}' if len(p) >= 2 else (sci or '')


def build_intro(c, name):
    bits = [c.get('look'), c.get('habitat')]
    out = ' '.join(sent(x) for x in bits if x)
    return out or f'{name} ：資料待查。'


if __name__ == '__main__':
    bid = sys.argv[1] if len(sys.argv) > 1 else '0013'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(OUT_DIR, f'aviandex-info-{bid}.png')
    render(bid, out)
