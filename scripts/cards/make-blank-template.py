#!/usr/bin/env python3
"""
make-blank-template.py —— 生成「去字版面模板」（v3，列舉式）

背後想法：與其用顏色門檻猜哪裡是文字（會連插畫一起抹掉），不如
用「版面結構」定位：先找綠色標題橫幅的列位置，再據此逐格列出文字區塊。
插畫、圖示、地圖、鳥圖、像素圖全部在遮罩之外，永不改動。

座標基準：1024×1536（用戶的「小葵花鳳頭鸚鵡」卡）。其他尺寸會自動縮放。

用法：
  python3 scripts/cards/make-blank-template.py in.png out.png [--debug]
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

BASE_W, BASE_H = 1024.0, 1536.0

# (x0, y0, x1, y1, 模式)
#   fill  = 整塊補紙色
#   white = 只抹亮像素（保留深綠／紅底色的橫幅）
ZONES = [
    # 頂部
    (96, 28, 232, 74, "white"),   # NO 編號（保留精靈球圖示）
    (256, 22, 744, 94, "fill"),      # 中文大名
    (260, 112, 700, 150, "fill"),    # 英文名
    (260, 150, 700, 186, "fill"),    # 斜體學名
    (300, 208, 600, 240, "fill"),    # 屬性
    (300, 242, 640, 274, "fill"),    # 分類
    (268, 300, 452, 338, "white"),   # 圖鑑介紹橫幅
    (268, 344, 706, 468, "fill"),   # 圖鑑介紹段落
    (26, 400, 330, 470, "fill"),   # 三格數值條
    (770, 18, 1005, 58, "white"),    # 特徵放大鏡橫幅

    # 左欄
    (23, 479, 340, 509, "white"),    # 分類資訊橫幅
    (62, 513, 322, 706, "fill"),   # 分類資訊 7 行（左邊小圖示保留）
    (23, 734, 340, 765, "white"),    # 生態習性橫幅
    (30, 772, 318, 930, "fill"),     # 生態習性 4 行
    (23, 941, 340, 968, "white"),    # 成長與繁殖橫幅
    (30, 974, 180, 1150, "fill"),    # 成長與繁殖文字（右邊巢圖保留）
    (23, 1152, 340, 1186, "white"),  # 評分卡橫幅
    (30, 1192, 100, 1360, "fill"),   # 雷達圖左側標籤
    (256, 1192, 344, 1360, "fill"),  # 雷達圖右側標籤
    (110, 1163, 244, 1200, "fill"),  # 雷達圖頂標籤
    (23, 1408, 232, 1434, "white"),  # 總評分橫幅
    (52, 1380, 248, 1408, "fill"),   # 星級
    (248, 1378, 344, 1412, "fill"),  # 總評分數值

    # 中欄
    (341, 734, 660, 765, "white"),   # 食物橫幅
    (348, 772, 655, 800, "fill"),   # 食物副標（圖示區保留）
    (348, 876, 655, 935, "fill"),    # 食物說明
    (341, 941, 660, 968, "white"),   # 關鍵知識橫幅
    (352, 974, 660, 1150, "fill"),   # 關鍵知識 1-5
    (341, 1152, 660, 1186, "white"), # 觀察小貼士橫幅
    (350, 1192, 660, 1360, "fill"),  # 觀察小貼士 4 行

    # 右欄
    (700, 734, 1000, 765, "white"),  # 分佈地區橫幅
    (704, 772, 995, 800, "fill"),   # 分佈副標
    (704, 884, 995, 906, "fill"),   # 分佈說明（地圖保留）
    (872, 62, 1010, 172, "fill"),   # 放大鏡 1 說明
    (872, 210, 1010, 320, "fill"),   # 放大鏡 2 說明
    (872, 356, 1010, 462, "fill"),   # 放大鏡 3 說明
    (872, 508, 1010, 616, "fill"),   # 放大鏡 4 說明
    (700, 941, 1000, 968, "white"),  # 趣味冷知識橫幅
    (704, 974, 995, 1150, "fill"),   # 冷知識 3 條
    (700, 1152, 1000, 1186, "white"),# 注意事項橫幅
    (738, 1192, 995, 1370, "fill"),  # 注意事項 3 行（保留警告三角）

    # 頁腳
    (352, 1462, 470, 1502, "fill"),  # 可混淆物種 1 名稱
    (474, 1462, 646, 1502, "fill"),  # 可混淆物種 2 名稱
    (352, 1504, 470, 1526, "fill"),  # 可混淆物種 1 說明
    (474, 1504, 646, 1526, "fill"),  # 可混淆物種 2 說明
    (23, 1408, 340, 1434, "white"),  # 叫聲橫幅
    (30, 1500, 342, 1526, "fill"),   # 叫聲說明（波形保留）
    (341, 1408, 660, 1434, "white"), # 可混淆物種橫幅
    (700, 1408, 1000, 1434, "white"),# 保育狀態橫幅
    (768, 1452, 995, 1526, "fill"),   # 保育狀態說明（IUCN 徽章保留）
]

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    debug = "--debug" in sys.argv
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    src, dst = args[0], args[1]

    im = Image.open(src).convert("RGB")
    arr = np.asarray(im).astype(np.float32)
    H, W = arr.shape[:2]
    sx, sy = W / BASE_W, H / BASE_H
    lum = arr.mean(axis=2)
    sat = arr.max(axis=2) - arr.min(axis=2)
    paper = np.array([248, 242, 226], dtype=np.float32)

    out = arr.copy()
    for x0, y0, x1, y1, mode in ZONES:
        a0, b0 = int(round(x0 * sx)), int(round(y0 * sy))
        a1, b1 = int(round(x1 * sx)), int(round(y1 * sy))
        reg = out[b0:b1, a0:a1]
        if reg.size == 0:
            continue
        rl = lum[b0:b1, a0:a1]
        rs = sat[b0:b1, a0:a1]
        light = reg[(rl > 222) & (rs < 46)]
        fill = np.median(light, axis=0) if len(light) > 20 else paper
        if mode == "fill":
            reg[...] = fill
        else:  # white：只抹亮字，保留橫幅底色
            m = (rl > 150) & (rs < 95)
            reg[m] = fill

    img = Image.fromarray(out.clip(0, 255).astype("uint8"))
    d = ImageDraw.Draw(img)

    # 雷達圖 → 空白五邊形
    cx, cy, r = 178 * sx, 1252 * sy, 64 * min(sx, sy)
    pts = [(cx + r * np.cos(-np.pi / 2 + i * 2 * np.pi / 5),
            cy + r * np.sin(-np.pi / 2 + i * 2 * np.pi / 5)) for i in range(5)]
    d.polygon(pts, fill=tuple(int(v) for v in paper), outline=(112, 126, 102), width=2)
    for p in pts:
        d.line([(cx, cy), p], fill=(188, 196, 178), width=1)

    # 叫聲波形 → 空白波形
    wy = int(1468 * sy)
    for x in range(int(36 * sx), int(342 * sx), 3):
        h = int(abs(np.random.default_rng(x).normal(0, 8)) + 2)
        d.line([(x, wy - h), (x, wy + h)], fill=(128, 140, 118), width=2)

    if debug:
        dd = ImageDraw.Draw(img)
        for x0, y0, x1, y1, mode in ZONES:
            dd.rectangle([x0 * sx, y0 * sy, x1 * sx, y1 * sy],
                         outline=(220, 60, 40) if mode == "fill" else (60, 120, 220), width=2)

    img.save(dst)
    print(f"已寫入 {dst}（{W}×{H}）共 {len(ZONES)} 個區塊")


if __name__ == "__main__":
    main()
