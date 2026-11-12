#!/usr/bin/env node
/**
 * AvianDex 圖標（G11 標準）：母圖 = 開機畫面那隻紅色小鳥（lucide「bird」路徑，ISC 授權）。
 *   · 全部 PNG／ICO（不用 SVG／AVIF／WebP）；滿版、無白邊無圓角框；主體正中。
 *   · 底色 = theme_color #0E3B2E；紅 #E3350D、奶白 #FFF4D6、黃 #FFD43B、深紅描邊 #5B1206（≥4 色）。
 *   · maskable：同一張滿版圖，主體收在中央 66% 安全區內。
 *   · 16×16 手繪像素（不縮圖）。favicon-48 用 32/48 專用（較粗線條）。
 * 檔名帶 -v2（/icons/* 是 immutable 快取，改圖必須改檔名）。
 * 用法：node scripts/icons/make-app-icons.mjs [outDir]；og-image 由 og-image.py 另出（需要中文字體）。
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

/* sharp 不是專案依賴：先找專案內的，再找 SHARP_DIR（例如 /home/user/work） */
const req = createRequire((process.env.SHARP_DIR || process.cwd()) + '/');
const sharp = req('sharp');

const OUT = process.argv[2] || 'public/icons';
const BG = '#0E3B2E', RED = '#E3350D', CREAM = '#FFF4D6', YEL = '#FFD43B', DEEP = '#5B1206';
fs.mkdirSync(OUT, { recursive: true });

/** share = 小鳥（含嘴尖）佔畫面寬度比例；lucide 小鳥 viewBox 24，實際範圍 x 2–22、y 3–21 */
function svg(size, share, sw = 1.9) {
  const k = (size * share) / 20;            // 1 個 lucide 單位 = k px
  const tx = size / 2 - 12 * k, ty = size / 2 - 12.2 * k;
  const o = (w) => `stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <g transform="translate(${tx} ${ty}) scale(${k})" fill="none">
    <path d="M10 18v3M14 17.75V21" stroke="${YEL}" ${o(sw)}/>
    <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20Z" fill="${RED}" stroke="${DEEP}" ${o(sw + 0.9)}/>
    <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20Z" fill="${RED}" stroke="${RED}" ${o(sw * 0.6)}/>
    <path d="M7 18a6 6 0 0 0 3.84-10.61" stroke="${CREAM}" ${o(sw)}/>
    <path d="m20 7 2 .5-2 .5" fill="${YEL}" stroke="${YEL}" ${o(sw)}/>
    <path d="M16 7h.01" stroke="${CREAM}" ${o(sw * 2.1)}/>
    <path d="M16 7h.01" stroke="${DEEP}" ${o(sw * 1.1)}/>
  </g></svg>`);
}

async function png(file, size, share, sw) {
  const buf = await sharp(svg(size * 2, share, sw)).resize(size, size, { kernel: 'lanczos3' }).png({ palette: true, colors: size >= 400 ? 48 : 32, dither: 0 }).toBuffer();
  fs.writeFileSync(path.join(OUT, file), buf);
  return buf;
}

// 一般圖標：主體約 66%；maskable：同圖但 ≤ 60%（中央 66% 安全區內留邊）
const b512 = await png('icon-512-v2.png', 512, 0.66);
await png('icon-192-v2.png', 192, 0.66);
await png('icon-maskable-512-v2.png', 512, 0.56);
await png('icon-maskable-192-v2.png', 192, 0.56);
await png('apple-touch-icon-v2.png', 180, 0.66);
const f32 = await png('favicon-32-v2.png', 32, 0.78, 2.3);
const f48 = await png('favicon-48-v2.png', 48, 0.74, 2.2);

// 16×16 手繪（天=深綠、主體=紅鳥、嘴／腳=黃、眼=奶白＋深紅）
const rows = [
  '................',
  '................',
  '.........rrrr...',
  '........rrrrrr..',
  '.......rrrrwdrYY',
  '......rrrrrrrrYY',
  '.....rrrrrrrrrr.',
  '....rrrcrrrrrr..',
  '...rrrrccrrrrr..',
  '..rrrrrrcrrrrr..',
  '.rrrrrrrccrrr...',
  '..rrrrrrrrrr....',
  '...rrrrrrrr.....',
  '.....Y..Y.......',
  '.....Y..Y.......',
  '................',
];
const pal = { '.': BG, r: RED, Y: YEL, c: CREAM, w: CREAM, d: DEEP };
const raw = Buffer.alloc(16 * 16 * 3);
rows.forEach((row, y) => [...row].forEach((ch, x) => {
  const hex = pal[ch] || BG;
  raw.set([parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)], (y * 16 + x) * 3);
}));
const f16 = await sharp(raw, { raw: { width: 16, height: 16, channels: 3 } }).png({ palette: true, colors: 8, dither: 0 }).toBuffer();
fs.writeFileSync(path.join(OUT, 'favicon-16-v2.png'), f16);

// ICO（PNG 內嵌，16／32／48）
const imgs = [[16, f16], [32, f32], [48, f48]];
const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
let off = 6 + 16 * imgs.length;
const dirs = imgs.map(([s, b]) => {
  const d = Buffer.alloc(16);
  d.writeUInt8(s, 0); d.writeUInt8(s, 1); d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
  d.writeUInt32LE(b.length, 8); d.writeUInt32LE(off, 12); off += b.length; return d;
});
fs.writeFileSync(path.join(OUT, 'favicon-v2.ico'), Buffer.concat([head, ...dirs, ...imgs.map(([, b]) => b)]));

// og 用的大鳥（透明底，之後由 og-image.py 疊字）
const big = await sharp(svg(1024, 0.74)).png().toBuffer();
fs.writeFileSync('/tmp/avx-bird-big.png', big);
console.log('ok', fs.readdirSync(OUT).filter((f) => f.includes('-v2')).join(' '));
