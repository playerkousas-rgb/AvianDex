#!/usr/bin/env node
/* ============================================================
 *  export-icons.mjs —— 把 src/lib/dexCardIcons.ts 的圖示匯出成 PNG
 * ------------------------------------------------------------
 *  為甚麼要這一步？
 *    卡面最終要用 Pillow 印字（文字必須由資料 + 程式渲染），
 *    但 Pillow 唔識 SVG。所以先在 Node 用 sharp 把 SVG 轉 PNG，
 *    再讓 Python 貼上卡面。圖示仍然只有一份來源（dexCardIcons.ts），
 *    唔會出現「app 一套、PNG 另一套」。
 *
 *  用法：node scripts/cards/export-icons.mjs
 *  輸出：data/card-demo/icons/<id>@<color>.png
 * ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import sharp from 'sharp';
import { pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const root = path.resolve(import.meta.dirname, '..', '..');
const outDir = path.join(root, 'data/card-demo/icons');
mkdirSync(outDir, { recursive: true });

const tmp = path.join(mkdtempSync(path.join(tmpdir(), 'icons-')), 'icons.mjs');
await build({
  entryPoints: [path.join(root, 'src/lib/dexCardIcons.ts')],
  bundle: true, format: 'esm', platform: 'neutral', outfile: tmp,
});
const mod = await import(pathToFileURL(tmp).href);

const COLORS = {
  deep: '#11402A',      // 深綠（標籤、欄目）
  gold: '#BA8A28',
  white: '#FFFFFF',
  ink: '#1C1A16',
};
const SIZES = [64, 128];

const all = {
  ...mapValues(mod.DIET_ICONS, 'diet'),
  ...mapValues(mod.HABITAT_ICONS, 'habitat'),
  ...mapValues(mod.UI_ICONS, 'ui'),
};

function mapValues(obj, prefix) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) out[`${prefix}-${k}`] = v;
  return out;
}

let n = 0;
const meta = {};
for (const [id, def] of Object.entries(all)) {
  if (!def?.body) continue;
  meta[id] = { zh: def.zh || '', en: def.en || '' };
  for (const [cname, cval] of Object.entries(COLORS)) {
    for (const size of SIZES) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}"><g color="${cval}">${def.body}</g></svg>`;
      const file = path.join(outDir, `${id}_${cname}_${size}.png`);
      await sharp(Buffer.from(svg)).png().toFile(file);
      n++;
    }
  }
}
writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
console.log(`已匯出 ${n} 個 PNG → data/card-demo/icons/（${Object.keys(meta).length} 個圖示）`);
