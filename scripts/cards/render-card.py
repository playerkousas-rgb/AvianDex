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

 用法：
   python3 scripts/cards/render-card.py 0290
   python3 scripts/cards/render-card.py --all
   python3 scripts/cards/render-card.py 0290 --preview    # 只出 PNG 預覽，唔出 AVIF

 輸出：
   cards/out/<ID>.avif     ← 上傳到 R2 的成品（AVIF，體積最細）
   cards/out/<ID>.png      ← 預覽圖（同名 PNG，方便肉眼核對）
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
OUT_DIR = os.path.join(ROOT, "cards", "out")
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
        if draw.textlength(trial, font=f) > max_w and cur:
            cut = cur.rfind(" ")
            if cut > len(cur) * 0.5:
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
        "rank": (tax or {}).get("taxonOrder"),
        "copy": copy,
    }


PENDING = "資料待查"


def pick(copy, key):
    v = (copy.get(key) or "").strip()
    return v if v else PENDING


# ---------------------------------------------------------------- 繪製
def render(f):
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
    order_zh = (f["copy"].get("orderZh") or "").strip()
    family_zh = (f["copy"].get("familyZh") or "").strip()
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
    ap.add_argument("--preview", action="store_true", help="只出 PNG")
    ap.add_argument("--quality", type=int, default=58, help="AVIF 品質（預設 58，約 100–200 KB）")
    args = ap.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    ids = list(args.ids)
    if args.all:
        ids = sorted(p[:-4] for p in os.listdir(ART_DIR) if p.endswith(".png"))

    for raw in ids:
        bird_id = str(raw).strip()
        if not bird_id.isdigit():
            print(f"✗ 跳過 {raw}（編號要係數字）")
            continue
        bird_id = bird_id.zfill(4)
        f = build_facts(bird_id)
        img = render(f)
        png_path = os.path.join(OUT_DIR, f"{bird_id}.png")
        img.save(png_path, optimize=True)
        if args.preview:
            print(f"🖼  {bird_id} {f['zh']} → {os.path.relpath(png_path, ROOT)}")
            continue

        avif_path = os.path.join(OUT_DIR, f"{bird_id}.avif")
        # 用 ImageMagick 寫 AVIF（libheif 1.15，支援 AV1）；比 Pillow plugin 穩定
        subprocess.run(
            ["convert", png_path, "-quality", str(args.quality), "-define", "heic:speed=6", avif_path],
            check=True,
        )
        png_kb = os.path.getsize(png_path) / 1024
        avif_kb = os.path.getsize(avif_path) / 1024
        print(f"✅ {bird_id} {f['zh']} / {f['en']}")
        print(f"   PNG {png_kb:.0f} KB → AVIF {avif_kb:.0f} KB（省 {100 - avif_kb / png_kb * 100:.0f}%）")
        print(f"   {os.path.relpath(avif_path, ROOT)}")


if __name__ == "__main__":
    main()
