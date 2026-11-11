#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把圖鑑資訊卡真正畫成 PNG —— 給「我睇極都係舊卡」的情況用。

為甚麼要有這支？
  用戶反映他一直只看到部署在 main 的舊卡，看不到分支上的新版。
  HTML 預覽在沙盒裡也看不到，所以我直接把卡**畫成圖片**，
  一眼就見到排版，不需要任何瀏覽器。

做法：
  · 版面數字與 src/lib/dexCardLayout.ts 對齊（1200×1600）
  · 文字全部來自 repo 內已核實的 JSON，一個字都不改寫
  · 插畫用 R2 birdcards（拿不到就用編號佔位，不畫假鳥）
  · 中文字型用 Noto Sans TC（400/700/900）

用法：python3 scripts/render-card-png.py 0013 [輸出路徑]
"""
import json
import math
import os
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = "/tmp/fonts"

W, H = 1200, 1600

# ── 23 個目的配色（與 dexCard.ts 的 ORDER_THEME 一致）──
ORDER_THEME = {
    "Passeriformes": ("#17553c", "#f3f7f1", "#d8a21c"),
    "Charadriiformes": ("#4a6b3a", "#f6f5ec", "#c9a227"),
    "Anseriformes": ("#1d5c72", "#eef6f8", "#2f9fb8"),
    "Accipitriformes": ("#7a3b22", "#fbf1ea", "#c4661f"),
    "Pelecaniformes": ("#2c5b52", "#eef5f2", "#4f9d86"),
    "Cuculiformes": ("#5a5130", "#f8f5e9", "#a08a2e"),
    "Gruiformes": ("#3f5347", "#f0f4f0", "#7d9c6a"),
    "Columbiformes": ("#4b556b", "#f2f4f8", "#7c8aa8"),
    "Strigiformes": ("#3b2f57", "#f3f0f8", "#7a63a8"),
    "Coraciiformes": ("#155e6b", "#ecf7f8", "#17a2b8"),
    "Suliformes": ("#204a63", "#eef4f8", "#3d7ea6"),
    "Piciformes": ("#6b4423", "#faf3ea", "#b5772f"),
    "Apodiformes": ("#2f4858", "#f0f5f8", "#5d8aa0"),
    "Procellariiformes": ("#1c3f57", "#edf3f7", "#48799c"),
    "Psittaciformes": ("#1f6448", "#eef7f1", "#e0a92b"),
    "Podicipediformes": ("#2a5a63", "#eef6f7", "#4f939c"),
    "Falconiformes": ("#733527", "#fbf1ee", "#b8632f"),
    "Galliformes": ("#5c4322", "#f8f3e8", "#a98030"),
    "Gaviiformes": ("#274b5e", "#eff4f7", "#4c7f96"),
    "Caprimulgiformes": ("#4a3d33", "#f7f3ee", "#8d7560"),
    "Ciconiiformes": ("#6a2f33", "#fbf1f1", "#a85a5e"),
    "Bucerotiformes": ("#7a5a14", "#faf6e8", "#c19a22"),
    "Phaethontiformes": ("#7a4b6b", "#fbf2f7", "#b06a94"),
}
FALLBACK = ("#17553c", "#f4f6f2", "#d8a21c")

IUCN = [
    ("LC", "無危", "Least Concern", "#1c7a4e"),
    ("NT", "近危", "Near Threatened", "#8a7c12"),
    ("VU", "易危", "Vulnerable", "#a87413"),
    ("EN", "瀕危", "Endangered", "#b04a1e"),
    ("CR", "極危", "Critically Endangered", "#8f1f22"),
]

DIET_ZH = {
    "insect": "昆蟲", "fish": "魚類", "amphibian": "蛙類", "reptile": "爬蟲類",
    "crustacean": "蟹蝦", "mollusc": "螺貝", "worm": "蠕蟲", "spider": "蜘蛛",
    "fruit": "果實", "seed": "種子穀物", "nectar": "花蜜", "bud": "嫩芽花葉",
    "carrion": "腐肉", "rodent": "鼠類", "bird": "其他鳥類", "plant": "植物藻類",
    "omnivore": "雜食",
}
HABITAT_ZH = {
    "forest": "森林", "wetland": "濕地", "water": "水邊", "grassland": "草地農田",
    "urban": "城市公園", "mountain": "山地", "open": "開闊地",
}

PENDING = "資料待查"


def hx(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def font(size, weight=400):
    name = {400: "400Regular", 700: "700Bold", 900: "900Black"}.get(weight, "400Regular")
    return ImageFont.truetype(os.path.join(FONT_DIR, f"NotoSansTC_{name}.ttf"), size)


def load():
    def j(p):
        with open(os.path.join(ROOT, p), encoding="utf-8") as f:
            return json.load(f)

    return {
        "idx": j("src/data/explorerIndex.json"),
        "zh": j("src/data/cardDetails.zh.json")["birds"],
        "en": j("src/data/cardDetails.en.json")["birds"],
        "meas": j("src/data/measurements.json"),
        "scores": j("src/data/dexScores.json")["scores"],
        "src": j("src/data/cardSources.json")["sources"],
        "pkg": j("package.json")["version"],
    }


def wrap(text, fnt, max_w, draw):
    """按像素寬度斷行（中文逐字、英文逐詞）"""
    lines, cur = [], ""
    is_cjk = any("\u4e00" <= ch <= "\u9fff" for ch in text)
    units = list(text) if is_cjk else text.split(" ")
    for u in units:
        trial = cur + u if is_cjk else (cur + " " + u if cur else u)
        if draw.textlength(trial, font=fnt) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = u
    if cur:
        lines.append(cur)
    return lines


def bullets(text, max_chars=110, max_points=3):
    """收到句末的列點；不改寫、不刪字（原文照登，超出才收在句末）"""
    text = (text or "").strip()
    if not text:
        return []
    if len(text) <= max_chars:
        return [text]
    parts, buf = [], ""
    for ch in text:
        buf += ch
        if ch in "。！？":
            parts.append(buf.strip())
            buf = ""
    if buf.strip():
        parts.append(buf.strip())
    if len(parts) <= 1:
        cut = text[:max_chars]
        k = max(cut.rfind("，"), cut.rfind("；"))
        return [cut[: k + 1] if k > max_chars * 0.5 else cut.rstrip() + "…"]
    out = parts[: max_points]
    if len(parts) > max_points:
        out = parts[: max_points - 1]
        rest = "".join(parts[max_points - 1:])
        out.append(rest[:max_chars].rstrip() + "…" if len(rest) > max_chars else rest)
    return out


LOCAL_ART = "/tmp/arena-coding-uploads/八哥.png"   # 用戶原版卡（1024×1536）作離線插畫來源


def art_from_local(bird_id, key=None):
    """
    沙盒連不到 r2.dev，但用戶的原版卡就在手邊。
    從原版卡裁出「主插畫」那一塊（左上像素圖與中間相片之間的那張），
    只用來做版面預覽，不會當成新素材上線。
    """
    if key != "0013" or not os.path.exists(LOCAL_ART):
        return None
    try:
        im = Image.open(LOCAL_ART).convert("RGB")
        sx, sy = im.width / 1024, im.height / 1536
        # 原版主相片區：x 到 690 就停，否則會把右邊 4 個特徵圓圈與引線一齊裁入
        box = (int(302 * sx), int(186 * sy), int(600 * sx), int(806 * sy))
        return im.crop(box)
    except Exception:  # noqa: BLE001
        return None


def art_image(bird_id, key=None):
    url = f"https://pub-a9333a974e814ccba1994639b6e79266.r2.dev/birdcards/{bird_id}.avif"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AvianDex/1.0"})
        data = urllib.request.urlopen(req, timeout=25).read()
        from io import BytesIO
        im = Image.open(BytesIO(data)).convert("RGB")
        return im
    except Exception as e:  # noqa: BLE001
        local = art_from_local(bird_id, key)
        if local is not None:
            print(f"  · r2 拿不到（{e.__class__.__name__}），改用用戶原版卡的插畫位置")
            return local
        print(f"  ⚠ 插畫拿不到（{e.__class__.__name__}），用編號佔位")
        return None


def draw_star(d, cx, cy, r, filled, color, outline):
    pts = []
    for i in range(10):
        rad = r if i % 2 == 0 else r * 0.44
        a = math.pi / 5 * i - math.pi / 2
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    d.polygon(pts, fill=color if filled else None, outline=outline)
    if not filled:
        d.line(pts + [pts[0]], fill=outline, width=2)


def draw_pokeball(d, cx, cy, r, color, white="white"):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=6, fill=white)
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 180, 360, fill=color)
    d.rectangle([cx - r, cy - 4, cx + r, cy + 4], fill=color)
    d.ellipse([cx - r * .34, cy - r * .34, cx + r * .34, cy + r * .34],
              fill=white, outline=color, width=5)
    d.ellipse([cx - r * .12, cy - r * .12, cx + r * .12, cy + r * .12], fill=color)


def render(bird_id, out_path, imagekey=None):
    key = imagekey or bird_id
    data = load()
    e = data["idx"]["birds"][bird_id]
    zh = data["zh"].get(bird_id, {})
    en = data["en"].get(bird_id, {})
    m = data["meas"].get(bird_id, {})
    score = data["scores"].get(bird_id, {})

    c, t, a = ORDER_THEME.get(e["o"], FALLBACK)
    C, T, A = hx(c), hx(t), hx(a)

    img = Image.new("RGB", (W, H), T)
    d = ImageDraw.Draw(img)

    # ══════════ ① 主圖：插畫在左、文字在右 ══════════
    POSTER_H = 754
    SPLIT = 700                       # 插畫佔 0..SPLIT；文字由 SPLIT 起
    art = art_image(key, key)
    d.rectangle([0, 0, W, POSTER_H], fill=C)
    if art is not None:
        # 插畫是直幅：以寬度貼合，垂直對齊偏上（保住頭部與身體）
        ratio = max(SPLIT / art.width, POSTER_H / art.height)
        aw, ah = int(art.width * ratio) + 1, int(art.height * ratio) + 1
        art = art.resize((aw, ah), Image.LANCZOS)
        left = max(0, (aw - SPLIT) // 2)
        top = int((ah - POSTER_H) * 0.18)
        img.paste(art.crop((left, top, left + SPLIT, top + POSTER_H)), (0, 0))
        # 相片右邊漸層，令文字欄同相片無縫
        FW = 300                     # 由 SPLIT-FW 開始淡入文字欄底色
        seam = Image.new("RGBA", (FW + 10, POSTER_H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(seam)
        for x in range(FW + 10):
            sd.line([(x, 0), (x, POSTER_H)],
                    fill=(C[0], C[1], C[2], int(255 * (x / FW) ** 0.62)))
        img.paste(Image.alpha_composite(
            img.crop((SPLIT - FW, 0, SPLIT + 10, POSTER_H)).convert("RGBA"), seam).convert("RGB"),
            (SPLIT - FW, 0))
    else:
        d.text((SPLIT // 2, POSTER_H // 2), f"NO.{bird_id}", font=font(46, 900),
               fill=(255, 255, 255), anchor="mm")

    # 文字欄底色漸層（右邊要夠暗）
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for x in range(W):
        p = x / W
        alpha = 0 if p < 0.28 else int(255 * min(1, (p - 0.28) / 0.24) ** 1.0)
        vd.line([(x, 0), (x, POSTER_H)], fill=(C[0] // 3, C[1] // 3, C[2] // 3, int(alpha * 0.95)))
    # 底部一小段，令主圖與資料帶接順
    for y in range(int(POSTER_H * 0.86), POSTER_H):
        q = max(0.0, (y - POSTER_H * 0.86) / (POSTER_H * 0.14))
        vd.line([(0, y), (W, y)], fill=(C[0] // 3, C[1] // 3, C[2] // 3, int(120 * q ** 1.4)))
    img = Image.alpha_composite(img.convert("RGBA"), veil).convert("RGB")
    d = ImageDraw.Draw(img)

    # 品牌 + 目徽章 + 編號
    draw_pokeball(d, 52, 47, 15, (255, 255, 255), white=(255, 255, 255))
    d.text((78, 47), "AVIANDEX", font=font(13, 900), fill="white", anchor="lm")
    bx, by = 196, 47
    d.ellipse([bx - 22, by - 22, bx + 22, by + 22], fill="white")
    d.text((bx, by), e["oz"][:1], font=font(22, 900), fill=C, anchor="mm")
    d.text((bx + 30, by), e["oz"], font=font(13, 700), fill=(228, 236, 231), anchor="lm")
    d.text((W - 40, 47), f"NO.{bird_id}", font=font(19, 900), fill="white", anchor="rm")

    # 名稱區（右欄，垂直居中）
    TX = SPLIT + 44
    NAME_Y = POSTER_H // 2 - 160
    d.text((TX, NAME_Y), e["z"], font=font(72, 900), fill="white")
    d.text((TX + 2, NAME_Y + 84), e["s"], font=font(17, 400), fill=(226, 234, 229))
    en_txt = e["e"]
    tw = d.textlength(en_txt, font=font(17, 700))
    d.rounded_rectangle([TX, NAME_Y + 120, TX + tw + 34, NAME_Y + 154], 17, fill="white")
    d.text((TX + 17, NAME_Y + 137), en_txt, font=font(17, 700), fill=C, anchor="lm")
    tag = f"{e['oz']} · {e['fz']}"
    tw2 = d.textlength(tag, font=font(14, 700))
    d.rounded_rectangle([TX + tw + 44, NAME_Y + 120, TX + tw + 44 + tw2 + 24, NAME_Y + 154],
                        17, outline=(255, 255, 255), width=2)
    d.text((TX + tw + 56, NAME_Y + 137), tag, font=font(14, 700), fill="white", anchor="lm")

    # 引言（原文第一句，不改寫）
    quote = (zh.get("look") or zh.get("range") or "").strip()
    if quote:
        first = quote.split("。")[0]
        if len(first) > 40:
            first = first[:40] + "…"
        else:
            first += "。"
        qy = NAME_Y + 182
        d.rectangle([TX, qy, TX + 5, qy + 88], fill=A)
        for i, line in enumerate(wrap(first, font(14, 400), W - TX - 46, d)[:4]):
            d.text((TX + 18, qy + i * 22), line, font=font(14, 400), fill=(240, 245, 241))

    # 文字欄底部：插畫與資料出處（真實來源）
    d.text((TX, POSTER_H - 40), "插畫 ILLUSTRATION · BIRD-DEX 2", font=font(10, 700),
           fill=(168, 190, 176))
    d.text((TX, POSTER_H - 25), "資料 zh / en.wikipedia · eBird/Clements", font=font(10, 400),
           fill=(140, 164, 150))

    # ══════════ ② 資料帶 ══════════
    STAT_H = 96
    y0 = POSTER_H
    d.rectangle([0, y0, W, y0 + STAT_H], fill="white")
    d.line([0, y0 + STAT_H, W, y0 + STAT_H], fill=(230, 232, 228), width=2)
    bw = W // 4
    len_txt = f"{e['len']}" if e.get("len") else PENDING
    mass_txt = str(m.get("mass", "—")).rstrip("g ").strip() or "—"
    iucn_raw = zh.get("iucn", "")
    iucn_hit = next((x for x in IUCN if x[1] in iucn_raw or x[0] in iucn_raw), None)

    cells = [
        ("身長  LENGTH", f"{len_txt}", "cm", None),
        ("體重  MASS", mass_txt, "g", None),
        ("保育級別  IUCN", (iucn_hit[1] if iucn_hit else PENDING), "", iucn_hit),
        ("圖鑑評分  DEX RATING", f"{score.get('o', '—')}", "/5", "stars"),
    ]
    for i, (lab, val, unit, extra) in enumerate(cells):
        x = i * bw + 22
        d.text((x, y0 + 18), lab, font=font(11, 700), fill=(125, 141, 133))
        if extra is None:
            fs = 30 if len(str(val)) <= 5 else 21
            d.text((x, y0 + 38 + (30 - fs) // 2), val, font=font(fs, 900), fill=C)
            if unit:
                d.text((x + d.textlength(val, font=font(30, 900)) + 6, y0 + 54),
                       unit, font=font(12, 700), fill=(147, 160, 153))
        elif extra == "stars":
            d.text((x, y0 + 36), val, font=font(30, 900), fill=C)
            d.text((x + 52, y0 + 58), "/5", font=font(12, 700), fill=(147, 160, 153))
            star_y = y0 + 78
            try:
                ov = float(val)
            except ValueError:
                ov = 0
            for s in range(5):
                draw_star(d, x + 120 + s * 17, star_y, 7,
                          ov >= s + 1, A, (200, 200, 195))
        else:
            d.ellipse([x, y0 + 46, x + 13, y0 + 59], fill=hx(extra[3]))
            d.text((x + 20, y0 + 36), val, font=font(24, 900), fill=hx(extra[3]))

    # ══════════ ③ 三欄：棲地食性 / 量度 / 分佈 ══════════
    ROW2_Y = y0 + STAT_H + 16
    ROW2_H = 250
    M = 26
    gap = 14
    w1 = int((W - M * 2 - gap * 2) * 0.36)
    w2 = int((W - M * 2 - gap * 2) * 0.28)
    w3 = W - M * 2 - gap * 2 - w1 - w2

    def pane(x, y, w, h, title):
        d.rounded_rectangle([x, y, x + w, y + h], 14, fill="white",
                            outline=(232, 234, 230), width=2)
        d.rectangle([x + 14, y + 36, x + w - 14, y + 38], fill=(238, 240, 236))
        d.text((x + 16, y + 12), title, font=font(15, 900), fill=C)

    # ── 棲地 + 食性 + 分類
    x1 = M
    pane(x1, ROW2_Y, w1, ROW2_H, "棲地與食性  HABITAT & DIET")
    yy = ROW2_Y + 50
    for label, ids, table in (("住", e.get("h", []), HABITAT_ZH), ("食", e.get("d", []), DIET_ZH)):
        d.text((x1 + 16, yy + 4), label, font=font(12, 900), fill=(150, 164, 156))
        cx, cy = x1 + 46, yy
        for tid in ids:
            name = table.get(tid, tid)
            tw = d.textlength(name, font=font(13, 700))
            if cx + tw + 24 > x1 + w1 - 14:
                cx, cy = x1 + 46, cy + 30
            d.rounded_rectangle([cx, cy, cx + tw + 22, cy + 26], 13, fill=C)
            d.text((cx + 11, cy + 13), name, font=font(13, 700), fill="white", anchor="lm")
            cx += tw + 30
        yy = cy + 34
    # 食物（真實欄位 zh.diet，之前未用過）
    food = (zh.get("diet") or "").strip()
    if food:
        fy = yy + 2
        d.text((x1 + 16, fy), "食物 FOOD", font=font(10, 900), fill=(150, 164, 156))
        fy += 14
        for line in wrap(food[:46], font(10, 400), w1 - 32, d)[:2]:
            d.text((x1 + 16, fy), line, font=font(10, 400), fill=(70, 92, 82))
            fy += 13
        yy = fy + 2

    # 遷徙 / 人與鳥（真實欄位，二選一，標題跟住內容換）
    mig = (zh.get("migration") or "").strip()
    hum = (zh.get("humanRelation") or "").strip()
    note_title, note = ("遷徙 MIGRATION", mig) if mig else ("人與鳥 PEOPLE", hum)
    LIMIT = ROW2_Y + ROW2_H - 50      # 唔可以踩到下面的目／科／屬
    if note and yy + 40 < LIMIT:
        ny = yy + 2
        d.text((x1 + 16, ny), note_title, font=font(10, 900), fill=(150, 164, 156))
        ny += 14
        for line in wrap(note[:64], font(10, 400), w1 - 32, d)[:3]:
            if ny + 13 > LIMIT:
                break
            d.text((x1 + 16, ny), line, font=font(10, 400), fill=(52, 72, 63))
            ny += 13

    # 分類：目科屬種
    d.line([x1 + 14, ROW2_Y + ROW2_H - 74, x1 + w1 - 14, ROW2_Y + ROW2_H - 74],
           fill=(226, 229, 224), width=2)
    tax = [("目", e["oz"]), ("科", e["fz"]), ("屬", e["s"].split()[0])]
    tx = x1 + 16
    ty = ROW2_Y + ROW2_H - 62
    for k, v in tax:
        d.text((tx, ty), k, font=font(11, 700), fill=(163, 176, 168))
        d.text((tx + 14, ty - 2), v, font=font(13, 900), fill=(36, 58, 47))
        tx += 20 + d.textlength(v, font=font(13, 900)) + 16

    # ── 量度
    x2 = x1 + w1 + gap
    pane(x2, ROW2_Y, w2, ROW2_H, "量度  MEASUREMENTS")
    defs = [("翼長", "wing"), ("尾長", "tail"), ("嘴峰", "bill"), ("跗蹠", "tarsus")]
    vals = []
    for _, k in defs:
        try:
            vals.append(float(str(m.get(k, 0)).replace("mm", "").strip() or 0))
        except ValueError:
            vals.append(0)
    mx = max(vals + [1])
    my = ROW2_Y + 54
    for (lab, _), v in zip(defs, vals):
        d.text((x2 + 16, my), lab, font=font(12, 700), fill=(74, 96, 87))
        bx0 = x2 + 62
        bx1 = x2 + w2 - 62
        d.rounded_rectangle([bx0, my + 3, bx1, my + 11], 4, fill=(236, 238, 234))
        if v:
            d.rounded_rectangle([bx0, my + 3, bx0 + int((bx1 - bx0) * v / mx), my + 11], 4, fill=C)
        d.text((x2 + w2 - 14, my - 1), f"{v:g}" if v else "—", font=font(12, 900),
               fill=(61, 84, 73), anchor="ra")
        my += 32
    d.text((x2 + 16, ROW2_Y + ROW2_H - 30), "AVONET · BIRD-DEX 2",
           font=font(9, 400), fill=(168, 178, 172))

    # ── 分佈示意
    x3 = x2 + w2 + gap
    pane(x3, ROW2_Y, w3, ROW2_H, "分佈  RANGE")
    mapy = ROW2_Y + 46
    maph = 104
    d.rounded_rectangle([x3 + 14, mapy, x3 + w3 - 14, mapy + maph], 10, fill=(233, 239, 234))
    # 唔畫假的地理剪影；只標一句可追溯的來源
    d.text((x3 + 22, mapy + 16), "分佈文字據 zh / en wikipedia ·",
           font=font(10, 400), fill=(150, 166, 156))
    d.text((x3 + 22, mapy + 32), "地圖待接 eBird 觀測網格",
           font=font(10, 400), fill=(150, 166, 156))
    # 香港永遠在中心
    hkx = x3 + 14 + int((w3 - 28) * 0.70)
    hky = mapy + int(maph * 0.46)
    d.ellipse([hkx - 7, hky - 7, hkx + 7, hky + 7], fill="white", outline=C, width=2)
    d.ellipse([hkx - 3, hky - 3, hkx + 3, hky + 3], fill=A)
    d.text((hkx, hky - 15), "HK", font=font(11, 900), fill=(61, 75, 68), anchor="mm")
    # range 原文
    ry = mapy + maph + 8
    for line in wrap(zh.get("range", "")[:90] or PENDING, font(12, 400), w3 - 28, d)[:4]:
        d.text((x3 + 14, ry), line, font=font(12, 400), fill=(29, 43, 37))
        ry += 17
    ry += 3
    for line in wrap(en.get("range", "")[:150], font(10, 400), w3 - 28, d)[:4]:
        d.text((x3 + 14, ry), line, font=font(10, 400), fill=(122, 138, 130))
        ry += 14

    # ══════════ ④ 四格 ══════════
    ROW3_Y = ROW2_Y + ROW2_H + 14
    ROW3_H = 214
    n = 5
    pw = (W - M * 2 - gap * (n - 1)) // n
    panes = [
        ("外形  LOOK", zh.get("look"), en.get("look")),
        ("繁殖  BREEDING", zh.get("breeding"), en.get("breeding")),
        ("行為  BEHAVIOUR", zh.get("behavior"), en.get("behavior")),
        ("鳴聲  VOICE", zh.get("voice"), en.get("voice")),
        ("冷知識  FUN FACT", zh.get("funFact"), en.get("funFact")),
    ]
    for i, (title, zv, ev) in enumerate(panes):
        px = M + i * (pw + gap)
        pane(px, ROW3_Y, pw, ROW3_H, title)
        ty = ROW3_Y + 48
        # 中文列點（原文）
        for item in bullets(zv or "", max_chars=64, max_points=3):
            for line in wrap(item, font(13, 400), pw - 40, d)[:5]:
                if ty > ROW3_Y + ROW3_H - 66:
                    break
                d.ellipse([px + 16, ty + 8, px + 22, ty + 14], fill=C)
                d.text((px + 27, ty), line, font=font(13, 400), fill=(29, 43, 37))
                ty += 19
            ty += 2
        if not zv:
            d.text((px + 16, ty), PENDING, font=font(13, 400), fill=(141, 141, 134))
            ty += 20
        # 英文（較淺、較細）
        ty += 4
        for item in bullets(ev or "", max_chars=100, max_points=2):
            for line in wrap(item, font(11, 400), pw - 40, d)[:6]:
                if ty > ROW3_Y + ROW3_H - 20:
                    break
                d.text((px + 16, ty), line, font=font(11, 400), fill=(107, 125, 117))
                ty += 15

    # ══════════ ⑤ 評分帶 ══════════
    SCORE_Y = ROW3_Y + ROW3_H + 16
    SCORE_H = 170
    d.rounded_rectangle([M, SCORE_Y, W - M, SCORE_Y + SCORE_H], 16, fill=C)
    d.text((M + 20, SCORE_Y + 16), "圖鑑評分  DEX RATING", font=font(15, 900), fill="white")
    d.text((M + 210, SCORE_Y + 19), "自訂指標，非學術評分", font=font(10, 400), fill=(180, 200, 190))
    rows = [
        ("生物重要性", "i"), ("適應力", "a"), ("觀賞價值", "v"),
        ("研究價值", "r"), ("保育關注度", "c"),
    ]
    ry = SCORE_Y + 48
    for label, k in rows:
        v = score.get(k)
        d.text((M + 22, ry), label, font=font(12, 700), fill=(226, 234, 228))
        bx0, bx1 = M + 130, W - M - 260
        d.rounded_rectangle([bx0, ry + 3, bx1, ry + 12], 5, fill=(255, 255, 255, 60))
        if v is not None:
            d.rounded_rectangle([bx0, ry + 3, bx0 + int((bx1 - bx0) * v / 5), ry + 12], 5, fill=A)
        d.text((bx1 + 8, ry - 1), "—" if v is None else f"{v:.1f}",
               font=font(12, 900), fill="white")
        ry += 24
    # 精靈球總分
    d.line([W - M - 246, SCORE_Y + 24, W - M - 246, SCORE_Y + SCORE_H - 24],
           fill=(120, 150, 135), width=2)
    draw_pokeball(d, W - M - 196, SCORE_Y + SCORE_H // 2 - 12, 22, (255, 255, 255),
                  white=(255, 255, 255))
    ov = score.get("o")
    d.text((W - M - 160, SCORE_Y + 50), "—" if ov is None else f"{ov:.1f}",
           font=font(48, 900), fill="white")
    d.text((W - M - 74, SCORE_Y + 92), "/ 5", font=font(14, 700), fill=(196, 214, 204))

    # ══════════ ⑥ 底欄 ══════════
    FOOT_Y = H - 70
    d.rectangle([0, FOOT_Y, W, H], fill=(18, 39, 31))
    d.text((M, FOOT_Y + 22), f"NO.{bird_id}", font=font(15, 900), fill=A)
    d.text((M + 90, FOOT_Y + 20), f"{e['z']}", font=font(14, 700), fill="white")
    d.text((M + 90 + d.textlength(e["z"], font=font(14, 700)) + 8, FOOT_Y + 21),
           e["s"], font=font(12, 400), fill=(170, 190, 180))
    src = data["src"].get(bird_id, PENDING)
    one_line = src.replace("｜", "｜").strip()
    if d.textlength(one_line, font=font(9, 400)) > W - 420:
        while d.textlength(one_line, font=font(9, 400)) > W - 430 and len(one_line) > 20:
            one_line = one_line[:-2]
        one_line = one_line.rstrip(" ·，") + " …"
    d.text((M, FOOT_Y + 42), one_line, font=font(9, 400), fill=(150, 172, 160))
    d.text((W - M, FOOT_Y + 30), f"v{data['pkg']}", font=font(10, 700),
           fill=(130, 155, 142), anchor="rm")

    img.save(out_path, quality=95)
    print(f"已輸出 {out_path}  ({W}×{H})")


if __name__ == "__main__":
    bid = sys.argv[1] if len(sys.argv) > 1 else "0013"
    bid = bid.zfill(4)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, f"public/demo/card-{bid}-new.jpg")
    imgkey = sys.argv[3] if len(sys.argv) > 3 else None   # 示範第二隻時，可借用已下載到的插畫
    render(bid, out, imgkey)
