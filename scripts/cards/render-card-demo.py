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

# 色票（暖紙 + 墨 + 金）：唔用漸層、唔用彩色光暈
PAPER = (247, 244, 236)      # 紙白
PAPER_D = (238, 233, 221)    # 紙陰影／表格底
INK = (33, 30, 26)           # 主墨
INK_2 = (88, 82, 74)         # 次墨
RULE = (207, 199, 184)       # 髮線
GOLD = (166, 124, 45)        # 金（品牌重點，只用細面積）
GOLD_L = (214, 185, 128)
DEEP = (24, 38, 62)          # 深墨藍（橫幅）
GREEN = (46, 92, 70)         # 深綠（分區標題）
RED = (150, 52, 42)

# 舊名保留，避免其他函式未改到
NAVY = DEEP
BLUE = GREEN
BLUE_L = PAPER_D
YELLOW = GOLD
GREY = INK_2
GREY_L = RULE
WHITE = PAPER

SERIF = {
    'black': 'NotoSerifTC_900Black.ttf',
    'bold': 'NotoSerifTC_600SemiBold.ttf',
    'regular': 'NotoSerifTC_400Regular.ttf',
}
SANS = {
    'black': 'NotoSansTC_900Black.ttf',
    'bold': 'NotoSansTC_700Bold.ttf',
    'regular': 'NotoSansTC_400Regular.ttf',
}


def font(size, weight='bold', serif=False):
    """中文標題用襯線（書感），內文用黑體（易讀）。同一個卡面只用兩族字。"""
    name = (SERIF if serif else SANS)[weight]
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


def section_head(draw, x, y, text, w=None, size=19, max_x=None):
    """欄目標題：細號襯線大寫感 + 金色小線。唔用圓圈圖示、唔用 emoji。"""
    f = font(size, 'bold', serif=True)
    draw.rectangle((x, y + 4, x + 4, y + 4 + size), fill=GOLD)
    draw.text((x + 12, y), text, font=f, fill=INK)
    return x + 12 + draw.textlength(text, font=f)


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
    """編輯型版面：紙底、髮線分欄、襯線標題、金色細重點；不用漸層／光暈／彩色卡片陣。"""
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

    img = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(img)
    M = 56
    top = 44
    FOOT_H = 54
    footer_y = H - FOOT_H
    GAP = 22

    # ---------- ① 頁眉：編號 + 一行分類（無大橫幅、無球標）----------
    f_no = font(24, 'bold')
    d.text((M, top), f'NO.{bird_id}', font=f_no, fill=GOLD)
    meta = ' · '.join([x for x in [order_zh, t.get('order', ''), family_zh, t.get('family', '')] if x])
    fr = font(17, 'regular')
    d.text((M + d.textlength(f'NO.{bird_id}', font=f_no) + 16, top + 5), meta, font=fr, fill=INK_2)
    d.line((M, top + 34, W - M, top + 34), fill=RULE, width=1)

    # ---------- ② 名稱（襯線大字，靠左；右邊三個小資料）----------
    ny = top + 52
    fname = fit_text(d, zh_name, 560, 96, start=92, down=48, limit_lines=1)[0]
    # fit_text 用黑體試位，這裡正式用襯線重畫
    fserif = font(fname.size - 4, 'black', serif=True)
    while d.textlength(zh_name, font=fserif) > 560 and fserif.size > 44:
        fserif = font(fserif.size - 2, 'black', serif=True)
    d.text((M - 2, ny - 6), zh_name, font=fserif, fill=INK)

    sub_y = ny + int(fserif.size * 1.16)
    fsci = font(19, 'regular', serif=True)
    d.text((M, sub_y), sci, font=fsci, fill=INK_2)
    f_en = font(16, 'bold')
    sx = M + d.textlength(sci, font=fsci) + 14
    d.text((sx, sub_y + 3), f'／ {en_name}', font=f_en, fill=GOLD)

    # 右：身長／體重／常見度（只靠髮線分隔，不做圓角卡）
    rx = W - M
    rows = [('身長', c.get('length')), ('體重', c.get('weight'))]
    ry = ny + 4
    for k, v in rows:
        d.text((rx - 250, ry), k, font=font(15, 'regular'), fill=INK_2)
        val = v or '待補'
        fv = font(17, 'bold')
        d.text((rx - d.textlength(val, font=fv), ry - 1), val, font=fv, fill=INK if v else INK_2)
        d.line((rx - 250, ry + 26, rx, ry + 26), fill=RULE, width=1)
        ry += 34
    d.text((rx - 250, ry), '常見度', font=font(15, 'regular'), fill=INK_2)
    common = int(c.get('commonness') or 3)
    for i in range(5):
        ccx = rx - 8 - (4 - i) * 16
        filled = i < common
        d.ellipse((ccx - 5, ry + 6, ccx + 5, ry + 16),
                  fill=GOLD if filled else PAPER, outline=GOLD if filled else RULE, width=1)

    content_top = max(sub_y + 52, ry + 34) + 16

    # ---------- ③ 主圖（大圖，靠右；左邊文字欄）----------
    text_w = 268
    mx = M + text_w + 26
    photo_w = W - M - mx
    # 主圖高度：留夠下面三欄
    body_bottom = footer_y - 16
    main_h = int((body_bottom - content_top) * 0.58)
    col_y = content_top + main_h + 26        # 四欄內文起點（左欄要用來做預算）

    tax_rows = [
        ('界', '動物界 Animalia'), ('門', '脊索動物門 Chordata'), ('綱', '鳥綱 Aves'),
        ('目', f'{order_zh} {t.get("order", "")}'.strip()),
        ('科', f'{family_zh} {t.get("family", "")}'.strip()),
        ('屬', sci.split(' ')[0] if sci else '—'),
        ('種', f'{zh_name} {short_sci(sci)}'.strip()),
    ]
    tail_tax = 34 + len(tax_rows) * 25
    legend_h = (len(callouts or []) * 38 + 8) if callouts else 0
    avail = col_y - content_top - 8
    sprite_h = max(104, min(236, avail - tail_tax - legend_h - 30 - 92))
    sp = os.path.join(ART, f'{bird_id}-sprite.png')
    rrect(d, (M, content_top, M + text_w, content_top + sprite_h), 4, fill=PAPER_D)
    if os.path.exists(sp):
        img.paste(contain(sp, text_w - 16, sprite_h - 16, PAPER_D), (M + 8, content_top + 8))
    else:
        placeholder(d, (M + 8, content_top + 8, M + text_w - 8, content_top + sprite_h - 8), '像素圖')
    d.text((M, content_top + sprite_h + 6), ('像素圖 · 16-bit' if os.path.exists(sp) else ''),
           font=font(12, 'regular'), fill=INK_2)

    # 特徵圖例（相片上的 1–4 號圓點對應這裡）
    legend_y = content_top + sprite_h + 30
    if callouts:
        for i, item in enumerate(callouts[:4], 1):
            lab = item.get('label', '') if isinstance(item, dict) else str(item)
            txt = item.get('text', '') if isinstance(item, dict) else ''
            d.ellipse((M, legend_y + 1, M + 18, legend_y + 19), outline=GOLD, width=1)
            num = str(i)
            d.text((M + 9 - d.textlength(num, font=font(11, 'bold')) / 2, legend_y + 3), num,
                   font=font(11, 'bold'), fill=GOLD)
            d.text((M + 26, legend_y - 2), lab, font=font(13, 'bold'), fill=INK)
            d.text((M + 26, legend_y + 16), txt, font=font(11, 'regular'), fill=INK_2)
            legend_y += 38

    intro_y = legend_y + 6
    section_head(d, M, intro_y, '基本介紹')
    intro = c.get('intro_zh') or build_intro(c, zh_name)
    intro_avail = col_y - tail_tax - 12 - (intro_y + 28)
    fi, _ = fit_text(d, intro, text_w, max(38, intro_avail), start=15, down=10, leading=1.7)
    para(d, (M, intro_y + 28), intro, fi, text_w, leading=1.7, fill=INK)

    # 左欄：分類（無框，只靠髮線）
    tax_y = intro_y + 28 + text_h(d, intro, fi, text_w, 1.7) + 16
    section_head(d, M, tax_y, '分類資訊')
    ty = tax_y + 32
    for k, v in tax_rows:
        d.text((M, ty), k, font=font(13, 'bold'), fill=GOLD)
        d.text((M + 26, ty - 1), v, font=font(13, 'regular'), fill=INK)
        d.line((M, ty + 21, M + text_w, ty + 21), fill=(226, 220, 208), width=1)
        ty += 25

    # 主圖
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    main_box = (mx, content_top, mx + photo_w, content_top + main_h)
    if os.path.exists(photo):
        img.paste(cover(photo, photo_w, main_h), (mx, content_top))
    else:
        placeholder(d, main_box, f'真雀相：{en_name}')
    # 幼細描邊（不用彩色外框）
    d.rectangle(main_box, outline=RULE, width=1)
    if callouts:
        draw_dots(d, mx, content_top, photo_w, main_h, callouts)

    # ---------- ④ 四欄內文（髮線分欄，無卡片邊框）----------
    col_h = body_bottom - col_y - 6
    cols = [
        ('分佈與棲息', [c.get('range'), c.get('habitat'), c.get('migration')]),
        ('食物與覓食', [c.get('diet'), c.get('behavior')]),
        ('繁殖與保育', [c.get('breeding'), c.get('conservation')]),
        ('辨識與冷知識', (c.get('highlights') or [])[:3] + [c.get('look'), c.get('etymology'), c.get('funFact')]),
    ]
    cw = (W - 2 * M - 3 * GAP) / 4
    for i, (title, parts) in enumerate(cols):
        x0 = M + i * (cw + GAP)
        section_head(d, x0, col_y, title, size=17)
        yy = col_y + 30
        for part in parts:
            if not part:
                continue
            if isinstance(part, list):
                for it in part:
                    f, _ = fit_text(d, clean_sentence(it), cw - 14, 60, start=13, down=11, leading=1.7)
                    y2 = para(d, (x0, yy), '· ' + clean_sentence(it), f, cw - 14, leading=1.7, limit=3)
                    yy = y2 + 2
                    if yy > col_y + col_h:
                        break
            else:
                f, _ = fit_text(d, part, cw - 14, col_h - (yy - col_y), start=14, down=11, leading=1.75)
                yy = para(d, (x0, yy), part, f, cw - 14, leading=1.75) + 8
            if yy > col_y + col_h:
                break
        # 分欄髮線
        if i < 3:
            d.line((x0 + cw + GAP / 2, col_y, x0 + cw + GAP / 2, col_y + col_h), fill=(226, 220, 208), width=1)

    # ---------- ⑤ 頁腳：資料來源。刻意不放評分卡 ----------
    d.line((M, footer_y, W - M, footer_y), fill=RULE, width=1)
    src = (c.get('source') or '').replace('｜', ' · ')
    fs = font(12, 'regular')
    if d.textlength(src, font=fs) > W - 2 * M - 260:
        while d.textlength(src, font=fs) > W - 2 * M - 260 and len(src) > 40:
            src = src[:-6]
        src += '…'
    d.text((M, footer_y + 14), f'資料來源：{src}', font=fs, fill=INK_2)
    foot_r = f'v1.9 · 校對稿'
    d.text((W - M - d.textlength(foot_r, font=font(13, 'bold')), footer_y + 12), foot_r,
           font=font(13, 'bold'), fill=GOLD)
    # 頁碼感：左邊小金字編號
    d.text((M, footer_y + 32), f'AVIANDEX · {bird_id}', font=font(13, 'regular'), fill=INK_2)

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


def draw_dots(d, mx, my, photo_w, mh, callouts):
    """相片上只畫編號圓點（金色細圈），文字在左欄做圖例，唔會壓住主體。"""
    for i, item in enumerate(callouts[:4], 1):
        anchor = item.get('anchor') if isinstance(item, dict) else None
        anchor = anchor or [0.5, 0.3 + 0.16 * i]
        ax = mx + photo_w * float(anchor[0])
        ay = my + mh * float(anchor[1])
        d.ellipse((ax - 13, ay - 13, ax + 13, ay + 13), fill=PAPER, outline=GOLD, width=2)
        num = str(i)
        d.text((ax - d.textlength(num, font=font(13, 'bold')) / 2, ay - 9), num,
               font=font(13, 'bold'), fill=GOLD)
        # 細引線指去實際位置
        d.line((ax + 14, ay, ax + 46, ay), fill=GOLD_L, width=1)
        d.ellipse((ax + 44, ay - 2, ax + 48, ay + 2), fill=GOLD)


def draw_stars(d, x, y, v):
    full = int(v)
    half = (v - full) >= 0.5
    for i in range(5):
        col = GOLD if i < full else RULE
        cx = x + i * 22
        d.ellipse((cx, y, cx + 16, y + 16), fill=col)


if __name__ == '__main__':
    bid = sys.argv[1] if len(sys.argv) > 1 else '0013'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(OUT_DIR, f'aviandex-card-{bid}.png')
    render(bid, out)
