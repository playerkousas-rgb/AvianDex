#!/usr/bin/env python3
# ============================================================
#  AvianDex — 卡面「童趣版」（Kid Card）
# ------------------------------------------------------------
#  為甚麼要另一支腳本？
#    上一版 v2 是「編輯型」：髮線、襯線、四欄文字 —— 適合大人閱讀，
#    但對小朋友來說就係一本文字說明書，冇吸引力。
#    這一版改成「圖鑑機卡」的語感：
#      · 相片佔最大面積（小朋友先睇圖）
#      · 名字用超粗黑體，一眼認到
#      · 像素小鳥做吉祥物，站在相片角落
#      · 數字用大圓點／大方塊顯示（身長、體重、常見度）
#      · 每段文字最多一至兩行，講重點
#      · 一個「今日小任務」：叫小朋友去聽一次牠的叫聲
#
#  設計紀律（沿用 readme 的 design-review 規則）：
#    無漸層、無 glow、無裝飾陰影、無 01/02/03 編號、無 icon-topped 卡片陣；
#    實色塊、細邊界、只用兩個字族、三個主色。
#
#  用法：python3 scripts/cards/render-card-kid.py 0013
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
M = 44  # 左右邊距相等

# --- 色票：三個主色 + 紙白 + 墨（全部實色，無漸層）---
CREAM = (253, 246, 227)
INK = (32, 30, 26)
INK_SOFT = (108, 100, 88)
GREEN = (20, 83, 45)       # 森林綠（主色）
GREEN_L = (214, 232, 213)  # 淺綠底（資訊塊）
CORAL = (214, 92, 71)      # 珊瑚紅（重點／叫聲）
BLUE = (38, 96, 158)       # 天空藍（水／地圖）
YELLOW = (240, 176, 32)    # 太陽黃（學名、星）
WHITE = (255, 255, 255)

SANS = {
    'black': 'NotoSansTC_900Black.ttf',
    'bold': 'NotoSansTC_700Bold.ttf',
    'regular': 'NotoSansTC_400Regular.ttf',
}


def font(size, weight='bold'):
    return ImageFont.truetype(os.path.join(FONT_DIR, SANS[weight]), size)


def text(d, xy, s, f, fill):
    d.text(xy, s, font=f, fill=fill)


def tw(d, s, f):
    return d.textlength(s, font=f)


def wrap(d, s, f, maxw):
    lines, cur = [], ''
    for ch in s:
        if d.textlength(cur + ch, font=f) <= maxw:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def fit_lines(d, s, maxw, max_lines, start, down, weight='regular', leading=1.6):
    """自動縮字，確保唔會頂出界"""
    size = start
    while size > down:
        f = font(size, weight)
        lines = wrap(d, s, f, maxw)
        if len(lines) <= max_lines:
            return f, lines
        size -= 1
    return font(down, weight), wrap(d, s, font(down, weight), maxw)[:max_lines]


def cover(path, w, h):
    im = Image.open(path).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    x = (im.width - w) // 2
    y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def contain(path, w, h, bg):
    im = Image.open(path).convert('RGBA')
    r = min(w / im.width, h / im.height) * 0.92
    im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))), Image.LANCZOS)
    canvas = Image.new('RGBA', (w, h), bg + (255,))
    canvas.paste(im, ((w - im.width) // 2, (h - im.height) // 2), im)
    return canvas.convert('RGB')


def rrect(d, box, r, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = box
    if x1 <= x0 or y1 <= y0:
        return
    d.rounded_rectangle((x0, y0, x1, y1), radius=r, fill=fill, outline=outline, width=width)


def load_json(rel):
    with open(os.path.join(DATA, rel), encoding='utf-8') as f:
        return json.load(f)


def clean(s, limit=None):
    """截短到一個完整句子；截唔到就加省略號，唔會留住「，」。"""
    s = (s or '').replace('\n', ' ').strip()
    if not limit or len(s) <= limit:
        return s
    cut = s[:limit]
    for sep in ('。', '；'):
        i = cut.rfind(sep)
        if i > limit * 0.5:
            return cut[:i + 1]
    for sep in ('，', '、', ' '):
        i = cut.rfind(sep)
        if i > limit * 0.5:
            cut = cut[:i]
            break
    return cut.rstrip('，、；：') + '…'


def short_sci(sci):
    parts = (sci or '').split()
    return f'{parts[0][0]}. {parts[1]}' if len(parts) >= 2 else (sci or '')



def similar_birds(bird_id, birds, tax, limit=3):
    """同科鄰居：只用既有 taxonomy／名稱，不憑印象加。"""
    me = tax.get(bird_id, {})
    fam = me.get('family')
    if not fam:
        return []
    palettes = [((214, 232, 213), (20, 83, 45)), ((253, 230, 190), (122, 74, 12)), ((214, 226, 240), (30, 64, 110))]
    names = {b['id']: b.get('name', '') for b in birds}
    out = []
    for x in birds:
        if x['id'] == bird_id:
            continue
        tx = tax.get(x['id'], {})
        if tx.get('family') == fam:
            out.append((x['id'], names.get(x['id']) or tx.get('comName') or '', palettes[len(out) % 3]))
            if len(out) >= limit:
                break
    return out


def render(bird_id, out_path):
    birds = load_json('birds.json')
    tax = load_json('birdTaxonomy.json')  # 已是 {id: {...}}
    copy = load_json('cardCopy.json')

    b = next((x for x in birds if x['id'] == bird_id), {})
    t = tax.get(bird_id, {})
    c = copy.get(bird_id, {})

    zh = b.get('name', '')
    en = t.get('comName') or b.get('en', '')
    sci = t.get('sciName', '')

    callouts_path = os.path.join(ART, f'{bird_id}-callouts.json')
    callouts = c.get('callouts')
    if not callouts and os.path.exists(callouts_path):
        with open(callouts_path, encoding='utf-8') as f:
            callouts = json.load(f).get('callouts')

    img = Image.new('RGB', (W, H), CREAM)
    d = ImageDraw.Draw(img)

    # ---------- ① 頂條：編號 + 名字（一眼認到） ----------
    top_h = 132
    d.rectangle((0, 0, W, top_h), fill=GREEN)
    # 像素小鳥站在頂條左邊的奶油方格上
    sp_path = os.path.join(ART, f'{bird_id}-sprite.png')
    sprite_box = (M, 14, M + 104, top_h - 14)
    d.rounded_rectangle(sprite_box, radius=10, fill=CREAM)
    if os.path.exists(sp_path):
        img.paste(contain(sp_path, sprite_box[2] - sprite_box[0] - 8, sprite_box[3] - sprite_box[1] - 8, CREAM),
                  (sprite_box[0] + 4, sprite_box[1] + 4))

    tx = sprite_box[2] + 22
    text(d, (tx, 22), f'NO.{bird_id}', font(20, 'bold'), YELLOW)
    f_zh = font(58, 'black')
    while tw(d, zh, f_zh) > W - M - tx - 150 and f_zh.size > 34:
        f_zh = font(f_zh.size - 2, 'black')
    text(d, (tx - 2, 44), zh, f_zh, WHITE)

    # 常見度：5 個大圓點（小朋友識數）
    common = int(c.get('commonness') or 3)
    dots_y = 46
    for i in range(5):
        cx = W - M - 4 - (4 - i) * 30
        filled = i < common
        d.ellipse((cx - 11, dots_y, cx + 11, dots_y + 22), fill=YELLOW if filled else (60, 110, 78))
    text(d, (W - M - 4 - 4 * 30 - 24, dots_y + 26), '常見度', font(13, 'bold'), (185, 214, 190))

    # ---------- ② 大相：小朋友先睇嘅部分 ----------
    hero_top = top_h + 18
    hero_h = 430
    hero_box = (M, hero_top, W - M, hero_top + hero_h)
    photo = os.path.join(ART, f'{bird_id}-photo.jpg')
    if os.path.exists(photo):
        img.paste(cover(photo, hero_box[2] - hero_box[0], hero_h), (hero_box[0], hero_top))
    else:
        d.rectangle(hero_box, fill=GREEN_L)
        text(d, (M + 30, hero_top + hero_h // 2 - 20), f'相片待補：{en}', font(24, 'bold'), INK_SOFT)
    d.rectangle(hero_box, outline=GREEN, width=4)

    # 相片上一句最有趣的特徵（白字 + 深色實底條，唔用漸層）
    labels = [x.get('label', '') for x in (callouts or []) if isinstance(x, dict) and x.get('label')]
    fun = ('認住佢：' + '・'.join(labels)) if labels else clean(c.get('look') or '', 34)
    if fun:
        f_fun = font(24, 'black')
        lines = wrap(d, fun, f_fun, hero_box[2] - hero_box[0] - 40)[:2]
        bar_h = 30 + len(lines) * 32
        bar = (hero_box[0] + 14, hero_box[3] - bar_h - 14, hero_box[2] - 14, hero_box[3] - 14)
        d.rounded_rectangle(bar, radius=8, fill=(20, 48, 30))
        for i, ln in enumerate(lines):
            text(d, (bar[0] + 14, bar[1] + 12 + i * 32), ln, f_fun, WHITE)

    # 學名 + 英文名：貼在相片右上角的小牌
    f_sci = font(17, 'regular')
    plate_w = max(tw(d, sci, f_sci), tw(d, en, font(17, 'bold'))) + 26
    plate = (hero_box[2] - plate_w - 14, hero_top + 14, hero_box[2] - 14, hero_top + 82)
    d.rectangle(plate, fill=CREAM)
    text(d, (plate[0] + 12, plate[1] + 8), en, font(17, 'bold'), GREEN)
    text(d, (plate[0] + 12, plate[1] + 32), sci, f_sci, INK_SOFT)

    # 4 個特徵圓點（數字細，唔搶戲）；冇相片就唔畫
    if callouts and os.path.exists(photo):
        for i, item in enumerate(callouts[:4], 1):
            a = item.get('anchor') if isinstance(item, dict) else None
            a = a or [0.5, 0.28 + 0.17 * (i - 1)]
            ax = hero_box[0] + (hero_box[2] - hero_box[0]) * float(a[0])
            ay = hero_top + hero_h * float(a[1])
            d.ellipse((ax - 15, ay - 15, ax + 15, ay + 15), fill=WHITE, outline=CORAL, width=3)
            text(d, (ax - tw(d, str(i), font(15, 'black')) / 2, ay - 11), str(i), font(15, 'black'), CORAL)

    # ---------- ③ 三個大數字 ----------
    y = hero_top + hero_h + 16
    # 冇身長／體重時，唔好大大隻字寫「待補」掃小朋友興 —— 改用真實的食性／生境標籤
    idx = (load_json('explorerIndex.json').get('birds') or {}).get(bird_id, {})

    def tag_names(prefix, ids):
        table = {x['id']: x.get('zh', '') for x in (load_json('explorerIndex.json').get(prefix) or [])}
        return [table.get(i, '') for i in ids if table.get(i)]

    diet_names = tag_names('dietTags', idx.get('d') or [])
    hab_names = tag_names('habitatTags', idx.get('h') or [])

    stats = [
        ('身長', c.get('length') or ('、'.join(diet_names[:2]) if diet_names else '待補'),
         YELLOW, '食性'),
        ('體重', c.get('weight') or ('、'.join(hab_names[:1]) if hab_names else '待補'),
         CORAL, '生境'),
        ('在港', '常見' if common >= 3 else '少見', BLUE, '常見度'),
    ]
    gap = 12
    cw = (W - 2 * M - 2 * gap) / 3
    for i, (label, val, col, fallback_label) in enumerate(stats):
        x0 = M + i * (cw + gap)
        d.rounded_rectangle((x0, y, x0 + cw, y + 84), radius=10, fill=WHITE, outline=(226, 216, 196), width=2)
        d.rectangle((x0, y, x0 + 8, y + 84), fill=col)
        shown_label = fallback_label if (i < 2 and not (c.get('length') if i == 0 else c.get('weight'))) else label
        text(d, (x0 + 18, y + 12), shown_label, font(15, 'bold'), INK_SOFT)
        f_v = font(30, 'black')
        while tw(d, str(val), f_v) > cw - 34 and f_v.size > 16:
            f_v = font(f_v.size - 2, 'black')
        text(d, (x0 + 16, y + 34), str(val), f_v, INK)

    # ---------- ④ 食乜 / 住邊：用圖示，唔用長句 ----------
    y += 84 + 14
    blk_h = 228
    half = (W - 2 * M - 12) / 2
    blocks = [
        ('食乜？', 'diet', c.get('diet'), CREAM, GREEN),
        ('住邊？', 'habitat', c.get('habitat'), CREAM, GREEN),
    ]
    for i, (title, key, body, bg, fg) in enumerate(blocks):
        x0 = M + i * (half + 12)
        d.rounded_rectangle((x0, y, x0 + half, y + blk_h), radius=10, fill=bg, outline=GREEN, width=3)
        # 標題反白
        d.rounded_rectangle((x0, y, x0 + half, y + 40), radius=10, fill=fg)
        d.rectangle((x0, y + 28, x0 + half, y + 40), fill=fg)
        text(d, (x0 + 14, y + 9), title, font(21, 'black'), CREAM)
        pic = os.path.join(ART, f'{bird_id}-{key}.png')
        has_pic = os.path.exists(pic)
        if has_pic:
            ix0, iy0, ix1, iy1 = x0 + 8, y + 46, x0 + half - 8, y + blk_h - 58
            img.paste(contain(pic, int(ix1 - ix0), int(iy1 - iy0), CREAM), (int(ix0), int(iy0)))
            f_b, lines = fit_lines(d, clean(body, 46), int(half - 26), 2, 18, 13, 'bold', 1.45)
            ty0 = y + blk_h - 54
        else:
            # 冇圖示：文字放大、置中偏上，唔留大塊空白
            f_b, lines = fit_lines(d, clean(body, 40), int(half - 30), 4, 20, 14, 'bold', 1.5)
            ty0 = y + 52
        for j, ln in enumerate(lines):
            text(d, (x0 + 13, ty0 + j * int(f_b.size * 1.5) if not has_pic else ty0 + j * int(f_b.size * 1.45)),
                 ln, f_b, INK)

    # ---------- ⑤ 今日小任務（小朋友的互動位） ----------
    y += blk_h + 16
    task = ('今日任務：去公園聽一次八哥的叫聲，學佢叫一聲。'
            if bird_id == '0013' else
            f'今日任務：用望遠鏡找一次{zh}，記住佢企在邊度。')
    d.rounded_rectangle((M, y, W - M, y + 78), radius=10, fill=(255, 240, 200), outline=YELLOW, width=3)
    d.ellipse((M + 14, y + 18, M + 56, y + 60), fill=CORAL)
    text(d, (M + 28, y + 26), '!', font(26, 'black'), WHITE)
    f_t, lines = fit_lines(d, task, W - 2 * M - 96, 2, 21, 15, 'black', 1.4)
    for j, ln in enumerate(lines):
        text(d, (M + 70, y + 16 + j * int(f_t.size * 1.4)), ln, f_t, INK)

    # ---------- ⑥ 四個辨認位（圓形特寫，對應相片上的 1–4） ----------
    have_insets = [c for c in (callouts or []) if os.path.exists(
        os.path.join(ART, f'{bird_id}-inset-{c.get("inset") or "crest"}.jpg'))]
    y += 78 + 16
    if have_insets:
        text(d, (M, y), '四個辨認位', font(24, 'black'), GREEN)
        y += 40
        n = min(len(callouts), 4)
        cw4 = (W - 2 * M - 3 * 10) / 4
        for i, item in enumerate(callouts[:4]):
            x0 = M + i * (cw4 + 10)
            key = item.get('inset') or ['crest', 'eye', 'wing', 'feet'][i % 4]
            path = os.path.join(ART, f'{bird_id}-inset-{key}.jpg')
            dia = 92
            cx = x0 + cw4 / 2 - dia / 2
            if os.path.exists(path):
                im = cover(path, dia, dia)
                mask = Image.new('L', (dia, dia), 0)
                ImageDraw.Draw(mask).ellipse((0, 0, dia - 1, dia - 1), fill=255)
                img.paste(im, (int(cx), y), mask)
            d.ellipse((cx, y, cx + dia, y + dia), outline=GREEN, width=3)
            # 號碼貼在圓圈左下
            d.ellipse((cx - 4, y + dia - 26, cx + 24, y + dia + 2), fill=CORAL)
            text(d, (cx + 5, y + dia - 24), str(i + 1), font(17, 'black'), WHITE)
            f_lab, lines = fit_lines(d, item.get('label', ''), cw4 - 6, 1, 17, 12, 'black', 1.3)
            text(d, (x0 + (cw4 - tw(d, lines[0], f_lab)) / 2, y + dia + 8), lines[0], f_lab, INK)
            if item.get('text'):
                f_t2, l2 = fit_lines(d, item['text'], cw4 - 6, 2, 13, 11, 'regular', 1.35)
                for j, ln in enumerate(l2):
                    text(d, (x0 + (cw4 - tw(d, ln, f_t2)) / 2, y + dia + 30 + j * int(f_t2.size * 1.35)),
                         ln, f_t2, INK_SOFT)
        y += dia + 8 + 34 + 30

    # ---------- ⑦ 小知識：兩個短句，粗體關鍵字 ----------
    y += 12
    hl = [h for h in (c.get('highlights') or []) if h and len(h) > 8]
    facts = [
        ('小知識 1', clean(hl[0] if len(hl) > 0 else c.get('behavior') or '', 32), CORAL),
        ('小知識 2', clean(hl[1] if len(hl) > 1 else c.get('voice') or '未收錄。', 32), BLUE),
    ]
    for i, (head, body, col) in enumerate(facts):
        x0 = M + i * ((W - 2 * M) / 2 + 6)
        w_box = (W - 2 * M) / 2 - 6
        d.rounded_rectangle((x0, y, x0 + w_box, y + 92), radius=10, fill=WHITE, outline=(226, 216, 196), width=2)
        d.rectangle((x0, y, x0 + w_box, y + 34), fill=col)
        text(d, (x0 + 12, y + 6), head, font(19, 'black'), WHITE)
        f_b, lines = fit_lines(d, body.rstrip('；;，,。 '), w_box - 24, 2, 16, 12, 'bold', 1.4)
        for j, ln in enumerate(lines):
            text(d, (x0 + 12, y + 44 + j * int(f_b.size * 1.4)), ln, f_b, INK)
    y += 92 + 16

    # ---------- ⑧ 相似鳥：三個色塊，撳得（app 內連去嗰隻） ----------
    sims = similar_birds(bird_id, birds, tax, 3)
    if sims:
        text(d, (M, y), '鄰居', font(24, 'black'), GREEN)
        y += 38
        sw = (W - 2 * M - 2 * 10) / 3
        for i, (sid, name, palette) in enumerate(sims):
            x0 = M + i * (sw + 10)
            d.rounded_rectangle((x0, y, x0 + sw, y + 74), radius=10, fill=palette[0], outline=(0, 0, 0, 40), width=1)
            text(d, (x0 + 12, y + 10), f'NO.{sid}', font(13, 'bold'), palette[1])
            f_n, lines = fit_lines(d, name, sw - 24, 1, 24, 15, 'black', 1.2)
            text(d, (x0 + 12, y + 32), lines[0], f_n, palette[1])
        y += 74 + 10

    # ---------- ⑨ 觀察清單：空間夠才畫（野外用得着，不是裝飾） ----------
    if H - 58 - (y + 74) > 150:
        y += 18
        text(d, (M, y), '今日觀察清單', font(24, 'black'), GREEN)
        y += 40
        checklist = ['見到佢', '聽到佢叫', '睇到佢食嘢', '寫低喺邊度見到']
        box_w = (W - 2 * M - 3 * 10) / 4
        for i, item in enumerate(checklist):
            x0 = M + i * (box_w + 10)
            d.rounded_rectangle((x0, y, x0 + box_w, y + 66), radius=8, fill=WHITE,
                                outline=(226, 216, 196), width=2)
            d.rectangle((x0 + 10, y + 12, x0 + 32, y + 34), outline=GREEN, width=3)
            f_c, lines = fit_lines(d, item, box_w - 20, 2, 15, 11, 'bold', 1.35)
            for j, ln in enumerate(lines):
                text(d, (x0 + 10, y + 40 + j * int(f_c.size * 1.35)), ln, f_c, INK)
        y += 66 + 10

    # ---------- ⑩ 底條：來源 + 版本 ----------
    foot_y = H - 58
    d.rectangle((0, foot_y, W, H), fill=GREEN)
    src = (c.get('source') or '').replace('｜', ' · ')
    f_src = font(13, 'regular')
    while tw(d, src, f_src) > W - 2 * M - 130 and len(src) > 20:
        src = src[:-4]
    text(d, (M, foot_y + 10), f'資料來源：{src}', f_src, (205, 225, 208))
    text(d, (M, foot_y + 30), f'AVIANDEX · NO.{bird_id}', font(12, 'bold'), YELLOW)
    text(d, (W - M - tw(d, 'v1.9 童趣版', font(14, 'bold')), foot_y + 20), 'v1.9 童趣版',
         font(14, 'bold'), YELLOW)

    os.makedirs(OUT_DIR, exist_ok=True)
    img.save(out_path)
    print('✅', out_path, img.size)


if __name__ == '__main__':
    bid = sys.argv[1] if len(sys.argv) > 1 else '0013'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(OUT_DIR, f'aviandex-card-{bid}-kid.png')
    render(bid, out)
