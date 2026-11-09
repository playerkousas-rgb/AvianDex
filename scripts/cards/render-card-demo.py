#!/usr/bin/env python3
# ============================================================
#  AvianDex — 卡面試作（參考你給的「八哥 NO.0013」版式）
# ------------------------------------------------------------
#  用法（在本機或沙盒都可以）：
#      npm run cards:demo            # 出 NO.0013 一張
#      python3 scripts/cards/render-card-demo.py 0290
#
#  為什麼是 Python + Pillow，而不是直接截網頁？
#    · 沙盒沒有 Chromium，但 Pillow 可以出「像素級」PNG 給你看排版
#    · 同一支腳本可以日後接上卡面工作室，輸出 1024×1536 的印刷稿
#
#  圖片來源（依優先次序）：
#    1. data/card-demo/<id>-photo.jpg 等（本機素材，逐張卡自備）
#    2. 沒有的話畫佔位框並寫明要甚麼圖 —— 不會假裝有相
#
#  ⚠️ 所有文字仍然由程式寫入（不是 AI 畫字），所以中英一定準確。
# ============================================================
import json
import os
import re
import sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'src', 'data')
ART = os.path.join(ROOT, 'data', 'card-demo')
OUT_DIR = os.path.join(ROOT, 'data', 'card-demo', 'out')
FONT_DIR = os.path.expanduser('~/.fonts')

W, H = 1024, 1536
NAVY = (21, 47, 92)
BLUE = (23, 103, 182)
BLUE_L = (232, 240, 250)
YELLOW = (250, 204, 21)
RED = (211, 47, 47)
INK = (26, 32, 44)
GREY = (108, 117, 125)
GREY_L = (233, 236, 239)
WHITE = (255, 255, 255)
GREEN = (22, 135, 87)


def font(size, weight='bold'):
    name = {
        'black': 'NotoSansTC_900Black.ttf',
        'bold': 'NotoSansTC_700Bold.ttf',
        'regular': 'NotoSansTC_400Regular.ttf',
    }[weight]
    path = os.path.join(FONT_DIR, name)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def read(name):
    with open(os.path.join(DATA, name), encoding='utf-8') as f:
        return json.load(f)


BIRDS = read('birds.json')
TAX = read('birdTaxonomy.json')
COPY = read('cardCopy.json')
TAXZH = read('taxonomyZh.json')

BY_ID = {b['id']: b for b in BIRDS}


# ---------- 小工具 ----------
def wrap(draw, text, fnt, max_w):
    """中文逐字換行（沒有空格可以斷），英文遇空白斷。"""
    lines, line = [], ''
    tokens = list(text) if re.search(r'[\u4e00-\u9fff]', text) else text.split(' ')
    for tk in tokens:
        cand = line + tk if re.search(r'[\u4e00-\u9fff]', text) else (line + ' ' + tk if line else tk)
        if draw.textlength(cand, font=fnt) <= max_w:
            line = cand
        else:
            if line:
                lines.append(line)
            line = tk if re.search(r'[\u4e00-\u9fff]', text) else tk
    if line:
        lines.append(line)
    return lines


def para(draw, xy, text, fnt, max_w, fill=INK, leading=1.55, limit=None):
    x, y = xy
    lines = wrap(draw, text, fnt, max_w)
    if limit:
        lines = lines[:limit]
    step = int(fnt.size * leading)
    for ln in lines:
        draw.text((x, y), ln, font=fnt, fill=fill)
        y += step
    return y


def rrect(draw, box, r, fill=None, outline=None, width=2):
    x0, y0, x1, y1 = box
    if x1 <= x0 or y1 <= y0:
        return
    draw.rounded_rectangle((x0, y0, x1, y1), radius=r, fill=fill, outline=outline, width=width)


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    sw, sh = im.size
    scale = max(w / sw, h / sh)
    im = im.resize((max(1, int(sw * scale)), max(1, int(sh * scale))), Image.LANCZOS)
    sw, sh = im.size
    left, top = (sw - w) // 2, (sh - h) // 2
    return im.crop((left, top, left + w, top + h))


def contain(path, w, h, bg=WHITE):
    """完整放入框內（不裁切），用於圖示集。"""
    im = Image.open(path).convert('RGB')
    sw, sh = im.size
    scale = min(w / sw, h / sh)
    im = im.resize((max(1, int(sw * scale)), max(1, int(sh * scale))), Image.LANCZOS)
    canvas = Image.new('RGB', (w, h), bg)
    canvas.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
    return canvas


def placeholder(draw, box, label):
    rrect(draw, box, 14, fill=(246, 243, 234), outline=GREY, width=2)
    x0, y0, x1, y1 = box
    f = font(20, 'regular')
    lines = wrap(draw, label, f, x1 - x0 - 40)
    ty = (y0 + y1) // 2 - len(lines) * 15
    for ln in lines:
        w = draw.textlength(ln, font=f)
        draw.text(((x0 + x1 - w) / 2, ty), ln, font=f, fill=GREY)
        ty += 30


def section_head(draw, x, y, text, w=None, size=21, max_x=None):
    """綠底圓圈圖示 + 標題（參考圖的綠色 ○ 標題條）"""
    f = font(size, 'black')
    r = 13
    draw.ellipse((x, y + 3, x + 2 * r, y + 3 + 2 * r), fill=(18, 122, 82))
    draw.ellipse((x + 7, y + 10, x + 2 * r - 7, y + 10 + 2 * r - 14), fill=WHITE)
    draw.text((x + 2 * r + 10, y), text, font=f, fill=(18, 122, 82))


def text_h(draw, text, fnt, max_w, leading=1.55, limit=None):
    lines = wrap(draw, text, fnt, max_w)
    if limit:
        lines = lines[:limit]
    return len(lines) * int(fnt.size * leading)


def fit_text(draw, text, max_w, max_h, start=19, down=12, leading=1.5, limit_lines=None):
    """由大到細試字級，令文字塞得入格（唔會爆格、唔會切走字）。"""
    size = start
    while size > down:
        f = font(size, 'regular')
        h = text_h(draw, text, f, max_w, leading, limit_lines)
        if h <= max_h:
            return f, size
        size -= 1
    return font(down, 'regular'), down


def render(bird_id, out_path):
    b = BY_ID.get(bird_id, {})
    t = TAX.get(bird_id, {})
    c = COPY.get(bird_id, {})
    order_zh = t.get('orderZh') or TAXZH['orders'].get(t.get('order', ''), '')
    family_zh = t.get('familyZh') or TAXZH['families'].get(t.get('family', ''), '')
    zh_name = b.get('name', '')
    en_name = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')

    demo_callouts = os.path.join(ART, f'{bird_id}-callouts.json')
    callouts = c.get('callouts')
    if not callouts and os.path.exists(demo_callouts):
        with open(demo_callouts, encoding='utf-8') as f:
            callouts = json.load(f).get('callouts')

    img = Image.new('RGB', (W, H), WHITE)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, H), fill=(246, 249, 253))
    for gx in range(0, W, 34):
        d.line((gx, 0, gx, H), fill=(238, 243, 250))
    for gy in range(0, H, 34):
        d.line((0, gy, W, gy), fill=(238, 243, 250))

    M = 30
    top = 24
    FOOT_H = 56
    footer_y = H - FOOT_H
    GAP = 14

    # ---------- 垂直預算（先由底部排上去，保證唔會爆格）----------
    ROW1_H, ROW2_H, SCORE_H = 236, 200, 88
    score_y = footer_y - 12 - SCORE_H
    row2_y = score_y - GAP - ROW2_H
    row1_y = row2_y - GAP - ROW1_H

    # ---------- ① 標題橫幅 ----------
    banner_h = 112
    rrect(d, (M, top, W - M, top + banner_h), 22, fill=NAVY)
    cx, cy, r = M + 56, top + banner_h // 2, 36
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE)
    d.rectangle((cx - r, cy - 6, cx + r, cy + 6), fill=NAVY)
    d.ellipse((cx - 13, cy - 13, cx + 13, cy + 13), fill=WHITE, outline=NAVY, width=5)
    d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=NAVY)
    d.text((M + 106, top + 26), f'NO.{bird_id}', font=font(40, 'black'), fill=YELLOW)

    py = top + 14
    for zh, latin in [(order_zh, t.get('order', '')), (family_zh, t.get('family', ''))]:
        label = f'{zh} {latin}'.strip()
        f = font(17, 'bold')
        pw = int(d.textlength(label, font=f)) + 46
        box = (W - M - 16 - pw, py, W - M - 16, py + 30)
        rrect(d, box, 15, fill=(238, 245, 252), outline=(196, 212, 232), width=1)
        d.ellipse((box[0] + 7, py + 7, box[0] + 23, py + 23), fill=(226, 238, 230))
        d.text((box[0] + 30, py + 5), label, font=f, fill=NAVY)
        py += 36

    # ---------- ② 名稱區 ----------
    ny = top + banner_h + 16
    fname = fit_text(d, zh_name, 500, 86, start=82, down=46, limit_lines=1)[0]
    d.text((M + 4, ny), zh_name, font=fname, fill=INK)
    sub_y = ny + int(fname.size * 1.18)
    fsub = font(22, 'regular')
    d.text((M + 6, sub_y + 4), sci, font=fsub, fill=(90, 98, 110))
    pw = d.textlength(en_name, font=font(18, 'bold')) + 24
    sx = M + 6 + d.textlength(sci, font=fsub) + 14
    rrect(d, (sx, sub_y, sx + pw, sub_y + 32), 16, fill=NAVY)
    d.text((sx + 12, sub_y + 4), en_name, font=font(18, 'bold'), fill=WHITE)

    # 右上三個灰底資料框（身長／體重／常見度）
    bx0, bx1 = W - M - 268, W - M - 4
    ry = ny + 2
    for k, v in [('身長', c.get('length')), ('體重', c.get('weight'))]:
        rrect(d, (bx0, ry, bx1, ry + 38), 11, fill=WHITE, outline=(224, 230, 238), width=1)
        d.text((bx0 + 12, ry + 8), k, font=font(16, 'bold'), fill=(90, 98, 110))
        val = v if v else '待補'
        dv = font(18, 'bold')
        d.text((bx1 - 12 - d.textlength(val, font=dv), ry + 7), val, font=dv,
               fill=INK if v else GREY)
        ry += 42
    rrect(d, (bx0, ry, bx1, ry + 38), 11, fill=WHITE, outline=(224, 230, 238), width=1)
    d.text((bx0 + 12, ry + 8), '常見度', font=font(16, 'bold'), fill=(90, 98, 110))
    common = int(c.get('commonness') or 3)
    for i in range(5):
        ccx = bx1 - 22 - (4 - i) * 21
        d.ellipse((ccx - 8, ry + 11, ccx + 8, ry + 27),
                  fill=BLUE if i < common else WHITE, outline=BLUE, width=2)

    content_top = max(sub_y + 46, ry + 44) + 12

    # ---------- ③ 左欄 ----------
    col_w = 284
    lx = M
    # 左欄總高度 = 主圖高度；像素圖會自動縮細，保證「分類資訊」七行全部出得齊
    main_h = row1_y - GAP - content_top
    intro = c.get('intro_zh') or build_intro(c, zh_name)
    tax_rows = [
        ('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'),
        ('目', f'{order_zh} {t.get("order", "")}'.strip()),
        ('科', f'{family_zh} {t.get("family", "")}'.strip()),
        ('屬', sci.split(' ')[0] if sci else '—'),
        ('種', f'{zh_name} {short_sci(sci)}'.strip()),
    ]
    tax_h = 46 + len(tax_rows) * 29
    sprite_h = max(120, min(col_w, main_h - tax_h - 92 - 3 * GAP))
    sprite_box = (lx, content_top, lx + col_w, content_top + sprite_h)
    rrect(d, sprite_box, 16, fill=WHITE, outline=(224, 230, 238), width=2)
    sp = os.path.join(ART, f'{bird_id}-sprite.png')
    if os.path.exists(sp):
        img.paste(cover(sp, col_w - 14, sprite_h - 14), (lx + 7, content_top + 7))
    else:
        placeholder(d, (lx + 7, content_top + 7, lx + col_w - 7, content_top + sprite_h - 7), '像素圖')

    intro_y = content_top + sprite_h + GAP
    intro_h = max(84, row1_y - GAP - intro_y - GAP - tax_h)
    rrect(d, (lx, intro_y, lx + col_w, intro_y + intro_h), 16, fill=WHITE, outline=(224, 230, 238), width=2)
    section_head(d, lx + 12, intro_y + 10, '基本介紹')
    fi, _ = fit_text(d, intro, col_w - 32, intro_h - 58, start=17, down=12, leading=1.55)
    para(d, (lx + 15, intro_y + 46), intro, fi, col_w - 32, leading=1.55)

    ty = intro_y + intro_h + GAP
    rrect(d, (lx, ty, lx + col_w, ty + tax_h), 16, fill=WHITE, outline=(224, 230, 238), width=2)
    section_head(d, lx + 12, ty + 10, '分類資訊')
    ry2 = ty + 46
    for k, v in tax_rows:
        d.text((lx + 15, ry2), f'{k}：', font=font(15, 'bold'), fill=BLUE)
        d.text((lx + 46, ry2 + 1), v, font=font(14, 'regular'), fill=INK)
        ry2 += 31

    # ---------- ④ 主圖 ----------
    mx = lx + col_w + GAP
    mw = W - M - mx
    strip = 226 if callouts else 0            # 右邊留給特徵文字（同參考圖一樣）
    pw_photo = mw - strip
    main_box = (mx, content_top, mx + pw_photo, content_top + main_h)
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    if os.path.exists(photo):
        img.paste(cover(photo, pw_photo, main_h), (mx, content_top))
        rrect(d, main_box, 16, outline=(224, 230, 238), width=3)
    else:
        placeholder(d, main_box, f'真雀相：{en_name}（Macaulay Library）')
    if callouts:
        draw_insets(d, img, mx, content_top, pw_photo, main_h, callouts, bird_id, strip)

    # ---------- ⑤ 四格 ----------
    gap = 12
    cw = (W - 2 * M - 3 * gap) / 4
    cells = [('分佈地區', c.get('range'), 'map'), ('棲息環境', c.get('habitat'), 'habitat'),
             ('食物', c.get('diet'), 'diet'), ('Top 5 特色亮點', c.get('highlights'), 'top5')]
    for i, (title, val, kind) in enumerate(cells):
        x0 = M + i * (cw + gap)
        rrect(d, (x0, row1_y, x0 + cw, row1_y + ROW1_H), 14, fill=WHITE, outline=(224, 230, 238), width=2)
        section_head(d, x0 + 10, row1_y + 10, title, size=18)
        if kind == 'map':
            mp = os.path.join(ART, f'{bird_id}-map.png')
            if os.path.exists(mp):
                img.paste(cover(mp, int(cw) - 18, 84), (int(x0) + 9, row1_y + 42))
                rrect(d, (x0 + 9, row1_y + 42, x0 + cw - 9, row1_y + 126), 6, outline=(224, 230, 238), width=2)
            else:
                placeholder(d, (x0 + 9, row1_y + 42, x0 + cw - 9, row1_y + 126), '分佈地圖')
            if val:
                f, _ = fit_text(d, val, cw - 24, ROW1_H - 140, start=14, down=11, leading=1.45)
                para(d, (x0 + 11, row1_y + 134), val, f, cw - 24, leading=1.45)
        elif kind == 'top5':
            items = c.get('highlights') or []
            yy = row1_y + 40
            for n, it in enumerate(items[:5], 1):
                d.ellipse((x0 + 10, yy + 1, x0 + 28, yy + 19), fill=BLUE)
                d.text((x0 + 19 - d.textlength(str(n), font=font(12, 'bold')) / 2, yy + 2), str(n),
                       font=font(12, 'bold'), fill=WHITE)
                f = font(13, 'regular')
                for j, ln in enumerate(wrap(d, clean_sentence(it), f, cw - 42)[:2]):
                    d.text((x0 + 34, yy + j * 18), ln, font=f, fill=INK)
                yy += 40
        else:
            pic = os.path.join(ART, f'{bird_id}-{kind}.png')
            ty0 = row1_y + 40
            if os.path.exists(pic):
                pic_h = 96 if kind == 'diet' else 68
                img.paste(contain(pic, int(cw) - 18, pic_h), (int(x0) + 9, ty0))
                ty0 += pic_h + 6
            if val:
                f, _ = fit_text(d, val, cw - 24, row1_y + ROW1_H - ty0 - 8, start=15, down=11, leading=1.5)
                para(d, (x0 + 12, ty0), val, f, cw - 24, leading=1.5)
            elif not os.path.exists(pic):
                d.text((x0 + 12, ty0 + 6), '資料待查', font=font(14, 'regular'), fill=GREY)

    # ---------- ⑥ 下半四格 ----------
    cells2 = [('成長與繁殖', c.get('breeding')), ('行為特徵', c.get('behavior')),
              ('有趣小知識', c.get('funFact')), ('注意事項', c.get('caution'))]
    for i, (title, val) in enumerate(cells2):
        x0 = M + i * (cw + gap)
        rrect(d, (x0, row2_y, x0 + cw, row2_y + ROW2_H), 14, fill=WHITE, outline=(224, 230, 238), width=2)
        section_head(d, x0 + 10, row2_y + 10, title, size=18)
        if isinstance(val, list):
            yy = row2_y + 42
            for it in val[:4]:
                f, _ = fit_text(d, clean_sentence(it), cw - 30, 56, start=14, down=11, leading=1.4)
                y2 = para(d, (x0 + 12, yy), '• ' + clean_sentence(it), f, cw - 30, leading=1.4, limit=2)
                yy = y2 + 4
        elif val:
            f, _ = fit_text(d, val, cw - 24, ROW2_H - 56, start=15, down=11, leading=1.5)
            para(d, (x0 + 12, row2_y + 42), val, f, cw - 24, leading=1.5)
        else:
            d.text((x0 + 12, row2_y + 46), '資料待查', font=font(14, 'regular'), fill=GREY)

    # ---------- ⑦ 評分卡 ----------
    rrect(d, (M, score_y, W - M, score_y + SCORE_H), 14, fill=WHITE, outline=(224, 230, 238), width=2)
    section_head(d, M + 12, score_y + 10, '生態價值評分卡', size=18)
    sc = c.get('scores') or {}
    keys = list(sc.keys())[:5] if sc else ['生態重要性', '適應力', '觀賞價值', '研究價值', '保育關注度']
    sw2 = (W - 2 * M - 220) / 5
    for i, k in enumerate(keys):
        x0 = M + 14 + i * sw2
        d.text((x0, score_y + 40), k, font=font(14, 'bold'), fill=BLUE)
        v = sc.get(k)
        if v:
            draw_stars(d, x0, score_y + 60, float(v))
            d.text((x0 + 118, score_y + 60), f'{v}/5', font=font(13, 'bold'), fill=INK)
        else:
            d.text((x0, score_y + 60), '編者評分 · 待定', font=font(12, 'regular'), fill=GREY)
    ox = W - M - 196
    d.text((ox, score_y + 38), '綜合評分', font=font(14, 'bold'), fill=NAVY)
    avg = (sum(float(v) for v in sc.values()) / len(sc)) if sc else None
    d.text((ox, score_y + 54), f'{avg:.1f}/5' if avg else '—', font=font(30, 'black'), fill=NAVY)

    # ---------- ⑧ 底欄 ----------
    d.rectangle((0, footer_y, W, H), fill=NAVY)
    d.text((M, footer_y + 16), f'圖鑑編號 NO.{bird_id}', font=font(17, 'bold'), fill=WHITE)
    nm = f'名稱：{zh_name}（{sci}）'
    d.text((W / 2 - d.textlength(nm, font=font(16, 'bold')) / 2, footer_y + 17), nm,
           font=font(16, 'bold'), fill=WHITE)
    ver = 'v1.9 · 試作'
    d.text((W - M - d.textlength(ver, font=font(15, 'bold')) - 4, footer_y + 18), ver,
           font=font(15, 'bold'), fill=YELLOW)

    os.makedirs(OUT_DIR, exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size)


def short_sci(sci):
    """'Acridotheres cristatellus' → 'A. cristatellus'（種名不變，只縮屬名）。"""
    parts = [p for p in sci.split(' ') if p]
    if not parts:
        return ''
    if len(parts) == 1:
        return parts[0]
    return parts[0][0] + '. ' + ' '.join(parts[1:])


def clean_sentence(s):
    """卡面只放完整句：去掉結尾半句（原文經常因為截斷而冇尾）。"""
    s = str(s or '').strip().rstrip('，,、；;')
    if s and s[-1] not in '。！？.!?）)」】':
        cut = max(s.rfind('。'), s.rfind('，'), s.rfind('；'))
        if cut > 12:
            s = s[:cut]
    return s.strip()


def build_intro(c, name):
    bits = []
    for key in ('look', 'habitat'):
        v = clean_sentence(c.get(key) or '')
        if v:
            bits.append(v.rstrip('。'))
    return ('。'.join(bits) + '。') if bits else '（資料待查）' 


def draw_insets(d, img, mx, my, photo_w, mh, callouts, bird_id, strip):
    """特徵圓圖騎在相片右邊緣，文字放在右邊欄，引線指回相片上的位置（同參考圖一樣）。"""
    rad = 42
    n = min(len(callouts), 4)
    cx = mx + photo_w - 4
    tx = mx + photo_w + 52
    tw = strip - 58
    for i in range(n):
        item = callouts[i]
        if isinstance(item, dict):
            lab, txt = item.get('label', ''), item.get('text', '')
            key = item.get('inset') or ['crest', 'eye', 'wing', 'feet'][i]
            anchor = item.get('anchor') or [0.5, 0.3 + 0.16 * i]
        else:
            lab, txt, key = '', str(item), ['crest', 'eye', 'wing', 'feet'][i]
            anchor = [0.5, 0.3 + 0.16 * i]

        cy = my + 74 + i * ((mh - 100) / max(1, n))
        path = os.path.join(ART, f'{bird_id}-inset-{key}.jpg')
        if os.path.exists(path):
            im = cover(path, rad * 2, rad * 2)
            mask = Image.new('L', (rad * 2, rad * 2), 0)
            ImageDraw.Draw(mask).ellipse((0, 0, rad * 2 - 1, rad * 2 - 1), fill=255)
            img.paste(im, (int(cx - rad), int(cy - rad)), mask)
        d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), outline=WHITE, width=5)
        d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), outline=(60, 110, 170), width=2)

        # 引線：圓心左邊 → 相片上的 anchor
        ax = mx + photo_w * float(anchor[0])
        ay = my + mh * float(anchor[1])
        d.line((cx - rad, cy, ax, ay), fill=(40, 90, 160), width=2)
        d.ellipse((ax - 5, ay - 5, ax + 5, ay + 5), fill=YELLOW, outline=NAVY, width=2)

        f1, f2 = font(15, 'black'), font(13, 'regular')
        lines = wrap(d, txt, f2, tw)
        d.text((tx, cy - 30), lab, font=f1, fill=NAVY)
        for j, ln in enumerate(lines[:4]):
            d.text((tx, cy - 8 + j * 18), ln, font=f2, fill=(40, 46, 56))


def draw_stars(d, x, y, v):
    full = int(v)
    half = (v - full) >= 0.5
    for i in range(5):
        col = YELLOW if i < full else ((200, 200, 200) if (i == full and not half) or (i > full) else YELLOW)
        cx = x + i * 22
        d.ellipse((cx, y, cx + 16, y + 16), fill=col)


if __name__ == '__main__':
    bid = sys.argv[1] if len(sys.argv) > 1 else '0013'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(OUT_DIR, f'aviandex-card-{bid}.png')
    render(bid, out)
