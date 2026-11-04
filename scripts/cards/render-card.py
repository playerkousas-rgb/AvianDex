#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================
 AvianDex — 圖卡排版引擎（v2 重新設計）
================================================================
 為何唔用 AI 直接出圖？
   因為 AI 寫中文字一定會出錯（錯字／亂碼／假數據）。
   所以分工：AI 只負責「鳥的插畫」，所有文字、框線、數據由本腳本畫。
   → 卡上每個字都係 TrueType 字型渲染，可 100% 核對，
     而且所有數值都直接由 src/data/*.json 讀入（eBird/Clements 權威）。

 資料來源（全部唯讀，唔會由 AI 生成）：
   src/data/birds.json            中文名、編號
   src/data/birdTaxonomy.json     eBird：英文名／學名／目／科／species code／排序號
   src/data/cardCopy.json         卡面文案（每項都要有 source，否則顯示「資料待查」）
   cards/art/<ID>.png             AI 插畫（已去背／米色底）

 兩種卡（唔好搞亂，各自放唔同 R2 路徑）：

   ┌ 鳥卡 bird card ────────────────────────────────┐
   │ 簡單：插畫 + 編號 + 中文名 + 英文名（冇數據格） │
   │ → R2：aviandex/<ID>.avif                       │
   │ → python3 scripts/cards/render-card.py 0290 --kind bird
   └────────────────────────────────────────────────┘
   ┌ 資訊圖卡 infographic ──────────────────────────┐
   │ 詳細：分類、食性、分佈、外形、棲地、保育狀況    │
   │ → R2：aviandex/info/<ID>.avif                  │
   │ → python3 scripts/cards/render-card.py 0290 --kind info
   └────────────────────────────────────────────────┘

 ⚠️ 兩者唔可以互相覆蓋：
   鳥卡      → aviandex/<ID>.avif        （圖鑑格仔，簡單）
   資訊圖卡  → aviandex/info/<ID>.avif   （點開後的詳細頁，重設計那張）
 預設 --kind = info（本次重新設計的對象）
================================================================
"""

import argparse
import json
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

# ---------------------------------------------------------------- 路徑
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "src", "data")
ART_DIR = os.path.join(ROOT, "cards", "art")
OUT_ROOT = os.path.join(ROOT, "cards", "out")
def _font_dir():
    """找中文字型：環境變數 > ~/.fonts > /usr/share/fonts（不要寫死沙盒路徑）。"""
    candidates = [
        os.environ.get("AVIANDEX_FONT_DIR"),
        os.path.expanduser("~/.fonts"),
        os.path.expanduser("~/.local/share/fonts"),
        "/usr/share/fonts/truetype/noto",
        "/Library/Fonts",
        "/System/Library/Fonts",
    ]
    for d in candidates:
        if d and os.path.exists(os.path.join(d, "NotoSansTC-Black.otf")):
            return d
    return os.environ.get("AVIANDEX_FONT_DIR") or os.path.expanduser("~/.fonts")


FONT_DIR = _font_dir()

FONT_BLACK = os.path.join(FONT_DIR, "NotoSansTC-Black.otf")
FONT_BOLD = os.path.join(FONT_DIR, "NotoSansTC-Bold.otf")
FONT_REG = os.path.join(FONT_DIR, "NotoSansTC-Regular.otf")

# ---------------------------------------------------------------- 設計常數
W, H = 1400, 1867          # 3:4，R2 上現有圖卡尺寸
SS = 2                      # 超取樣倍數（文字更鋭利）
VERSION = "1.8.0"

# 色票：沿用 App 的寶可夢圖鑑配色
INK = (10, 22, 18)          # 最深底色
DEEP = (14, 59, 46)         # 深綠卡身 #0E3B2E
DEEP_2 = (20, 78, 62)       # 深綠高光
CREAM = (255, 248, 214)     # 奶油白 #FFF8D6
YELLOW = (250, 204, 21)     # 強調黃 #FACC15
RED = (227, 53, 13)         # 圖鑑紅 #E3350D
RED_DARK = (150, 30, 8)
TEAL = (95, 192, 248)
WHITE = (255, 255, 255)
MUTED = (146, 178, 165)     # 深綠上的次要文字
GOLD_LINE = (198, 158, 42)


def font(path, size):
    return ImageFont.truetype(path, int(size))


def rounded(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle([int(v) for v in box], radius=radius, fill=fill, outline=outline, width=width)


def text_w(draw, txt, f, tracking=0):
    if not txt:
        return 0
    width = sum(draw.textlength(ch, font=f) for ch in txt)
    return width + tracking * max(0, len(txt) - 1)


def draw_text(draw, xy, txt, f, fill, anchor="la", tracking=0, shadow=None):
    """支援字距（tracking）的文字繪製；anchor 只支援 l/m/r + a/m/s。"""
    x, y = xy
    total = text_w(draw, txt, f, tracking)
    if anchor[0] == "m":
        x -= total / 2
    elif anchor[0] == "r":
        x -= total
    if anchor[1] == "m":
        y -= f.size * 0.72
    elif anchor[1] == "s":
        y -= f.size * 1.16
    for ch in txt:
        if shadow:
            draw.text((x + shadow[0], y + shadow[1]), ch, font=f, fill=shadow[2])
        draw.text((x, y), ch, font=f, fill=fill)
        x += draw.textlength(ch, font=f) + tracking


def wrap(draw, txt, f, max_w):
    """逐字斷行（中英混合都適用，避免英文字被切開就用空白優先）。"""
    lines, cur = [], ""
    for ch in txt:
        if ch == "\n":
            lines.append(cur)
            cur = ""
            continue
        trial = cur + ch
        # 英文長字（Copsy chus）優先斷在空格，中英文混排才不會切開拉丁詞
        if draw.textlength(trial, font=f) > max_w and cur:
            cut = cur.rfind(" ")
            if cut > 0 and (len(cur) - cut) <= 12:
                lines.append(cur[:cut])
                cur = cur[cut + 1:] + ch
            else:
                lines.append(cur)
                cur = ch
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines


def hline(draw, x1, x2, y, color, width=2, dash=None):
    if dash:
        x = x1
        while x < x2:
            draw.line([(x, y), (min(x + dash, x2), y)], fill=color, width=width)
            x += dash * 2
    else:
        draw.line([(x1, y), (x2, y)], fill=color, width=width)


def card_art(art_path, box_w, box_h):
    """把插畫裁成「貼合鳥身」的方框，保留米色底（唔硬去背，避免邊緣鋸齒）。"""
    art = Image.open(art_path).convert("RGB")
    # 以米色為底做差異圖，找出鳥的實際範圍 → 自動裁切留邊
    bg = Image.new("RGB", art.size, art.getpixel((3, 3)))
    from PIL import ImageChops
    diff = ImageChops.difference(art, bg).convert("L")
    bbox = diff.point(lambda v: 255 if v > 12 else 0).getbbox()
    if bbox:
        pad = 24
        bbox = (
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(art.width, bbox[2] + pad),
            min(art.height, bbox[3] + pad),
        )
        art = art.crop(bbox)
    # 把插畫底色的米色換成卡框的 CREAM（否則會見到「相中相」的色差方框）
    import numpy as np

    arr = np.asarray(art).astype(np.int16)
    base = np.array(art.getpixel((2, 2)), dtype=np.int16)
    dist = np.abs(arr - base).max(axis=2)
    mask = dist < 26                      # 接近底色的像素
    smooth = np.clip((dist - 12) / 26.0, 0, 1)[..., None]
    target = np.array(CREAM, dtype=np.float32)
    blended = arr * smooth + target * (1 - smooth)
    arr2 = np.where(mask[..., None], target.astype(np.int16), blended).astype(np.uint8)
    art = Image.fromarray(arr2, "RGB")

    scale = min(box_w / art.width, box_h / art.height)
    return art.resize((max(1, int(art.width * scale)), max(1, int(art.height * scale))), Image.LANCZOS)


# ---------------------------------------------------------------- 資料
def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as fh:
        return json.load(fh)


def build_facts(bird_id):
    birds = {b["id"]: b for b in load("birds.json")}
    tax = load("birdTaxonomy.json").get(bird_id)
    copy_all = load("cardCopy.json") if os.path.exists(os.path.join(DATA, "cardCopy.json")) else {}
    copy = copy_all.get(bird_id, {})
    bird = birds.get(bird_id, {"id": bird_id, "name": "???", "en": ""})
    return {
        "id": bird_id,
        "zh": bird["name"],
        "en": (tax or {}).get("comName") or bird.get("en") or "Unknown",
        "sci": (tax or {}).get("sciName") or "",
        "order": (tax or {}).get("order") or "",
        "family": (tax or {}).get("family") or "",
        "code": (tax or {}).get("speciesCode") or "",
        "orderZh": (tax or {}).get("orderZh") or "",
        "familyZh": (tax or {}).get("familyZh") or "",
        "rank": (tax or {}).get("taxonOrder"),
        "copy": copy,
        "notes": (copy or {}).get("notes") or "",
    }


PENDING = "資料待查"


def pick(copy, key):
    v = (copy.get(key) or "").strip()
    return v if v else PENDING


# ---------------------------------------------------------------- 繪製
def render_bird(f):
    """鳥卡：只有插畫 + 編號 + 名稱。冇數據格、冇特徵標註，一眼睇得清。"""
    w, h = 900 * SS, 1200 * SS
    img = Image.new("RGB", (w, h), CREAM)
    d = ImageDraw.Draw(img)

    # 米色卡底 + 金色細框（圖鑑收藏卡感）
    rounded(d, [18 * SS, 18 * SS, w - 18 * SS, h - 18 * SS], 30 * SS,
            fill=CREAM, outline=GOLD_LINE, width=3 * SS)

    # 插畫：食滿上半部
    art_path = os.path.join(ART_DIR, f"{f['id']}.png")
    top_pad = 60 * SS
    art_bottom = h - 250 * SS
    if os.path.exists(art_path):
        pic = card_art(art_path, (w - 120 * SS), art_bottom - top_pad)
        img.paste(pic, (int((w - pic.width) / 2), int(top_pad + (art_bottom - top_pad - pic.height) / 2)))
    else:
        d.text((w / 2, (top_pad + art_bottom) / 2), "（未提供插畫）",
               font=font(FONT_BOLD, 34 * SS), fill=(160, 140, 96), anchor="mm")

    # 編號（左上）
    d.text((56 * SS, 46 * SS), f"NO.{f['id']}", font=font(FONT_BLACK, 30 * SS), fill=(120, 92, 20))
    # 分類小字（右上，只寫科）
    if f["family"]:
        d.text((w - 56 * SS, 48 * SS), f["family"], font=font(FONT_BOLD, 22 * SS),
               fill=(150, 126, 70), anchor="ra")

    # 底部：中文名 + 英文名
    d.text((w / 2, h - 190 * SS), f["zh"], font=font(FONT_BLACK, 74 * SS), fill=(22, 40, 32), anchor="mm")
    if f["sci"]:
        d.text((w / 2, h - 122 * SS), f["sci"], font=font(FONT_REG, 28 * SS), fill=(96, 110, 92), anchor="mm")
    d.text((w / 2, h - 72 * SS), f["en"], font=font(FONT_BOLD, 27 * SS), fill=(150, 108, 18), anchor="mm")
    return img.resize((900, 1200), Image.LANCZOS)


def render_pokedex(f):
    """資訊圖卡（寶可夢圖鑑機造型）。

    造型：紅色機身、左上大鏡頭（藍鏡 + 白高光）、三顆指示燈、機鉸、
    銀灰屏幕框，屏幕內由上至下：資料卡晶片 → 名稱 → 分類 → 插畫＋側欄 → 四格 → 狀態列。
    所有文字由字型渲染；資料由 birdTaxonomy.json（eBird）＋ cardCopy.json 讀入。
    """
    Wp, Hp = 1200, 1600
    w, h = Wp * SS, Hp * SS

    img = Image.new("RGB", (w, h), (24, 28, 34))
    d = ImageDraw.Draw(img)

    # ── 機身（紅色）──
    body = [30 * SS, 24 * SS, w - 30 * SS, h - 18 * SS]
    rounded(d, body, 56 * SS, fill=RED_DARK)
    rounded(d, [body[0], body[1], body[2], body[1] + 300 * SS], 56 * SS, fill=RED)
    rounded(d, [body[0] + 12 * SS, body[1] + 12 * SS, body[0] + 30 * SS, body[3] - 16 * SS], 16 * SS,
            fill=(255, 116, 92))

    # ── 左上：大鏡頭 ──
    cx, cy, r = 150 * SS, 132 * SS, 66 * SS
    d.ellipse([cx - r - 10 * SS, cy - r - 10 * SS, cx + r + 10 * SS, cy + r + 10 * SS], fill=(240, 234, 216))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(26, 32, 38))
    d.ellipse([cx - r * 0.8, cy - r * 0.8, cx + r * 0.8, cy + r * 0.8], fill=TEAL)
    d.ellipse([cx - r * 0.46, cy - r * 0.46, cx + r * 0.46, cy + r * 0.46], fill=(16, 70, 112))
    d.ellipse([cx - r * 0.22, cy - r * 0.3, cx + r * 0.08, cy - r * 0.04], fill=(240, 250, 255))

    # ── 三顆指示燈（鏡頭右上）──
    for i, col in enumerate([(232, 68, 52), (240, 202, 66), (92, 204, 124)]):
        lx = 268 * SS + i * 26 * SS
        d.ellipse([lx, 44 * SS, lx + 18 * SS, 62 * SS], fill=col, outline=(96, 16, 8), width=2 * SS)

    # ── 名牌 ──
    d.text((268 * SS, 92 * SS), "AvianDex", font=font(FONT_BLACK, 50 * SS), fill=CREAM,
           shadow=(2 * SS, 2 * SS, (120, 20, 6)))
    d.text((270 * SS, 150 * SS), "HONG KONG FIELD GUIDE", font=font(FONT_BOLD, 16 * SS), fill=(255, 214, 200))

    # ── 右上：NO. 牌 ──
    pl = [w - 356 * SS, 40 * SS, w - 84 * SS, 168 * SS]
    rounded(d, pl, 18 * SS, fill=(24, 10, 8), outline=YELLOW, width=3 * SS)
    d.text(((pl[0] + pl[2]) / 2, pl[1] + 34 * SS), "NO.", font=font(FONT_BOLD, 22 * SS), fill=YELLOW, anchor="mm")
    d.text(((pl[0] + pl[2]) / 2, pl[1] + 88 * SS), f["id"], font=font(FONT_BLACK, 50 * SS), fill=CREAM,
           anchor="mm", tracking=3 * SS)

    # ── 機鉸 ──
    for hx in (44 * SS, w - 132 * SS):
        rounded(d, [hx, 196 * SS, hx + 88 * SS, 220 * SS], 8 * SS, fill=(120, 26, 10), outline=(70, 14, 6), width=2 * SS)

    # ── 銀灰屏幕框 ──
    sc = [60 * SS, 240 * SS, w - 60 * SS, h - 160 * SS]
    rounded(d, [sc[0] + 5 * SS, sc[1] + 9 * SS, sc[2] + 5 * SS, sc[3] + 9 * SS], 30 * SS, fill=(104, 24, 12))
    rounded(d, sc, 30 * SS, fill=(222, 226, 230))
    # 屏幕上方指示燈帶
    for i in range(2):
        bx = sc[0] + 26 * SS + i * 24 * SS
        rounded(d, [bx, sc[1] + 11 * SS, bx + 16 * SS, sc[1] + 19 * SS], 4 * SS, fill=(250, 190, 80))

    # ── 屏幕（深綠）──
    ie = [sc[0] + 20 * SS, sc[1] + 30 * SS, sc[2] - 20 * SS, sc[3] - 20 * SS]
    rounded(d, ie, 22 * SS, fill=DEEP)

    # 屏幕細格紋
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for gx in range(int(ie[0]), int(ie[2]), 44 * SS):
        gd.line([(gx, ie[1]), (gx, ie[3])], fill=(255, 255, 255, 6), width=1)
    for gy in range(int(ie[1]), int(ie[3]), 44 * SS):
        gd.line([(ie[0], gy), (ie[2], gy)], fill=(255, 255, 255, 6), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), grid).convert("RGB")
    d = ImageDraw.Draw(img)

    L = ie[0] + 30 * SS
    R = ie[2] - 30 * SS
    inner_w = R - L

    # 版面預算：所有固定高度先扣，剩下全給插畫窗
    y = ie[1] + 22 * SS
    H_CHIP, H_TITLE, H_CHIPS, H_BOTTOM = 38 * SS, 150 * SS, 46 * SS, 88 * SS
    GAP = 16 * SS
    cells_h = 104 * SS
    fixed = H_CHIP + 14 * SS + H_TITLE + 10 * SS + H_CHIPS + GAP + (cells_h * 2 + 14 * SS) + GAP + H_BOTTOM + 10 * SS
    art_h = (ie[3] - 16 * SS) - y - fixed

    # 資料卡晶片
    rounded(d, [L, y, L + 116 * SS, y + H_CHIP], 8 * SS, fill=(38, 116, 176))
    d.text((L + 58 * SS, y + H_CHIP / 2), "資料卡 DATA", font=font(FONT_BOLD, 17 * SS), fill=WHITE, anchor="mm")
    y += H_CHIP + 14 * SS

    # 名稱
    d.text((L, y), f["zh"], font=font(FONT_BLACK, 62 * SS), fill=CREAM,
           shadow=(3 * SS, 3 * SS, (0, 0, 0, 150)))
    ty = y + 74 * SS
    if f["sci"]:
        d.text((L, ty), f["sci"], font=font(FONT_REG, 27 * SS), fill=(178, 214, 200))
        ty += 34 * SS
    d.text((L, ty), f["en"], font=font(FONT_BOLD, 27 * SS), fill=YELLOW)
    y += H_TITLE

    # 分類標籤
    order_zh = (f["copy"].get("orderZh") or f["orderZh"] or "").strip()
    family_zh = (f["copy"].get("familyZh") or f["familyZh"] or "").strip()
    chips = []
    if f["order"]:
        chips.append((f"{order_zh} {f['order']}".strip(), (38, 116, 176)))
    if f["family"]:
        chips.append((f"{family_zh} {f['family']}".strip(), (32, 148, 120)))
    if f["code"]:
        chips.append((f["code"], (58, 58, 64)))
    cx = L
    for label, bgc in chips:
        fc = font(FONT_BOLD, 18 * SS)
        cw = d.textlength(label, font=fc) + 30 * SS
        rounded(d, [cx, y, cx + cw, y + H_CHIPS], H_CHIPS / 2, fill=bgc)
        d.text((cx + cw / 2, y + H_CHIPS / 2), label, font=fc, fill=WHITE, anchor="mm")
        cx += cw + 10 * SS
    y += H_CHIPS + GAP

    # 插畫窗（左）＋ 側欄（右）
    art_w = inner_w * 0.52
    rounded(d, [L, y, L + art_w, y + art_h], 16 * SS, fill=CREAM)
    art_path = os.path.join(ART_DIR, f"{f['id']}.png")
    if os.path.exists(art_path):
        pic = card_art(art_path, art_w * 0.94, art_h * 0.94)
        img.paste(pic, (int(L + (art_w - pic.width) / 2), int(y + (art_h - pic.height) / 2)))
    else:
        d.text((L + art_w / 2, y + art_h / 2), "（未提供插畫）", font=font(FONT_BOLD, 24 * SS),
               fill=(160, 140, 96), anchor="mm")

    sx = L + art_w + 16 * SS
    sw = R - sx
    marks = f["copy"].get("callouts") or []
    box_h = art_h * 0.50
    rounded(d, [sx, y, R, y + box_h], 16 * SS, fill=(9, 42, 33), outline=(46, 104, 86), width=2 * SS)
    d.text((sx + 16 * SS, y + 12 * SS), "特徵標註", font=font(FONT_BLACK, 22 * SS), fill=CREAM)
    my = y + 46 * SS
    for i, m in enumerate(marks[:3]):
        d.ellipse([sx + 16 * SS, my + 3 * SS, sx + 36 * SS, my + 23 * SS], fill=YELLOW)
        d.text((sx + 26 * SS, my + 13 * SS), str(i + 1), font=font(FONT_BLACK, 14 * SS), fill=DEEP, anchor="mm")
        d.text((sx + 46 * SS, my - 2 * SS), m.get("label", ""), font=font(FONT_BOLD, 17 * SS), fill=YELLOW)
        ty2 = my + 22 * SS
        for ln in wrap(d, m.get("text", ""), font(FONT_REG, 16 * SS), sw - 62 * SS)[:2]:
            d.text((sx + 46 * SS, ty2), ln, font=font(FONT_REG, 16 * SS), fill=(214, 232, 224))
            ty2 += 20 * SS
        my = ty2 + 8 * SS
    if not marks:
        d.text((sx + 16 * SS, my), "（未提供）", font=font(FONT_REG, 16 * SS), fill=MUTED)

    fy = y + box_h + 12 * SS
    rounded(d, [sx, fy, R, y + art_h], 16 * SS, fill=(26, 76, 60), outline=(46, 104, 86), width=2 * SS)
    d.text((sx + 16 * SS, fy + 10 * SS), "冷知識 TRIVIA", font=font(FONT_BOLD, 15 * SS), fill=YELLOW)
    fy2 = fy + 34 * SS
    trivia_font = font(FONT_REG, 18 * SS)
    max_lines = max(2, int((y + art_h - fy2 - 8 * SS) / (23 * SS)))
    for ln in wrap(d, (f["copy"].get("funFact") or PENDING), trivia_font, sw - 32 * SS)[:max_lines]:
        d.text((sx + 16 * SS, fy2), ln, font=trivia_font, fill=(224, 238, 231))
        fy2 += 23 * SS

    y += art_h + GAP

    # 四格資料
    cw2 = (inner_w - 14 * SS) / 2
    cells = [
        ("食 性 · DIET", pick(f["copy"], "diet"), (250, 204, 21)),
        ("分 佈 · RANGE", pick(f["copy"], "range"), TEAL),
        ("外形特徵 · MARKS", pick(f["copy"], "look"), (126, 214, 150)),
        ("棲 地 · HABITAT", pick(f["copy"], "habitat"), (250, 170, 120)),
    ]
    for i, (label, text, accent) in enumerate(cells):
        cxx = L + (i % 2) * (cw2 + 14 * SS)
        cyy = y + (i // 2) * (cells_h + 14 * SS)
        rounded(d, [cxx, cyy, cxx + cw2, cyy + cells_h], 12 * SS, fill=(9, 42, 33), outline=(46, 104, 86), width=2 * SS)
        rounded(d, [cxx, cyy + 10 * SS, cxx + 7 * SS, cyy + cells_h - 10 * SS], 3 * SS, fill=accent)
        d.text((cxx + 18 * SS, cyy + 9 * SS), label, font=font(FONT_BOLD, 16 * SS), fill=accent)
        by = cyy + 36 * SS
        for ln in wrap(d, text, font(FONT_REG, 18 * SS), cw2 - 36 * SS)[:3]:
            d.text((cxx + 18 * SS, by), ln, font=font(FONT_REG, 18 * SS), fill=(224, 238, 231))
            by += 22 * SS

    y += cells_h * 2 + 14 * SS + GAP

    # 狀態列
    rounded(d, [L, y, R, y + H_BOTTOM], 12 * SS, fill=(8, 34, 27), outline=(46, 104, 86), width=2 * SS)
    d.text((L + 20 * SS, y + 10 * SS), "保育狀況 · IUCN", font=font(FONT_BOLD, 15 * SS), fill=MUTED)
    status = f["copy"].get("iucn") or PENDING
    d.text((L + 20 * SS, y + 32 * SS), status, font=font(FONT_BLACK, 28 * SS),
           fill=(126, 214, 150) if status != PENDING else MUTED)

    fields2 = ["diet", "range", "look", "habitat", "funFact", "iucn"]
    have = sum(1 for k in fields2 if (f["copy"].get(k) or "").strip())
    ratio = have / len(fields2)
    bx1, bx2 = L + 380 * SS, R - 22 * SS
    d.text((bx1, y + 10 * SS), f"資料完整度 · DATA {have}/{len(fields2)}", font=font(FONT_BOLD, 15 * SS), fill=MUTED)
    rounded(d, [bx1, y + 34 * SS, bx2, y + 50 * SS], 8 * SS, fill=(22, 56, 46))
    if ratio > 0:
        rounded(d, [bx1 + 2 * SS, y + 36 * SS, bx1 + 2 * SS + (bx2 - bx1 - 4 * SS) * ratio, y + 48 * SS],
                6 * SS, fill=YELLOW if ratio >= 0.9 else TEAL)
    d.text((bx2, y + 62 * SS), (f["copy"].get("source") or "eBird / Clements Checklist")[:74],
           font=font(FONT_REG, 14 * SS), fill=(110, 140, 130), anchor="ra")

    # ── 機身上：左下螺絲、右下喇叭孔、底部銘牌 ──
    for sx_, sy_ in [(52 * SS, h - 46 * SS), (w - 52 * SS, h - 46 * SS), (52 * SS, 236 * SS), (w - 52 * SS, 236 * SS)]:
        d.ellipse([sx_ - 8 * SS, sy_ - 8 * SS, sx_ + 8 * SS, sy_ + 8 * SS], fill=(150, 34, 16), outline=(88, 16, 8), width=2 * SS)
        d.line([(sx_ - 5 * SS, sy_), (sx_ + 5 * SS, sy_)], fill=(196, 96, 70), width=2 * SS)
    for i in range(8):
        d.ellipse([w - 300 * SS + i * 24 * SS, h - 116 * SS, w - 284 * SS + i * 24 * SS, h - 100 * SS], fill=(150, 34, 16))
    d.text((90 * SS, h - 108 * SS), "AVIANDEX · 香港鳥類圖鑑", font=font(FONT_BOLD, 18 * SS), fill=(255, 206, 190))
    d.text((90 * SS, h - 80 * SS), "分類以 eBird/Clements 為權威", font=font(FONT_REG, 14 * SS), fill=(255, 176, 156))

    return img.resize((Wp, Hp), Image.LANCZOS)


def render_info(f):
    w, h = W * SS, H * SS
    img = Image.new("RGB", (w, h), INK)
    d = ImageDraw.Draw(img)

    M = 52 * SS

    # ── 卡身：深綠底 + 金色內框 ──
    rounded(d, [M, M, w - M, h - M], 34 * SS, fill=DEEP, outline=GOLD_LINE, width=3 * SS)
    # 頂部漸層（模擬機身打光）
    grad = Image.new("L", (w - 2 * M, 240 * SS))
    gd = ImageDraw.Draw(grad)
    for i in range(grad.height):
        gd.line([(0, i), (grad.width, i)], fill=int(40 * (1 - i / grad.height)))
    glow = Image.new("RGB", (w - 2 * M, 240 * SS), DEEP_2)
    img.paste(glow, (M, M), grad)

    pad = M + 40 * SS
    inner_r = w - M - 40 * SS

    # 機身細格紋（圖鑑質感；用低透明度，唔搶內容）
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdr = ImageDraw.Draw(grid)
    step = 46 * SS
    for gx in range(int(M), int(w - M), step):
        gdr.line([(gx, M), (gx, h - M)], fill=(255, 255, 255, 8), width=1)
    for gy in range(int(M), int(h - M), step):
        gdr.line([(M, gy), (w - M, gy)], fill=(255, 255, 255, 8), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), grid).convert("RGB")
    d = ImageDraw.Draw(img)

    # 四角螺絲
    for sx_, sy_ in [(M + 16 * SS, M + 16 * SS), (w - M - 16 * SS, M + 16 * SS),
                     (M + 16 * SS, h - M - 16 * SS), (w - M - 16 * SS, h - M - 16 * SS)]:
        d.ellipse([sx_ - 7 * SS, sy_ - 7 * SS, sx_ + 7 * SS, sy_ + 7 * SS], fill=(30, 62, 52), outline=(120, 160, 148), width=2 * SS)
        d.line([(sx_ - 4 * SS, sy_), (sx_ + 4 * SS, sy_)], fill=(150, 186, 172), width=2 * SS)

    # ── 1. 頂欄：紅色機頭 ──
    top_h = 116 * SS
    rounded(d, [pad, M + 34 * SS, inner_r, M + 34 * SS + top_h], 22 * SS, fill=RED, outline=(255, 255, 255, 40), width=2 * SS)
    # 紅色機頭的內高光
    rounded(d, [pad + 6 * SS, M + 40 * SS, inner_r - 6 * SS, M + 34 * SS + top_h * 0.45], 16 * SS, fill=(255, 120, 80))

    # 左：標誌
    cy = M + 34 * SS + top_h / 2
    lx = pad + 30 * SS
    d.ellipse([lx, cy - 26 * SS, lx + 52 * SS, cy + 26 * SS], outline=CREAM, width=4 * SS)
    d.ellipse([lx + 15 * SS, cy - 11 * SS, lx + 37 * SS, cy + 11 * SS], fill=CREAM)
    d.text((lx + 74 * SS, cy), "AvianDex", font=font(FONT_BLACK, 40 * SS), fill=CREAM, anchor="lm")
    d.text((lx + 76 * SS, cy + 30 * SS), "HONG KONG FIELD GUIDE",
           font=font(FONT_BOLD, 13 * SS), fill=(255, 214, 196), anchor="lm")

    # 右：NO. 膠囊
    cap_w = 250 * SS
    rounded(d, [inner_r - cap_w - 24 * SS, cy - 38 * SS, inner_r - 24 * SS, cy + 38 * SS], 19 * SS,
            fill=(26, 8, 4), outline=YELLOW, width=3 * SS)
    d.text((inner_r - cap_w / 2 - 24 * SS, cy - 10 * SS), "NO.", font=font(FONT_BOLD, 20 * SS),
           fill=YELLOW, anchor="mm")
    d.text((inner_r - cap_w / 2 - 24 * SS, cy + 18 * SS), f["id"], font=font(FONT_BLACK, 34 * SS),
           fill=CREAM, anchor="mm", tracking=2 * SS)

    # ── 2. 名稱區 ──
    y = M + 34 * SS + top_h + 34 * SS
    d.text((pad, y), f["zh"], font=font(FONT_BLACK, 78 * SS), fill=CREAM, anchor="la",
           shadow=(3 * SS, 3 * SS, (0, 0, 0, 120)))
    y += 88 * SS
    if f["sci"]:
        d.text((pad, y), f["sci"], font=font(FONT_REG, 32 * SS), fill=(196, 226, 214), anchor="la")
        fw = d.textlength(f["sci"], font=font(FONT_REG, 32 * SS))
        # 學名下方細線（圖鑑感）
        hline(d, pad, pad + fw, y + 40 * SS, (120, 160, 148), width=2 * SS)
        y += 46 * SS
    d.text((pad, y), f["en"], font=font(FONT_BOLD, 30 * SS), fill=YELLOW, anchor="la")
    y += 48 * SS

    # ── 3. 分類標籤（寶可夢屬性牌的感覺）──
    chips = []
    order_zh = (f["copy"].get("orderZh") or f["orderZh"] or "").strip()
    family_zh = (f["copy"].get("familyZh") or f["familyZh"] or "").strip()
    if f["order"]:
        chips.append((f"{order_zh} {f['order']}".strip(), DEEP_2, CREAM))
    if f["family"]:
        chips.append((f"{family_zh} {f['family']}".strip(), (24, 96, 76), CREAM))
    if f["code"]:
        chips.append((f["code"], (40, 40, 40), YELLOW))
    cx = pad
    for label, bg, fg in chips:
        font_chip = font(FONT_BOLD, 22 * SS)
        cw = d.textlength(label, font=font_chip) + 44 * SS
        rounded(d, [cx, y, cx + cw, y + 44 * SS], 12 * SS, fill=bg, outline=GOLD_LINE, width=2 * SS)
        d.text((cx + cw / 2, y + 22 * SS), label, font=font_chip, fill=fg, anchor="mm")
        cx += cw + 14 * SS
    y += 74 * SS

    # ── 4. 插畫窗（圖鑑主體）＋ 右側特徵標註 ──
    art_top = y
    art_bottom = art_top + 690 * SS
    side_w = 300 * SS                     # 右側「特徵標註」欄
    art_w_right = inner_r - side_w - 22 * SS
    rounded(d, [pad, art_top, art_w_right, art_bottom], 26 * SS, fill=CREAM)
    # 內陰影
    shadow_layer = Image.new("RGBA", (int(art_w_right - pad), int(art_bottom - art_top)), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    sd.rectangle([0, 0, shadow_layer.width, shadow_layer.height], fill=(90, 74, 40, 50))
    rounded(sd, [0, 0, shadow_layer.width - 1, shadow_layer.height - 1], 26 * SS, fill=(0, 0, 0, 0))
    img.paste(shadow_layer, (int(pad), int(art_top)), shadow_layer)

    art_path = os.path.join(ART_DIR, f"{f['id']}.png")
    if os.path.exists(art_path):
        pic = card_art(art_path, (art_w_right - pad) * 1.02, (art_bottom - art_top) * 0.94)
        img.paste(pic, (int((pad + art_w_right - pic.width) / 2), int(art_top + (art_bottom - art_top - pic.height) / 2)))
    else:
        d.text(((pad + art_w_right) / 2, (art_top + art_bottom) / 2), "（未提供插畫）",
               font=font(FONT_BOLD, 34 * SS), fill=(150, 130, 90), anchor="mm")

    # 右側：特徵標註（callouts）＋ 一句冷知識
    sx = art_w_right + 22 * SS
    rounded(d, [sx, art_top, inner_r, art_bottom], 22 * SS, fill=(9, 42, 33), outline=(46, 104, 86), width=2 * SS)
    d.text((sx + 22 * SS, art_top + 20 * SS), "特徵標註", font=font(FONT_BLACK, 26 * SS), fill=CREAM, anchor="la")
    d.text((sx + 22 * SS, art_top + 54 * SS), "FIELD CALLOUTS", font=font(FONT_BOLD, 14 * SS), fill=MUTED, anchor="la")
    cy2 = art_top + 92 * SS
    marks = f["copy"].get("callouts") or []
    for i, mark in enumerate(marks[:3]):
        rounded(d, [sx + 18 * SS, cy2, inner_r - 18 * SS, cy2 + 138 * SS], 14 * SS, fill=(14, 58, 47))
        d.ellipse([sx + 30 * SS, cy2 + 16 * SS, sx + 54 * SS, cy2 + 40 * SS], fill=YELLOW)
        d.text((sx + 42 * SS, cy2 + 28 * SS), str(i + 1), font=font(FONT_BLACK, 16 * SS), fill=DEEP, anchor="mm")
        d.text((sx + 64 * SS, cy2 + 16 * SS), mark.get("label", ""), font=font(FONT_BOLD, 19 * SS), fill=YELLOW, anchor="la")
        line = wrap(d, mark.get("text", ""), font(FONT_REG, 19 * SS), side_w - 92 * SS)
        ty2 = cy2 + 62 * SS
        for ln in line[:2]:
            d.text((sx + 30 * SS, ty2), ln, font=font(FONT_REG, 19 * SS), fill=(214, 232, 224), anchor="la")
            ty2 += 24 * SS
        cy2 += 152 * SS
    if not marks:
        d.text((sx + 22 * SS, cy2), "（未提供）", font=font(FONT_REG, 18 * SS), fill=MUTED, anchor="la")

    # 底部：冷知識
    fact = (f["copy"].get("funFact") or "").strip()
    fact_top = art_bottom - 190 * SS
    rounded(d, [sx + 18 * SS, fact_top, inner_r - 18 * SS, art_bottom - 18 * SS], 14 * SS, fill=(26, 76, 60))
    d.text((sx + 34 * SS, fact_top + 12 * SS), "冷知識 · TRIVIA", font=font(FONT_BOLD, 15 * SS), fill=YELLOW, anchor="la")
    fy = fact_top + 38 * SS
    for ln in wrap(d, fact or PENDING, font(FONT_REG, 17 * SS), side_w - 56 * SS)[:6]:
        d.text((sx + 34 * SS, fy), ln, font=font(FONT_REG, 17 * SS), fill=(224, 238, 231), anchor="la")
        fy += 21 * SS

    # 四角對焦括號（圖鑑取景感）
    for ox, oy, dx, dy in [(pad + 22 * SS, art_top + 22 * SS, 1, 1), (art_w_right - 22 * SS, art_top + 22 * SS, -1, 1),
                           (pad + 22 * SS, art_bottom - 22 * SS, 1, -1), (art_w_right - 22 * SS, art_bottom - 22 * SS, -1, -1)]:
        d.line([(ox, oy), (ox + 34 * SS * dx, oy)], fill=(120, 100, 60), width=3 * SS)
        d.line([(ox, oy), (ox, oy + 34 * SS * dy)], fill=(120, 100, 60), width=3 * SS)

    # 右上角：eBird 排序位（同 NO. 分開，因為排序會變、編號唔會變）
    if f["rank"]:
        rounded(d, [art_w_right - 176 * SS, art_top + 18 * SS, art_w_right - 18 * SS, art_top + 62 * SS], 12 * SS,
                fill=(255, 248, 214), outline=(198, 158, 42), width=2 * SS)
        d.text((art_w_right - 97 * SS, art_top + 40 * SS), f"排序 #{f['rank']}",
               font=font(FONT_BOLD, 20 * SS), fill=(120, 92, 20), anchor="mm")

    y = art_bottom + 34 * SS

    # ── 5. 資料格（食性 / 分佈 / 外形 / 棲地）──
    cell_h = 150 * SS
    gap = 20 * SS
    cell_w = (inner_r - pad - gap) / 2

    def info_cell(x, y0, label, body, accent=YELLOW):
        rounded(d, [x, y0, x + cell_w, y0 + cell_h], 18 * SS, fill=(9, 42, 33), outline=(46, 104, 86), width=2 * SS)
        rounded(d, [x, y0 + 16 * SS, x + 9 * SS, y0 + cell_h - 16 * SS], 4 * SS, fill=accent)
        d.text((x + 26 * SS, y0 + 16 * SS), label, font=font(FONT_BOLD, 20 * SS), fill=accent, anchor="la")
        body_font = font(FONT_REG, 22 * SS)
        lines = wrap(d, body, body_font, cell_w - 52 * SS)
        ty = y0 + 54 * SS
        for ln in lines[:4]:
            d.text((x + 26 * SS, ty), ln, font=body_font, fill=(224, 238, 231), anchor="la")
            ty += body_font.size * 1.26

    info_cell(pad, y, "食 性 · DIET", pick(f["copy"], "diet"), YELLOW)
    info_cell(pad + cell_w + gap, y, "分 佈 · RANGE", pick(f["copy"], "range"), TEAL)
    y += cell_h + gap
    info_cell(pad, y, "外形特徵 · FIELD MARKS", pick(f["copy"], "look"), (126, 214, 150))
    info_cell(pad + cell_w + gap, y, "棲 地 · HABITAT", pick(f["copy"], "habitat"), (250, 170, 120))
    y += cell_h + gap

    # ── 6. 底欄：保育狀況 + 資料完整度 + 來源 ──
    bottom_top = h - M - 232 * SS
    rounded(d, [pad, bottom_top, inner_r, h - M - 34 * SS], 20 * SS, fill=(8, 34, 27), outline=(46, 104, 86), width=2 * SS)

    # 保育
    status = f["copy"].get("iucn") or PENDING
    d.text((pad + 26 * SS, bottom_top + 20 * SS), "保育狀況 · IUCN", font=font(FONT_BOLD, 18 * SS), fill=MUTED, anchor="la")
    d.text((pad + 26 * SS, bottom_top + 46 * SS), status, font=font(FONT_BLACK, 34 * SS),
           fill=(126, 214, 150) if status != PENDING else MUTED, anchor="la")

    # 資料完整度（真實計算，不是假的 base stat）
    fields = ["diet", "range", "look", "habitat", "funFact", "iucn"]
    have = sum(1 for k in fields if (f["copy"].get(k) or "").strip())
    ratio = have / len(fields)
    bx1, bx2 = pad + 360 * SS, inner_r - 30 * SS
    by = bottom_top + 58 * SS
    d.text((bx1, bottom_top + 20 * SS), f"資料完整度 · DATA {have}/{len(fields)}", font=font(FONT_BOLD, 18 * SS), fill=MUTED, anchor="la")
    rounded(d, [bx1, by, bx2, by + 22 * SS], 11 * SS, fill=(22, 56, 46), outline=(46, 104, 86), width=2 * SS)
    if ratio > 0:
        rounded(d, [bx1 + 3 * SS, by + 3 * SS, bx1 + 3 * SS + (bx2 - bx1 - 6 * SS) * ratio, by + 19 * SS],
                9 * SS, fill=YELLOW if ratio >= 0.9 else (TEAL if ratio >= 0.5 else RED))
    d.text((bx2, by + 34 * SS), f"{int(round(ratio * 100))}%", font=font(FONT_BOLD, 17 * SS), fill=(200, 220, 210), anchor="ra")

    # 來源（可追溯，唔可以刪）
    src = f["copy"].get("source") or "eBird / Clements Checklist"
    d.text((pad + 26 * SS, bottom_top + 132 * SS), "資料來源 · SOURCE",
           font=font(FONT_BOLD, 16 * SS), fill=(110, 140, 130), anchor="la")
    d.text((pad + 26 * SS, bottom_top + 154 * SS), src[:96], font=font(FONT_REG, 17 * SS), fill=(150, 178, 168), anchor="la")

    # 右下：假條碼（純裝飾，用編號產生，唔含可掃描資訊）
    bc_x = inner_r - 210 * SS
    bc_y = bottom_top + 140 * SS
    seed = sum(ord(c) for c in f["id"] + f["code"])
    for i in range(30):
        bw = 2 + ((seed >> (i % 8)) + i * 7) % 4
        if i % 3 == 0:
            d.rectangle([bc_x, bc_y, bc_x + bw * SS, bc_y + 34 * SS], fill=(150, 178, 168))
        bc_x += (bw + 3) * SS
    d.text((inner_r - 26 * SS, bottom_top + 182 * SS), f"{f['id']} · {f['code']} · v{VERSION}",
           font=font(FONT_REG, 14 * SS), fill=(96, 126, 116), anchor="ra")

    # ── 7. 收尾：底部細字 ──
    d.text(((w) / 2, h - M - 16 * SS), "AVIANDEX · 香港鳥類圖鑑 · 分類以 eBird/Clements 為權威",
           font=font(FONT_REG, 15 * SS), fill=(96, 126, 116), anchor="mm")

    return img.resize((W, H), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser(description="AvianDex 圖卡排版（文字由字型渲染，非 AI 生成）")
    ap.add_argument("ids", nargs="*", help="卡片編號，例如 0290")
    ap.add_argument("--all", action="store_true", help="處理 cards/art/ 內所有插畫")
    ap.add_argument("--all-birds", action="store_true",
                    help="處理 src/data/birds.json 內全部編號（唔靠 cards/art/，適合無插畫時全量出圖）")
    ap.add_argument("--layout", choices=["dexcard", "pokedex", "grid"], default="dexcard",
                    help="info 卡版式：dexcard=滿版資料卡（預設，依 2026-11 成品規格）；"
                         "pokedex/grid=舊版式（保留但不再使用）")
    ap.add_argument("--kind", choices=["bird", "info"], default="info",
                    help="bird=簡單鳥卡（R2 aviandex/）；info=詳細資訊圖卡（R2 aviandex/info/）")
    ap.add_argument("--preview", action="store_true", help="只出 PNG")
    ap.add_argument("--lang", choices=["zh", "en"], default="zh",
                    help="卡面語言（zh＝中文版，en＝English 版；文字一律來自資料，不即時翻譯）")
    ap.add_argument("--quality", type=int, default=58, help="AVIF 品質（預設 58，約 100–200 KB）")
    ap.add_argument("--from-image", metavar="FILE",
                    help="把一張現成 PNG（例如 AI 一次生成的整張卡）轉成 AVIF，唔做排版")
    args = ap.parse_args()

    out_dir = os.path.join(OUT_ROOT, "info") if args.kind == "info" else OUT_ROOT
    os.makedirs(out_dir, exist_ok=True)

    # ── 模式 0：只轉檔（AI 一次生成 → AVIF）──
    if args.from_image:
        src = os.path.abspath(args.from_image)
        if not os.path.exists(src):
            raise SystemExit(f"找不到 {src}")
        target = (1400, 1867) if args.kind == "info" else (900, 1200)
        im = Image.open(src).convert("RGB")
        # 等比放到目標框再置中填滿（避免張力變形）
        ratio = max(target[0] / im.width, target[1] / im.height)
        im = im.resize((int(im.width * ratio + 0.5), int(im.height * ratio + 0.5)), Image.LANCZOS)
        left = (im.width - target[0]) // 2
        top = (im.height - target[1]) // 2
        im = im.crop((left, top, left + target[0], top + target[1]))
        name = os.path.splitext(os.path.basename(src))[0].split("-")[0]
        png_path = os.path.join(out_dir, f"{name}.png")
        avif_path = os.path.join(out_dir, f"{name}.avif")
        im.save(png_path, optimize=True)
        subprocess.run(["convert", png_path, "-quality", str(args.quality),
                        "-define", "heic:speed=6", avif_path], check=True)
        print(f"✅ [{args.kind}] {os.path.basename(src)} → {os.path.relpath(avif_path, ROOT)}"
              f"（{os.path.getsize(avif_path) / 1024:.0f} KB）")
        return
    ids = list(args.ids)
    if args.all:
        ids = sorted(p[:-4] for p in os.listdir(ART_DIR) if p.endswith(".png"))
    if args.all_birds:
        birds_all = load("birds.json")
        ids = sorted({str(b["id"]).zfill(4) for b in birds_all if str(b.get("id", "")).isdigit()})
        print(f"🖼  全量出圖：{len(ids)} 張（來源 src/data/birds.json）")

    for raw in ids:
        bird_id = str(raw).strip()
        if not bird_id.isdigit():
            print(f"✗ 跳過 {raw}（編號要係數字）")
            continue
        bird_id = bird_id.zfill(4)
        f = build_facts(bird_id)
        if args.kind == "info":
            if args.layout == "dexcard":
                img = render_dexcard(f, lang=args.lang)
            else:
                img = {"grid": render_info, "pokedex": render_pokedex}[args.layout](f)
        else:
            img = render_bird(f)
        suffix = "" if args.lang == "zh" else "-en"
        png_path = os.path.join(out_dir, f"{bird_id}{suffix}.png")
        img.save(png_path, optimize=True)
        if args.preview:
            print(f"🖼  {bird_id} {f['zh']} → {os.path.relpath(png_path, ROOT)}")
            continue

        avif_path = os.path.join(out_dir, f"{bird_id}{suffix}.avif")
        # 用 ImageMagick 寫 AVIF（libheif 1.15，支援 AV1）；比 Pillow plugin 穩定
        subprocess.run(
            ["convert", png_path, "-quality", str(args.quality), "-define", "heic:speed=6", avif_path],
            check=True,
        )
        png_kb = os.path.getsize(png_path) / 1024
        avif_kb = os.path.getsize(avif_path) / 1024
        print(f"✅ [{args.kind}] {bird_id} {f['zh']} / {f['en']}")
        print(f"   PNG {png_kb:.0f} KB → AVIF {avif_kb:.0f} KB（省 {100 - avif_kb / png_kb * 100:.0f}%）")
        print(f"   {os.path.relpath(avif_path, ROOT)}")



# ================================================================
#  圖鑑資料卡（滿版資訊圖卡）—— 依 2026-11-04 用戶提供的成品規格
# ----------------------------------------------------------------
#  版面（由上而下）：
#    1. 標題列：圖鑑 logo + NO.NNNN + 大中文名 + 學名 + 英文名藥丸
#       + 右上目/科 + 身長/體重 + 常見度（5 燈）
#    2. 主圖：像素小圖（左）+ 真雀相（中）+ 圓形特寫標註（右，最多 5 個）
#    3. 四欄：分佈地區 / 棲息環境 / 食物 / Top 5 特色亮點
#    4. 四欄：成長與繁殖 / 觀察小貼士 / 有趣冷知識 / 注意事項
#    5. 生態價值評分卡（5 項 × 5 星）+ 綜合評分
#    6. 底部：NO + 名稱 + 版本 + 條碼
#  所有文字由字型渲染；AI 只提供像素圖與真雀相底圖。
# ================================================================
GREEN = (28, 106, 78)
GREEN_D = (20, 84, 61)
GREEN_L = (46, 130, 100)
PAGE = (248, 250, 245)
INK2 = (30, 42, 36)
SUB = (92, 112, 102)
LINE = (206, 220, 211)


def _art(name, size):
    """由 cards/art/ 讀圖，按目標長寬比置中裁切再縮放（缺檔回 None）。"""
    if not name:
        return None
    path = os.path.join(ART_DIR, name)
    if not os.path.exists(path):
        return None
    im = Image.open(path).convert("RGB")
    tw, th = int(size[0]), int(size[1])
    ratio = max(tw / im.width, th / im.height)
    im = im.resize((max(1, int(im.width * ratio + 0.5)), max(1, int(im.height * ratio + 0.5))),
                   Image.LANCZOS)
    left = (im.width - tw) // 2
    top = (im.height - th) // 2
    return im.crop((left, top, left + tw, top + th))


def radius_mask(size, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], r, fill=255)
    return m


def circle_thumb(src, d, fx=0.5, fy=0.42, zoom=0.62):
    """把真雀相某個部位裁成圓形小圖（標註用）。
    fx／fy = 對焦點（0–1，相對整張相）；zoom = 裁切邊長佔短邊比例。"""
    side = max(24, int(min(src.width, src.height) * float(zoom)))
    cx, cy = int(src.width * float(fx)), int(src.height * float(fy))
    box = (max(0, cx - side // 2), max(0, cy - side // 2),
           min(src.width, cx + side // 2), min(src.height, cy + side // 2))
    im = src.crop(box).resize((d, d), Image.LANCZOS)
    m = Image.new("L", (d, d), 0)
    ImageDraw.Draw(m).ellipse([0, 0, d - 1, d - 1], fill=255)
    out = Image.new("RGB", (d, d), (255, 255, 255))
    out.paste(im, (0, 0), m)
    return out


def section_head(d, x, y, title, icon, w=None):
    """小節標題：淺綠圓底字符 + 綠色粗體標題（icon 只用中文字／基本符號，
    避免 Noto Sans TC 缺字變成方框）。"""
    d.ellipse([x, y, x + 26 * SS, y + 26 * SS], fill=(226, 240, 231))
    d.text((x + 13 * SS, y + 13 * SS), icon, font=font(FONT_BOLD, 15 * SS),
           fill=GREEN, anchor="mm")
    d.text((x + 36 * SS, y + 13 * SS), title, font=font(FONT_BLACK, 21 * SS), fill=GREEN_D, anchor="lm")


def para(d, x, y, text, w, f, fill=INK2, lh=1.62, max_lines=None):
    """段落：回傳用完的高度。"""
    lines = wrap(d, text, f, w)
    if max_lines:
        lines = lines[:max_lines]
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill, anchor="la")
        y += f.size * lh
    return y


def stars(d, canvas, x, y, score, size=17, gap=3):
    """5 星評分（支援半星）。"""
    for i in range(5):
        cx = x + i * (size + gap) * SS
        box = [cx, y, cx + size * SS, y + size * SS]
        pts = []
        import math
        for k in range(10):
            ang = -math.pi / 2 + k * math.pi / 5
            rr = (size * SS / 2) if k % 2 == 0 else (size * SS / 4.6)
            pts.append((cx + size * SS / 2 + rr * math.cos(ang), y + size * SS / 2 + rr * math.sin(ang)))
        filled = score >= i + 0.75
        half = (not filled) and score >= i + 0.25
        if filled:
            d.polygon(pts, fill=(240, 170, 40))
        elif half:
            d.polygon(pts, fill=(228, 232, 226))
            half_w = int(size * SS / 2)
            mask = Image.new("L", (size * SS + 2, size * SS + 2), 0)
            ImageDraw.Draw(mask).rectangle([0, 0, half_w, size * SS + 2], fill=255)
            lay = Image.new("RGB", (size * SS + 2, size * SS + 2), PAGE)
            ImageDraw.Draw(lay).polygon([(p[0] - cx, p[1] - y) for p in pts], fill=(240, 170, 40))
            canvas.paste(lay, (int(cx), int(y)), mask)
        else:
            d.polygon(pts, fill=(228, 232, 226), outline=(206, 214, 206))


FIELD_SCHEMA_CACHE = {}


def _load_field_schema():
    """讀 scripts/cards/field-schema.json（由 field-schema.mjs --json 產生）。

    Python 唔想為一份欄位表再寫一次規則（兩邊走樣就會出現「HTML 版印 A、Pillow 印 B」），
    所以選欄只在 JS 寫一次；執行時若有人改過 .mjs 而未重新產生 .json，就自動重跑一次 node。
    """
    src = os.path.join(ROOT, "scripts", "cards", "field-schema.mjs")
    out = os.path.join(ROOT, "scripts", "cards", "field-schema.json")
    try:
        if not os.path.exists(out) or os.path.getmtime(src) > os.path.getmtime(out):
            subprocess.run(["node", src, "--json"], check=True, capture_output=True, timeout=60)
        with open(out, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception as e:                                    # 冇 node／冇檔案 → 用後備順序
        print(f"   ⚠️ 讀不到 field-schema.json（{e}），改用固定欄位順序")
        return None


def _cell(c, fid):
    """取 fieldCopy 內某一格（回傳 dict）或者舊格式的中文 key 值。"""
    fc = c.get("fieldCopy")
    if isinstance(fc, dict):
        fc = [dict(v, id=k) for k, v in fc.items()]
    if isinstance(fc, list):
        hit = next((x for x in fc if isinstance(x, dict) and x.get("id") == fid), None)
        if hit is not None:
            return hit
    return None


def _txt(v):
    if isinstance(v, list):
        return " ".join(str(x) for x in v if str(x).strip())
    return str(v or "").strip()


def choose_fields(c, lang="zh", max_picks=7):
    """回傳要印在四欄區的欄位 id（最多 7 個；有幾多印幾多）。

    評分規則必須與 scripts/cards/field-schema.mjs 的 chooseFields 完全一致，
    否則工作室（JS）同 Pillow（Python）會揀到唔同嘅 7 格。
    """
    if not FIELD_SCHEMA_CACHE:
        FIELD_SCHEMA_CACHE["data"] = _load_field_schema()
    schema = FIELD_SCHEMA_CACHE["data"]

    def val(fid, which="zh"):
        hit = _cell(c, fid)
        if hit is not None:
            v = hit.get("zh") if which == "zh" else hit.get("en")
            if _txt(v):
                return v
            if which == "en":
                return None            # 英文版：冇英文原文就當冇（唔會印中文）
        v = c.get(fid)
        return v if _txt(v) else None

    if schema:
        ids = [f["id"] for f in schema["fields"] if f.get("slot") == "grid4"]
        tier = {f["id"]: f["tier"] for f in schema["fields"]}
        max_picks = schema.get("maxPicks", max_picks)
    else:
        ids = ["range", "habitat", "diet", "highlights", "look", "breeding", "funFact",
               "tips", "voice", "behavior", "migration", "conservation", "humanRelation",
               "etymology", "caution"]
        tier = {k: ("core" if k in ("range", "habitat", "diet", "highlights") else "extra") for k in ids}
    weight = {"core": 30, "strong": 20, "extra": 10}
    scored = []
    for i, fid in enumerate(ids):
        v = val(fid, lang)
        if v is None:
            continue
        score = weight.get(tier.get(fid, "extra"), 10)
        # 中英同步 +4、列表項數 +項數（與 field-schema.mjs 一致）
        if val(fid, "zh") is not None and val(fid, "en") is not None:
            score += 4
        if isinstance(v, list):
            score += min(len([x for x in v if str(x).strip()]), 5)
        if len(_txt(v)) < 12:
            score -= 3
        if fid == "look" and not c.get("photo"):
            score += 2
        scored.append((-score, i, fid))
    scored.sort()
    return [fid for _, _, fid in scored[:max_picks]]


def chosen_of(picks, fid, c):
    """列表欄位在唔入選時回傳 None（唔會印）。"""
    return c.get(fid) if fid in picks else None


def render_dexcard(f, lang="zh"):
    EN = lang == "en"
    PEND = "Data pending" if EN else PENDING
    def V(fid):
        """取欄位值。英文版只接受英文原文（fieldCopy.en），冇就印 pending——
        絕對唔會把中文塞進英文卡，亦唔會臨時機翻。"""
        fc = c.get("fieldCopy")
        if isinstance(fc, dict):
            fc = [dict(v, id=k) for k, v in fc.items()]
        if isinstance(fc, list):
            hit = next((x for x in fc if isinstance(x, dict) and x.get("id") == fid), None)
            if hit is not None:
                want = hit.get("en") if EN else hit.get("zh")
                if isinstance(want, str) and want.strip():
                    return want
                if EN:
                    return ""
        return "" if EN else c.get(fid)

    """滿版資訊圖卡（1200×1600）。"""
    c = f["copy"]
    Wc, Hc = 1200, 1600
    S = 2
    img = Image.new("RGB", (Wc * S, Hc * S), PAGE)
    d = ImageDraw.Draw(img)
    M = 22 * S

    def F(kind, sz):
        return font({"b": FONT_BLACK, "bold": FONT_BOLD, "r": FONT_REG}[kind], sz * S)

    # ── 1. 標題列 ────────────────────────────────────────────
    head_h = 196 * S
    d.rounded_rectangle([M, M, Wc * S - M, M + head_h], 22 * S, fill=(255, 255, 255),
                        outline=GREEN_L, width=2 * S)

    # 1a. logo + 編號
    d.rounded_rectangle([M + 16 * S, M + 16 * S, M + 16 * S + 40 * S, M + 16 * S + 40 * S],
                        20 * S, fill=GREEN_D)
    d.ellipse([M + 26 * S, M + 26 * S, M + 46 * S, M + 46 * S], fill=(255, 255, 255))
    d.text((M + 70 * S, M + 36 * S), f"NO.{f['id']}", font=F("b", 34), fill=(240, 200, 40), anchor="lm")

    # 1b. 大中文名 + 學名 + 英文藥丸
    d.text((M + 300 * S, M + 18 * S), f["zh"], font=F("b", 62), fill=INK2, anchor="la")
    d.text((M + 300 * S, M + 104 * S), f["sci"], font=F("r", 23), fill=(70, 84, 76), anchor="la")
    pill_x = M + 300 * S + max(190 * S, int(d.textlength(f["sci"], font=F("r", 23))) + 24 * S)
    pill_max = Wc * S - M - 320 * S - pill_x          # 右邊留位畀目／科
    pf = F("bold", 19)
    tw = d.textlength(f["en"], font=pf) + 30 * S
    while tw > pill_max and pf.size > 20:
        pf = font(FONT_BOLD, pf.size - 1)
        tw = d.textlength(f["en"], font=pf) + 26 * S
    tw = min(tw, pill_max)
    d.rounded_rectangle([pill_x, M + 100 * S, pill_x + tw, M + 134 * S], 17 * S, fill=GREEN)
    d.text((pill_x + tw / 2, M + 117 * S), f["en"], font=pf, fill=(255, 255, 255), anchor="mm")

    # 1c. 右上：目／科
    rx = Wc * S - M - 16 * S
    d.text((rx, M + 26 * S), f"{f['orderZh']} {f['order']}", font=F("bold", 19), fill=(60, 76, 68), anchor="ra")
    d.text((rx, M + 52 * S), f"{f['familyZh']} {f['family']}", font=F("bold", 19), fill=(60, 76, 68), anchor="ra")

    # 1d. 身長／體重／常見度
    bx1, bx2 = Wc * S - M - 300 * S, Wc * S - M - 16 * S
    d.text((bx1, M + 92 * S), ("Length" if EN else "身長"), font=F("bold", 18), fill=SUB, anchor="la")
    d.text((bx2, M + 92 * S), c.get("length") or PEND, font=F("bold", 19), fill=INK2, anchor="ra")
    d.text((bx1, M + 122 * S), ("Weight" if EN else "體重"), font=F("bold", 18), fill=SUB, anchor="la")
    d.text((bx2, M + 122 * S), c.get("weight") or PEND, font=F("bold", 19), fill=INK2, anchor="ra")
    d.text((bx1, M + 154 * S), ("Commonness" if EN else "常見度"), font=F("bold", 18), fill=SUB, anchor="la")
    rarity = int(c.get("rarity") or 0)
    if rarity:
        for i in range(5):
            cx = bx2 - (4 - i) * 26 * S - 12 * S
            d.ellipse([cx - 9 * S, M + 156 * S, cx + 9 * S, M + 174 * S],
                      fill=GREEN if i < rarity else (226, 232, 226), outline=GREEN_L, width=1 * S)
    else:
        d.text((bx2, M + 156 * S), PEND, font=F("r", 16), fill=SUB, anchor="ra")

    # 2. 名稱分隔列（對齊參考卡的主名字距離）
    y = M + head_h + 14 * S
    d.rounded_rectangle([M, y, Wc * S - M, y + 26 * S], 8 * S, fill=(236, 244, 238))

    # ── 3. 主圖列：像素圖 | 真雀相 | 圓形標註 ─────────────────
    y = M + head_h + 52 * S
    row_h = 434 * S
    sprite_w = 210 * S
    call_w = 330 * S
    photo_w = Wc * S - 2 * M - sprite_w - call_w - 24 * S

    # 3a. 像素圖框
    d.rounded_rectangle([M, y, M + sprite_w, y + row_h], 18 * S, fill=(255, 255, 255),
                        outline=LINE, width=2 * S)
    sp = _art(c.get("sprite"), (int(sprite_w - 26 * S), int(sprite_w - 26 * S)))
    if sp:
        img.paste(sp, (int(M + 13 * S), int(y + 18 * S)))
    else:
        d.rounded_rectangle([M + 13 * S, y + 18 * S, M + 13 * S + (sprite_w - 26 * S),
                             y + 18 * S + (sprite_w - 26 * S)], 10 * S, fill=(243, 246, 242))
        d.text((M + sprite_w / 2, y + 18 * S + (sprite_w - 26 * S) / 2), "未提供像素圖",
               font=F("r", 14), fill=SUB, anchor="mm")
    # 像素圖下面：IUCN 徽章 + 別名（皆為有來源資料）
    badge_y = y + 18 * S + (sprite_w - 26 * S)
    iucn = (c.get("iucn") or "").strip()
    if iucn:
        d.rounded_rectangle([M + 13 * S, badge_y, M + 13 * S + 96 * S, badge_y + 24 * S],
                            12 * S, fill=(232, 244, 236), outline=GREEN_L, width=1 * S)
        d.text((M + 61 * S, badge_y + 12 * S), f"IUCN {iucn}", font=F("bold", 12), fill=GREEN_D, anchor="mm")
    aliases = c.get("aliases") or []
    if aliases:
        ay = badge_y + 32 * S
        d.text((M + 13 * S, ay), "別名", font=F("bold", 12), fill=SUB, anchor="la")
        ax, ayy = M + 13 * S, ay + 18 * S
        for al in aliases:
            tw = d.textlength(al, font=F("r", 12)) + 14 * S
            if ax + tw > M + sprite_w - 12 * S:
                ax = M + 13 * S
                ayy += 22 * S
            d.rounded_rectangle([ax, ayy, ax + tw, ayy + 19 * S], 9 * S, fill=(238, 243, 238))
            d.text((ax + tw / 2, ayy + 9 * S), al, font=F("r", 12), fill=(70, 92, 80), anchor="mm")
            ax += tw + 5 * S

    # 3b. 真雀相
    px1 = M + sprite_w + 12 * S
    px2 = px1 + photo_w
    has_photo = bool(c.get("photo")) and os.path.exists(os.path.join(ART_DIR, c["photo"]))
    ph = _art(c.get("photo"), (int(photo_w), int(row_h)))
    if ph:
        img.paste(ph, (int(px1), int(y)), radius_mask((int(photo_w), int(row_h)), 18 * S))
        d.rounded_rectangle([px1, y, px2, y + row_h], 18 * S, outline=(255, 255, 255), width=3 * S)
    else:
        d.rounded_rectangle([px1, y, px2, y + row_h], 18 * S, fill=(232, 238, 233))
        d.text(((px1 + px2) / 2, y + row_h / 2), ("(no photo yet)" if EN else "（未提供真雀相）"), font=F("r", 20), fill=SUB, anchor="mm")

    if not has_photo:
        # 冇相時右邊改為顯示「資料待查」清單，唔好留白
        d.rounded_rectangle([px2 + 12 * S, y, Wc * S - M, y + row_h], 18 * S,
                            fill=(255, 255, 255), outline=LINE, width=2 * S)
        section_head(d, px2 + 24 * S, y + 12 * S, (EN and "Appearance" or "外形特徵"), "形")
        para(d, px2 + 24 * S, y + 52 * S, V("look") or PEND,
             Wc * S - M - px2 - 48 * S, F("r", 15), INK2, 1.6)

    # 3c. 圓形特寫標註
    cx1 = px2 + 12 * S
    calls = ([m for m in (c.get("callouts") or [])][:5]) if has_photo else []
    if calls:
        # 先量「名稱由來」需要幾高，再用剩餘空間排 5 個圓形標註
        ety_txt = c.get("etymology") or PEND
        ety_w = Wc * S - M - cx1 - 24 * S
        ety_lines = wrap(d, ety_txt, F("r", 13), ety_w)
        ety_h = 44 * S + len(ety_lines) * 13 * S * 1.5 + 12 * S
        calls_h = row_h - ety_h - 10 * S

        d.rounded_rectangle([cx1, y, Wc * S - M, y + calls_h], 18 * S, fill=(255, 255, 255),
                            outline=LINE, width=2 * S)
        n = len(calls)
        gap = (calls_h - 20 * S) / max(n, 1)
        thumb_d = int(min(60 * S, gap - 8 * S))
        src_im = Image.open(os.path.join(ART_DIR, c["photo"])).convert("RGB") if has_photo else None
        for i, m in enumerate(calls):
            cy = int(y + 10 * S + gap * i + max(0.0, (gap - thumb_d) / 2 - 6 * S))
            th = circle_thumb(src_im, thumb_d, m.get("fx", 0.5), m.get("fy", 0.42),
                              m.get("zoom", 0.62)) if src_im else None
            if th:
                img.paste(th, (int(cx1 + 12 * S), cy))
                for w_, col in ((3, (255, 255, 255)), (1, GREEN_L)):
                    d.ellipse([cx1 + 12 * S, cy, cx1 + 12 * S + thumb_d, cy + thumb_d],
                              outline=col, width=w_ * S)
                d.line([cx1 + 12 * S + thumb_d, cy + thumb_d / 2,
                        cx1 + 12 * S + thumb_d + 8 * S, cy + thumb_d / 2],
                       fill=GREEN_L, width=2 * S)
            tx = cx1 + 12 * S + thumb_d + 14 * S
            d.text((tx, cy + 2 * S), m.get("label", ""), font=F("bold", 15), fill=SUB, anchor="la")
            para(d, tx, cy + 20 * S, m.get("text", ""), Wc * S - M - tx - 8 * S, F("r", 15),
                 INK2, 1.4, 2)

        # 名稱由來（有來源）
        ey = y + calls_h + 10 * S
        d.rounded_rectangle([cx1, ey, Wc * S - M, y + row_h], 18 * S, fill=(243, 248, 243),
                            outline=LINE, width=2 * S)
        section_head(d, cx1 + 12 * S, ey + 8 * S, (EN and "Name Origin" or "名稱由來"), "名")
        para(d, cx1 + 12 * S, ey + 44 * S, ety_txt, ety_w, F("r", 13), INK2, 1.5)
    elif has_photo:
        pass

    # ── 4. 版面量度：先算文字需要幾高，再決定行高／字級 ────────
    Mpt = 22.0
    left_w = 300.0
    gap = 12.0
    grid_x = Mpt + left_w + gap            # 112 + ...
    grid_w = Wc - Mpt - grid_x
    col_w = (grid_w - 3 * 10.0) / 4
    top_px = M + head_h + 52 * S + row_h + 14 * S     # 四欄起始（px，含超取樣）
    foot_px = Hc * S - M - 34 * S                     # 底欄上緣
    score_h_pt = 140.0
    budget = (foot_px - top_px) / S - score_h_pt - 10.0
    print(f"   四欄可用高度 {budget:.0f}pt")

    intro_txt = (c.get("intro_en") if EN else c.get("intro_zh")) or PEND
    if EN:
        tax_rows = [("Order", f["order"] or PEND), ("Family", f["family"] or PEND),
                    ("Genus", (f["sci"].split()[0] if f["sci"] else PEND)),
                    ("Species", f["sci"] or PEND),
                    ("IUCN", (c.get("iucnEn") or c.get("iucn")) or PEND),
                    ("eBird", f["code"] or PEND)]
    else:
        tax_rows = [("界", "動物界 Animalia"), ("門", "脊索動物門 Chordata"), ("綱", "鳥綱 Aves"),
                    ("目", f"{f['orderZh']} {f['order']}"), ("科", f"{f['familyZh']} {f['family']}"),
                    ("屬", (f["sci"].split()[0] if f["sci"] else PEND)),
                    ("種", f["sci"] or PEND),
                    ("IUCN", (c.get("iucnEn") or c.get("iucn")) or PEND),
                    ("eBird", f["code"] or PEND)]

    picks = choose_fields(c, lang=lang)
    # 英文版：欄目標題與固定字都用英文（值已經由 fieldCopy 取 en）
    T = {"Range": "分佈地區", "Habitat": "棲息環境", "Diet": "食物", "Top 5": "Top 5 特色亮點"}
    def L_(fid, title_zh, title_en, icon, kind="p"):
        """列表用：英文版取 fieldCopy.en（陣列），中文版取 c[fid]；唔入選就回 None。"""
        if fid not in picks:
            return None
        if EN:
            fc = c.get("fieldCopy")
            if isinstance(fc, dict):
                fc = [dict(v, id=k) for k, v in fc.items()]
            hit = next((x for x in fc if isinstance(x, dict) and x.get("id") == fid), None) if isinstance(fc, list) else None
            v = (hit or {}).get("en")
            if isinstance(v, str) and v.strip():
                return [v]
            return None
        return c.get(fid)

    all_specs = {
        "range": ("Distribution" if EN else "分佈地區", "分", "p", V("range")),
        "habitat": ("Habitat" if EN else "棲息環境", "居", "p", V("habitat")),
        "diet": ("Diet" if EN else "食物", "食", "p", V("diet")),
        "highlights": ("Top 5 Highlights" if EN else "Top 5 特色亮點", "五", "l", L_("highlights", "Top 5", "Top 5", "五")),
        "look": ("Appearance" if EN else "外形特徵", "形", "p", V("look")),
        "breeding": ("Breeding" if EN else "成長與繁殖", "育", "p", V("breeding")),
        "funFact": ("Fun Fact" if EN else "有趣冷知識", "知", "p", V("funFact")),
        "tips": ("Field Tips" if EN else "觀察小貼士", "貼", "l", L_("tips", "觀察小貼士", "Field Tips", "貼")),
        "voice": ("Voice" if EN else "鳴聲", "聲", "p", V("voice")),
        "behavior": ("Behaviour" if EN else "行為習性", "行", "p", V("behavior")),
        "migration": ("Migration" if EN else "遷徙", "遷", "p", V("migration")),
        "conservation": ("Conservation" if EN else "保育現況", "保", "p", V("conservation")),
        "humanRelation": ("Birds & People" if EN else "人與鳥", "人", "p", V("humanRelation")),
        "etymology": ("Name Origin" if EN else "名稱由來", "名", "p", V("etymology")),
        "caution": ("Watch Out" if EN else "注意事項", "注", "l", L_("caution", "注意事項", "Watch Out", "注")),
    }
    # 選欄結果（field-schema.mjs）：有幾多印幾多，最多 7 格；主圖區已用嘅格子唔重複
    used_main = {"look"} if not has_photo else {"etymology"}
    grid_ids = [f for f in picks if f not in used_main and f in all_specs][:8]
    # 英文版：已入選但暫無英文原文 → 保留格位並印 "Data pending"（版面穩定，一眼看出缺什麼）
    grid_specs = [all_specs[f] for f in grid_ids] or [all_specs["range"], all_specs["diet"]]
    ROW1 = grid_specs[:4]
    ROW2 = grid_specs[4:8]
    # 唔夠 8 格時，用「隱形格」填滿，令四欄寬度唔會變（同 HTML 版一致）
    while len(ROW1) < 4:
        ROW1.append(("", "", "p", ""))
    while len(ROW2) < 4:
        ROW2.append(("", "", "p", ""))

    ICONS = {"分佈地區": "icons/range-asia.png", "棲息環境": "icons/habitat-park.png",
             "食物": "icons/food-insects.png", "成長與繁殖": "icons/nest-eggs.png",
             "有趣冷知識": "icons/song-notes.png"}
    ART_H = 54.0        # 欄底橫幅插圖高度（pt）
    ART_GAP = 8.0

    def need(spec, size, scale=1.0):
        """量度一格文字需要的高度（pt）。"""
        title, icon, kind, payload = spec
        fnt = F("r", size * scale)
        inner = (col_w - (48 if kind == "l" else 24)) * S
        h = 46 * scale
        if kind == "l":
            for it in (payload or [PENDING]):
                lines = wrap(d, it, fnt, inner)
                h += len(lines) * fnt.size * 1.5 / S + 3
        else:
            lines = wrap(d, payload or PEND, fnt, inner)
            h += len(lines) * fnt.size * 1.58 / S + 2
        if title in ICONS:
            h += ART_H + ART_GAP
        return h

    def row_need(row, size):
        return max(need(sp, size) for sp in row)

    ROW1_REAL = [sp for sp in ROW1 if sp[0]] or ROW1[:1]
    ROW2_REAL = [sp for sp in ROW2 if sp[0]]

    # 左欄「分類資訊」一定要有位（9 行 × 約 22pt + 標題）；先留起，其餘才給四欄
    gap_v = 10.0
    # 標題 44pt + 每行最少 20.5pt + 底部留白 8pt（之前寫死 210，9 行會爆出框外）
    tax_min = 44.0 + 20.5 * len(tax_rows) + 8.0
    if not ROW2_REAL:
        grid_budget = budget - gap_v - tax_min        # 只有一排：其餘全給它
    else:
        grid_budget = (budget - 2 * gap_v - tax_min) * 0.66
    size = 15.0
    while size > 10.5:
        n1 = row_need(ROW1_REAL, size) if ROW1_REAL else 0
        n2 = row_need(ROW2_REAL, size) if ROW2_REAL else 0
        if n1 + ((n2 + gap_v) if ROW2_REAL else 0) <= grid_budget:
            break
        size -= 0.5
    n1 = row_need(ROW1_REAL, size) if ROW1_REAL else 0
    n2 = row_need(ROW2_REAL, size) if ROW2_REAL else 0
    need_total = n1 + ((n2 + gap_v) if ROW2_REAL else 0)
    extra = max(0.0, grid_budget - need_total)
    if not ROW2_REAL:
        # 只有一排：四欄區同左欄「分類資訊」對齊同高，右邊唔會留下一大片空白
        total = budget - gap_v
        r1_h = max(n1 + 24.0, total * 0.46)
        tax_h = total - r1_h
        if tax_h < tax_min:                            # 分類資訊優先保住
            tax_h = tax_min
            r1_h = total - tax_h
        if r1_h < n1 + 12.0:                           # 文字優先，勉強夠位就夠
            r1_h = n1 + 12.0
            tax_h = max(total - r1_h, 140.0)
        r2_h = 0.0
    else:
        r1_h = n1 + extra * 0.42
        r2_h = n2 + extra * 0.58
        tax_h = r1_h + gap_v + r2_h                   # 左欄同右邊兩排對齊
    tax_h = max(tax_h, tax_min)
    print(f"   字級 {size}pt｜第一行 {n1:.0f}pt／第二行 {n2:.0f}pt／預算 {budget:.0f}pt｜"
          f"top_y={top_px / S:.0f} r1={r1_h:.0f} r2={r2_h:.0f} tax={tax_h:.0f} col_w={col_w:.0f}")

    def box(spec, i, y0, h, y_pt_scale=1.0):
        title, icon, kind, payload = spec
        bx = (grid_x + i * (col_w + 10.0)) * S
        bw = col_w * S
        if not title:
            return bx          # 隱形格：只留位置，唔畫框（同 HTML 版 visibility:hidden 一致）
        d.rounded_rectangle([bx, y0, bx + bw, y0 + h * S], 16 * S, fill=(255, 255, 255),
                            outline=LINE, width=2 * S)
        section_head(d, bx + 12 * S, y0 + 10 * S, title, icon)
        fnt = F("r", size)
        by = y0 + 46 * S + 2 * S
        if kind == "l":
            for n, it in enumerate(payload or [PENDING], 1):
                d.ellipse([bx + 12 * S, by + 3 * S, bx + 30 * S, by + 21 * S], fill=GREEN)
                d.text((bx + 21 * S, by + 12 * S), str(n), font=F("bold", 13), fill=(255, 255, 255), anchor="mm")
                by = para(d, bx + 36 * S, by, it, bw - 48 * S, fnt, INK2, 1.5) + 3 * S
        else:
            para(d, bx + 12 * S, by, payload or PEND, bw - 24 * S, fnt, INK2, 1.58)
        art = ICONS.get(title)
        if art:
            aw = int(bw - 16 * S)
            ah = int(ART_H * S)
            il = _art(art, (aw, ah))
            if il:
                ay = int(y0 + h * S - ART_GAP * S - ah)
                img.paste(il, (int(bx + 8 * S), ay), radius_mask((aw, ah), 8 * S))
        return bx

    # ── 5. 左欄：基本介紹 + 分類資訊（高度對齊右邊兩行）─────────
    top_y = top_px
    d.rounded_rectangle([M, top_y, M + left_w * S, top_y + r1_h * S], 18 * S,
                        fill=(255, 255, 255), outline=LINE, width=2 * S)
    d.rounded_rectangle([M, top_y, M + left_w * S, top_y + 34 * S], 18 * S, fill=GREEN)
    d.text((M + 52 * S, top_y + 17 * S), (EN and "Introduction" or "基本介紹"), font=F("b", 20), fill=(255, 255, 255), anchor="lm")
    d.ellipse([M + 12 * S, top_y + 6 * S, M + 40 * S, top_y + 34 * S], fill=(255, 255, 255))
    para(d, M + 14 * S, top_y + 46 * S, intro_txt, (left_w - 28) * S, F("r", 17), INK2, 1.62)

    y2 = top_y + r1_h * S + (10 * S if tax_h else 0)
    d.rounded_rectangle([M, y2, M + left_w * S, y2 + tax_h * S], 18 * S,
                        fill=(255, 255, 255), outline=LINE, width=2 * S)
    d.rounded_rectangle([M, y2, M + left_w * S, y2 + 34 * S], 18 * S, fill=GREEN)
    d.text((M + 52 * S, y2 + 17 * S), (EN and "Taxonomy" or "分類資訊"), font=F("b", 20), fill=(255, 255, 255), anchor="lm")
    d.ellipse([M + 12 * S, y2 + 6 * S, M + 40 * S, y2 + 34 * S], fill=(255, 255, 255))
    step = min(30.0, max(18.5, (tax_h - 56) / max(len(tax_rows), 1)))
    ty = y2 + (44 + max(0.0, (tax_h - 52 - step * len(tax_rows)) / 2)) * S
    sep = ": " if EN else "："
    for k, v in tax_rows:
        lab = f"● {k}{sep}"
        d.text((M + 16 * S, ty), lab, font=F("bold", 16), fill=GREEN_D, anchor="la")
        lab_w = d.textlength(lab, font=F("bold", 16))
        d.text((M + 16 * S + lab_w, ty), v, font=F("r", 16), fill=INK2, anchor="la")
        ty += step * S

    # ── 6. 兩排四欄 ─────────────────────────────────────────
    for i, sp in enumerate(ROW1):
        box(sp, i, top_y, r1_h)
    y3 = top_y + r1_h * S + (10 * S if r2_h else 0)
    for i, sp in enumerate(ROW2):
        box(sp, i, y3, r2_h)

    # ── 7. 生態價值評分卡 ────────────────────────────────────
    # 位置要避開「左欄分類資訊」與「四欄」兩者中較低的一個
    grid_bottom = y3 + r2_h * S
    left_bottom = top_y + (r1_h + (gap_v if tax_h else 0) + tax_h) * S
    y4 = max(grid_bottom, left_bottom) + 10 * S
    # 評分卡高度自適應：填滿到底欄為止（最少 140pt，最多 200pt），避免底部一大片空白
    foot_top = Hc * S - M - 34 * S - 8 * S
    score_h = max(140 * S, min(200 * S, foot_top - y4))
    right_w = 236 * S
    d.rounded_rectangle([M, y4, Wc * S - M - right_w - 10 * S, y4 + score_h], 18 * S,
                        fill=(255, 255, 255), outline=LINE, width=2 * S)
    bar_w = (250 if EN else 190) * S
    d.rounded_rectangle([M, y4, M + bar_w, y4 + 34 * S], 18 * S, fill=GREEN)
    d.text((M + 60 * S, y4 + 17 * S), ("Ecological Value" if EN else "生態價值評分卡"), font=F("b", 19), fill=(255, 255, 255), anchor="lm")
    scores = c.get("scores") or {}
    notes = c.get("score_notes") or {}
    keys = list(scores.keys())[:5]
    cell = (Wc * S - 2 * M - right_w - 10 * S - 28 * S) / max(len(keys), 1)
    for i, k in enumerate(keys):
        bx = M + 14 * S + i * cell
        d.text((bx + cell / 2, y4 + 46 * S), notes.get(k, ""), font=F("r", 12), fill=SUB, anchor="ma")
        d.text((bx + cell / 2, y4 + 70 * S), k, font=F("bold", 16), fill=GREEN_D, anchor="ma")
        stars(d, img, bx + cell / 2 - 2.5 * 18 * S, y4 + 94 * S, float(scores[k]), 15)
        d.text((bx + cell / 2, y4 + 124 * S), f"{scores[k]} / 5", font=F("bold", 14), fill=INK2, anchor="mm")

    # 綜合評分
    rx1 = Wc * S - M - right_w
    avg = round(sum(float(v) for v in scores.values()) / len(scores), 1) if scores else 0
    d.rounded_rectangle([rx1, y4, Wc * S - M, y4 + score_h], 18 * S, fill=GREEN, outline=GREEN_D, width=2 * S)
    d.text((rx1 + right_w / 2, y4 + 22 * S), (EN and "Overall" or "綜合評分"), font=F("b", 20), fill=(255, 255, 255), anchor="mm")
    if scores:
        d.text((rx1 + 96 * S, y4 + 78 * S), f"{avg}", font=F("b", 50), fill=(240, 200, 40), anchor="mm")
        d.text((rx1 + 150 * S, y4 + 92 * S), "/ 5", font=F("bold", 18), fill=(220, 238, 230), anchor="lm")
        stars(d, img, rx1 + 96 * S - 2.5 * 22 * S, y4 + 106 * S, avg, 19, 4)
    else:
        d.text((rx1 + right_w / 2, y4 + 86 * S), PEND, font=F("b", 22), fill=(240, 200, 40), anchor="mm")

    # ── 8. 底欄 ─────────────────────────────────────────────
    y5 = Hc * S - M - 34 * S
    d.rounded_rectangle([M, y5, Wc * S - M, Hc * S - M], 10 * S, fill=GREEN)
    d.text((M + 16 * S, y5 + 17 * S), (f"Dex no.  NO.{f['id']}" if EN else f"圖鑑編號  NO.{f['id']}"),
           font=F("bold", 15), fill=(255, 255, 255), anchor="lm")
    name_txt = (f"{f['en']} ({f['sci']})" if EN else f"{f['zh']}（{f['sci']}）")
    d.text((Wc * S / 2, y5 + 17 * S), (f"Name: {name_txt}" if EN else f"名稱：{name_txt}"),
           font=F("bold", 15), fill=(255, 255, 255), anchor="mm")
    d.text((Wc * S - M - 140 * S, y5 + 17 * S), ("Dex version: v1.8" if EN else "圖鑑版本：v1.8"),
           font=F("r", 14), fill=(222, 238, 230), anchor="rm")
    bx = Wc * S - M - 128 * S
    seed = sum(ord(ch) for ch in f["id"] + f["code"])
    for i in range(26):
        bw = 1 + ((seed >> (i % 7)) + i * 5) % 3
        d.rectangle([bx, y5 + 5 * S, bx + bw * S, y5 + 29 * S], fill=(255, 255, 255))
        bx += (bw + 1.6) * S

    # 註腳（來源／主觀評分說明）—— 印在底欄上方一行小字
    note = c.get("facts_note") or ""
    if note:
        d.text((M + 2 * S, y5 - 16 * S), note, font=F("r", 11), fill=(146, 164, 154), anchor="ls")

    return img.resize((Wc, Hc), Image.LANCZOS)


if __name__ == "__main__":
    main()
