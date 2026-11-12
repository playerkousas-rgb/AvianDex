#!/usr/bin/env python3
"""og-image-v2.png（1200×630）：左邊紅色小鳥（母圖），右邊 AvianDex／香港鳥類圖鑑。
先跑 make-app-icons.mjs（會輸出 /tmp/avx-bird-big.png）。需要 NotoSansTC（~/.fonts 或 AVX_FONT_DIR）。"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1] if len(sys.argv) > 1 else 'public/icons/og-image-v2.png'
fd = os.environ.get('AVX_FONT_DIR', os.path.expanduser('~/.fonts'))
F = lambda n, s: ImageFont.truetype(os.path.join(fd, n), s)
BG, RED, CREAM, YEL = (14, 59, 46), (227, 53, 13), (255, 244, 214), (255, 212, 59)
im = Image.new('RGB', (1200, 630), BG)
bird = Image.open('/tmp/avx-bird-big.png').convert('RGB').resize((620, 620), Image.LANCZOS)
im.paste(bird, (10, 5))
d = ImageDraw.Draw(im)
d.text((640, 215), 'AvianDex', font=F('NotoSansTC_700Bold.ttf', 112), fill=CREAM, anchor='lm')
d.text((644, 322), '香港鳥類圖鑑', font=F('NotoSansTC_700Bold.ttf', 66), fill=YEL, anchor='lm')
d.rounded_rectangle((644, 392, 1130, 394), 1, fill=RED)
d.text((644, 450), '圖卡收藏 · 認識鳥的身體 · 辨雀', font=F('NotoSansTC_400Regular.ttf', 32), fill=CREAM, anchor='lm')
im = im.quantize(64, dither=Image.NONE).convert('RGB').quantize(64, dither=Image.NONE)
im.save(out, optimize=True)
print(out, os.path.getsize(out))
