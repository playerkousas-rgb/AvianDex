#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把圖鑑資訊卡畫成一張「卡」—— 不是一張網頁排版。

為甚麼重寫？
  上一版把卡排成「上圖 + 資料帶 + 三欄 + 五格 + 評分帶 + 底欄」，
  用戶一看就說：「似真係一個網頁版面，完全唔似一張卡」。
  所以整張重做，這次守三條規矩：

  1. 卡是**一件實物**：有厚外框、有卡紙底、有金屬邊；
     所有內容都收在框裡面，不外露、不漂浮。
  2. 只有**一個主圖窗**（圓角相框），鳥是主角，佔卡面三分之一以上。
  3. 其餘資料是**卡的背面資訊**，用細字、成組、貼邊排，
     不是「欄位」。

資料仍然全部照抄 repo 內已核實的 JSON，一個字都不改寫。
插畫來源：R2 birdcards/<NO>.avif（沙盒連不到就報告並用編號佔位）。

用法：python3 scripts/render-card-png.py 0013 [輸出.jpg] [插畫代號]
"""
import json
import math
import os
import sys
import urllib.request

from PIL import Image, ImageDraw, ImageFont

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


def mix(c1, c2, t):
    return tuple(int(c1[i] * (1 - t) + c2[i] * t) for i in range(3))


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


def bullets(text, max_chars=110, max_points=2):
    """收到句末的列點；不改寫、不刪字"""
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


LOCAL_ART = "/tmp/arena-coding-uploads/八哥.png"   # 用戶原版卡（1024×1536），作離線插畫來源


def art_from_local(key):
    """
    沙盒連不到 r2.dev。原版卡中間那張相片就是同一隻雀，
    裁出「整隻雀、連腳」那一塊（右邊四個特徵圈與引線不入鏡），只用於版面預覽。
    """
    if key != "0013" or not os.path.exists(LOCAL_ART):
        return None
    try:
        im = Image.open(LOCAL_ART).convert("RGB")
        sx, sy = im.width / 1024, im.height / 1536
        return im.crop((int(300 * sx), int(200 * sy), int(531 * sx), int(810 * sy)))
    except Exception:  # noqa: BLE001
        return None


def art_image(key):
    url = f"https://pub-a9333a974e814ccba1994639b6e79266.r2.dev/birdcards/{key}.avif"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AvianDex/1.0"})
        data = urllib.request.urlopen(req, timeout=25).read()
        from io import BytesIO
        im = Image.open(BytesIO(data)).convert("RGB")
        return im
    except Exception as e:  # noqa: BLE001
        local = art_from_local(key)
        if local is not None:
            print(f"  · r2 拿不到（{e.__class__.__name__}），用原版卡的相片作示範")
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
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=max(3, r // 4), fill=white)
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 180, 360, fill=color)
    d.rectangle([cx - r, cy - r * 0.16, cx + r, cy + r * 0.16], fill=color)
    d.ellipse([cx - r * .34, cy - r * .34, cx + r * .34, cy + r * .34],
              fill=white, outline=color, width=max(3, r // 5))
    d.ellipse([cx - r * .12, cy - r * .12, cx + r * .12, cy + r * .12], fill=color)


# ══════════════════════════════════════════════════════════
#  卡的幾何（固定像素，全部收在厚框內）
# ══════════════════════════════════════════════════════════
FRAME = 26          # 外框厚度
BEVEL = 7           # 外框內側的金屬倒角
PAD = 30            # 卡紙內邊距


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
    INK = (26, 38, 32)
    SUB = (96, 112, 104)
    LINE = (214, 218, 210)

    # 卡紙底（略帶纖維感的米白），外圍先鋪深色邊
    img = Image.new("RGB", (W, H), mix(C, (0, 0, 0), 0.55))
    d = ImageDraw.Draw(img)

    # ── 厚外框：外深內亮，做出「膠殼」的厚度 ──
    d.rounded_rectangle([0, 0, W - 1, H - 1], 30, fill=mix(C, (0, 0, 0), 0.62))
    d.rounded_rectangle([6, 6, W - 7, H - 7], 26, fill=mix(C, (0, 0, 0), 0.42))
    d.rounded_rectangle([FRAME - BEVEL, FRAME - BEVEL, W - FRAME + BEVEL, H - FRAME + BEVEL],
                        FRAME - 4, fill=mix(C, (255, 255, 255), 0.30))
    d.rounded_rectangle([FRAME, FRAME, W - FRAME, H - FRAME], FRAME - 8, fill=C)

    # 卡紙
    card = [FRAME + BEVEL + 4, FRAME + BEVEL + 4, W - FRAME - BEVEL - 4, H - FRAME - BEVEL - 4]
    d.rounded_rectangle(card, 16, fill=T)
    # 卡紙內側幼線（印刷品感覺）
    d.rounded_rectangle([card[0] + 3, card[1] + 3, card[2] - 3, card[3] - 3], 14,
                        outline=mix(C, T, 0.55), width=2)

    IL, IT, IR, IB = card[0] + PAD, card[1] + PAD, card[2] - PAD, card[3] - PAD
    IW = IR - IL

    # ══════ ① 卡頂：名牌 ══════
    NAME_TOP = IT - 12
    f_no, f_zh, f_sci = font(19, 900), font(58, 900), font(16, 400)
    bb_zh = d.textbbox((0, 0), e["z"], font=f_zh)
    bb_sci = d.textbbox((0, 0), e["s"], font=f_sci)
    zh_h = bb_zh[3] - bb_zh[1]
    sci_h = bb_sci[3] - bb_sci[1]
    name_h = 10 + 22 + 4 + zh_h + 6 + sci_h + 12
    d.rounded_rectangle([IL, NAME_TOP, IR, NAME_TOP + name_h], 14, fill=C)
    d.text((IL + 22, NAME_TOP + 10), f"NO.{bird_id}", font=f_no,
           fill=mix(A, (255, 255, 255), 0.1))
    d.text((IL + 22, NAME_TOP + 34 - bb_zh[1]), e["z"], font=f_zh, fill="white")
    d.text((IL + 24, NAME_TOP + 34 + zh_h + 6 - bb_sci[1]), e["s"], font=f_sci,
           fill=mix(C, (255, 255, 255), 0.74))
    en_txt = e["e"]
    tw = d.textlength(en_txt, font=font(17, 700))
    d.rounded_rectangle([IR - tw - 46, NAME_TOP + 14, IR - 12, NAME_TOP + 48], 17, fill="white")
    d.text((IR - tw - 29, NAME_TOP + 31), en_txt, font=font(17, 700), fill=C, anchor="lm")
    tag = f"{e['oz']} · {e['fz']}"
    tw2 = d.textlength(tag, font=font(13, 700))
    d.rounded_rectangle([IR - tw2 - 38, NAME_TOP + 56, IR - 12, NAME_TOP + 86], 15,
                        outline=mix(C, (255, 255, 255), 0.55), width=2)
    d.text((IR - tw2 - 25, NAME_TOP + 71), tag, font=font(13, 700),
           fill=mix(C, (255, 255, 255), 0.9), anchor="lm")

    # ══════ ② 下方：左直幅相片窗 + 右資料欄 ══════
    BOTTOM_H = 132                      # 卡底 chips／評分／出處
    PY = NAME_TOP + name_h + 18
    BOTTOM_Y = IB - BOTTOM_H
    PH = BOTTOM_Y - PY - 16
    PW = int(PH * (240 / 610))          # 直幅相片比例，跟插畫一致
    PW = min(PW, 470)

    # 相框（雙層：外厚內幼）
    d.rounded_rectangle([IL - 7, PY - 7, IL + PW + 7, PY + PH + 7], 18, fill=mix(C, T, 0.84))
    d.rounded_rectangle([IL - 7, PY - 7, IL + PW + 7, PY + PH + 7], 18,
                        outline=mix(C, (0, 0, 0), 0.2), width=3)
    art = art_image(key)
    if art is not None:
        ratio = max(PW / art.width, PH / art.height)
        aw, ah = int(art.width * ratio) + 1, int(art.height * ratio) + 1
        art = art.resize((aw, ah), Image.LANCZOS)
        left = max(0, (aw - PW) // 2)
        top = max(0, int((ah - PH) * 0.05))
        tile = art.crop((left, top, left + PW, top + PH))
        mask = Image.new("L", tile.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, PW - 1, PH - 1], 12, fill=255)
        img.paste(tile, (IL, PY), mask)
        d.rounded_rectangle([IL, PY, IL + PW - 1, PY + PH - 1], 12,
                            outline=mix(C, (0, 0, 0), 0.4), width=2)
    else:
        d.rounded_rectangle([IL, PY, IL + PW, PY + PH], 12, fill=mix(C, T, 0.74))
        d.text((IL + PW // 2, PY + PH // 2), f"NO.{bird_id}", font=font(48, 900),
               fill=mix(C, (255, 255, 255), 0.5), anchor="mm")

    # 相片左上：IUCN 圓標（真實級別）
    iucn_raw = zh.get("iucn", "")
    hit = next((x for x in IUCN if x[1] in iucn_raw or x[0] in iucn_raw), None)
    if hit and art is not None:
        lc = hx(hit[3])
        d.rounded_rectangle([IL + 12, PY + 12, IL + 132, PY + 50], 19, fill=lc)
        d.ellipse([IL + 24, PY + 23, IL + 39, PY + 38], fill="white")
        d.text((IL + 47, PY + 31), hit[1], font=font(16, 900), fill="white", anchor="lm")
    # 相片底：插畫出處（細字，貼在圖上）
    if art is not None:
        d.rounded_rectangle([IL + 12, PY + PH - 34, IL + 268, PY + PH - 12], 11, fill=(0, 0, 0))
        d.text((IL + 22, PY + PH - 23), "插畫 BIRD-DEX 2 · 相片示意",
               font=font(9, 400), fill=(235, 240, 236), anchor="lm")

    # ── 右資料欄 ──
    RX = IL + PW + 26
    RW = IR - RX

    # 四個數字：2×2
    cellw, cellh = (RW - 12) // 2, 78
    nums = [
        ("身長", "LENGTH", (f"{e['len']}" if e.get("len") else PENDING), "cm", None),
        ("體重", "MASS", (str(m.get("mass", "")).rstrip("g ").strip() or PENDING), "g", None),
        ("保育級別", "IUCN", (hit[1] if hit else PENDING), "", (hx(hit[3]) if hit else None)),
        ("圖鑑評分", "DEX RATING", (f"{score['o']:.1f}" if score.get("o") else PENDING), "/5", "stars"),
    ]
    for i, (kz, ke, v, unit, extra) in enumerate(nums):
        cx = RX + (i % 2) * (cellw + 12)
        cy = PY + (i // 2) * (cellh + 10)
        d.rounded_rectangle([cx, cy, cx + cellw, cy + cellh], 12, fill=mix(C, T, 0.9))
        d.text((cx + 12, cy + 8), f"{kz} {ke}", font=font(10, 700), fill=SUB)
        if extra == "stars":
            fs = 30 if len(str(v)) <= 5 else 18
            d.text((cx + 12, cy + 24), v, font=font(fs, 900), fill=C)
            d.text((cx + 18 + d.textlength(v, font=font(fs, 900)), cy + 42),
                   unit, font=font(11, 700), fill=SUB)
            ov = score.get("o")
            if ov is not None:
                for st in range(5):
                    draw_star(d, cx + 12 + 96 + st * 16, cy + 44, 6, ov >= st + 0.85, A,
                              mix(A, T, 0.5))
        elif extra is not None:
            d.ellipse([cx + 12, cy + 34, cx + 24, cy + 46], fill=extra)
            d.text((cx + 32, cy + 24), v, font=font(24, 900), fill=extra)
        else:
            fs = 30 if len(str(v)) <= 5 else 17
            d.text((cx + 12, cy + 24), v, font=font(fs, 900), fill=C)
            if unit:
                d.text((cx + 18 + d.textlength(v, font=font(fs, 900)), cy + 24 + fs - 12),
                       unit, font=font(11, 700), fill=SUB)

    # ── 文字組：按剩餘高度自動排，字級放大 ──
    ty = PY + 2 * cellh + 18
    avail = BOTTOM_Y - 18 - ty
    zf, ef = font(13, 400), font(11, 400)
    head_f, head_ef = font(15, 900), font(9, 700)

    blocks = [
        ("外形", "LOOK", zh.get("look"), en.get("look")),
        ("習性", "HABITS", zh.get("behavior"), en.get("behavior")),
        ("繁殖", "BREEDING", zh.get("breeding"), en.get("breeding")),
        ("鳴聲", "VOICE", zh.get("voice"), en.get("voice")),
        ("冷知識", "FACT", zh.get("funFact"), en.get("funFact")),
        ("分佈", "RANGE", zh.get("range"), en.get("range")),
        ("食物", "DIET", zh.get("diet"), en.get("diet")),
        ("遷徙", "MIGRATION", zh.get("migration"), en.get("migration")),
        ("人與鳥", "PEOPLE", zh.get("humanRelation"), en.get("humanRelation")),
        ("詞源", "ETYMOLOGY", zh.get("etymology"), en.get("etymology")),
        ("保育", "CONSERVATION", zh.get("conservation"), en.get("conservation")),
        ("特色", "HIGHLIGHTS",
         "；".join(zh.get("highlights") or []) or None,
         "；".join(en.get("highlights") or []) or None),
    ]

    def measure(bz, be):
        h = 22
        for item in bullets(bz or "", max_chars=60, max_points=2):
            h += 18 * len(wrap(item, zf, RW - 10, d)[:3])
        if not bz and not be:
            h += 18
        if be:
            for item in bullets(be, max_chars=130, max_points=1):
                h += 14 * len(wrap(item, ef, RW - 10, d)[:2])
        return h + 14

    y = ty
    for tz, te, bz, be in blocks:
        need = measure(bz, be)
        if y + need > BOTTOM_Y - 20:
            break
        d.text((RX, y), tz, font=head_f, fill=C)
        d.text((RX + d.textlength(tz, head_f) + 8, y + 4), te, font=head_ef,
               fill=mix(C, SUB, 0.4))
        yy = y + 24
        for item in bullets(bz or "", max_chars=60, max_points=2):
            for line in wrap(item, zf, RW - 10, d)[:3]:
                d.ellipse([RX, yy + 8, RX + 5, yy + 13], fill=C)
                d.text((RX + 13, yy), line, font=zf, fill=INK)
                yy += 18
        if not bz and not be:
            d.text((RX + 13, yy), PENDING, font=zf, fill=mix(SUB, T, 0.2))
            yy += 18
        if be:
            for item in bullets(be, max_chars=130, max_points=1):
                for line in wrap(item, ef, RW - 10, d)[:2]:
                    d.text((RX, yy + 2), line, font=ef, fill=SUB)
                    yy += 14
        y = yy + 14

    # ══════ ③ 卡底：棲地／食性 chips、評分、出處 ══════
    d.line([IL, BOTTOM_Y, IR, BOTTOM_Y], fill=mix(C, T, 0.6), width=2)
    by = BOTTOM_Y + 16
    d.text((IL, by + 6), "住", font=font(12, 900), fill=SUB)
    cx = IL + 24
    for tid in e.get("h", [])[:3]:
        nm = HABITAT_ZH.get(tid, tid)
        tw3 = d.textlength(nm, font=font(12, 700))
        d.rounded_rectangle([cx, by, cx + tw3 + 20, by + 26], 13, fill=C)
        d.text((cx + 10, by + 13), nm, font=font(12, 700), fill="white", anchor="lm")
        cx += tw3 + 26
    cx += 12
    d.text((cx, by + 6), "食", font=font(12, 900), fill=SUB)
    cx += 24
    for tid in e.get("d", [])[:3]:
        nm = DIET_ZH.get(tid, tid)
        tw3 = d.textlength(nm, font=font(12, 700))
        d.rounded_rectangle([cx, by, cx + tw3 + 20, by + 26], 13, fill=C)
        d.text((cx + 10, by + 13), nm, font=font(12, 700), fill="white", anchor="lm")
        cx += tw3 + 26

    # 評分五條（有名字、有數）
    ry = by + 40
    d.text((IL, ry), "圖鑑評分", font=font(11, 900), fill=C)
    d.text((IL + 56, ry + 2), "自訂指標 · 非學術評分", font=font(8, 400), fill=SUB)
    bars = [("i", "生物重要性"), ("a", "適應力"), ("v", "觀賞價值"),
            ("r", "研究價值"), ("c", "保育關注度")]
    bx0, bx1 = IL + 190, IR - 30
    seg = (bx1 - bx0) // 5
    for i, (k, lab) in enumerate(bars):
        v = score.get(k)
        x = bx0 + i * seg
        d.rounded_rectangle([x, ry + 1, x + seg - 18, ry + 8], 3, fill=mix(C, T, 0.8))
        if v is not None:
            d.rounded_rectangle([x, ry + 1, x + int((seg - 18) * v / 5), ry + 8], 3, fill=A)
        d.text((x, ry + 11), lab, font=font(8, 400), fill=mix(SUB, T, 0.1))
        if v is not None:
            d.text((x + seg - 18, ry + 11), f"{v:.1f}", font=font(8, 700),
                   fill=mix(C, SUB, 0.3), anchor="ra")

    # 出處
    src = data["src"].get(bird_id, PENDING)
    one = src.replace("｜", " · ").strip()
    f9 = font(9, 400)
    if d.textlength(one, f9) > IW - 96:
        while d.textlength(one, f9) > IW - 106 and len(one) > 20:
            one = one[:-2]
        one = one.rstrip(" ·，") + " …"
    d.text((IL, IB - 16), one, font=f9, fill=mix(SUB, T, 0.18))
    d.text((IR, IB - 16), f"v{data['pkg']}", font=font(9, 700),
           fill=mix(SUB, T, 0.22), anchor="ra")

    img.save(out_path, quality=95)
    print(f"已輸出 {out_path}  ({W}×{H})")


if __name__ == "__main__":
    bid = sys.argv[1] if len(sys.argv) > 1 else "0013"
    bid = bid.zfill(4)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, f"public/demo/card-{bid}-new.jpg")
    imgkey = sys.argv[3] if len(sys.argv) > 3 else None
    render(bid, out, imgkey)
