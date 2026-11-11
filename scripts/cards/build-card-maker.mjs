#!/usr/bin/env node
/* ============================================================
 *  build-card-maker.mjs —— 產生「資訊卡一鍵出圖」單檔 HTML
 * ------------------------------------------------------------
 *  選編號 → 按生成 → 下載。不用貼 prompt：
 *    · 每隻鳥的完整 prompt（18 格鎖死文字＋規則）由 gen-card-prompts.mjs 預先砌好內嵌
 *    · 去字位圖 docs/card-samples/zonemap-naturalist.png（IMAGE 1）
 *    · 樣本卡   docs/card-samples/0022-v3.webp          （IMAGE 2）
 *
 *  用法：node scripts/cards/build-card-maker.mjs [--with-full]   （--with-full 另加「完整文字卡」模式，檔案變大）
 *  輸出：tools/card-studio/aviandex-card-maker.html
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { cells, buildAgentPrompt, buildLitePrompt, REF_NOTE } from './gen-card-prompts.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const VERSION = '1.1';
const idx = JSON.parse(fs.readFileSync(path.join(root, 'src/data/explorerIndex.json'), 'utf8'));

const b64 = (file, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(root, file)).toString('base64');
const zonemap = b64('docs/card-samples/zonemap-naturalist.png', 'image/png');
const refcard = b64('docs/card-samples/0022-v3.webp', 'image/webp');
const lite = b64('docs/card-samples/lite-template.png', 'image/png');
const ref0008 = b64('docs/card-samples/ref-0008.jpg', 'image/jpeg');

const ids = [];
const prompts = {};
const liteP = {};
for (const id of Object.keys(idx.birds).sort()) {
  const e = idx.birds[id];
  const c = cells(id);
  const missing = c.reduce((n, x) => n + x.lines.filter((l) => l.includes('資料待查')).length, 0);
  const z = (name) => (c.find((x) => x.zone.startsWith(name)) || { lines: [] }).lines;
  const facts = [
    ...z('Z01').slice(0, 3),
    ...z('Z03'),
    '雷達 ' + z('Z12').slice(0, 5).map((l) => l.replace(/^\S+\s/, '').replace('/5', '')).join('/'),
    ...z('Z12').slice(5),
  ];
  ids.push({ id, z: e.z, e: e.e, s: e.s, missing, facts });
  prompts[id] = buildAgentPrompt(id);
  liteP[id] = buildLitePrompt(id);
}

/* 縮體積：所有 prompt 共用頭尾，只存每隻鳥不同的中段 */
function pack(map) {
  const all = Object.values(map);
  let pre = all[0], suf = all[0];
  for (const t of all) {
    let i = 0; while (i < pre.length && i < t.length && pre[i] === t[i]) i++;
    pre = pre.slice(0, i);
    let j = 0; while (j < suf.length && j < t.length && suf[suf.length - 1 - j] === t[t.length - 1 - j]) j++;
    suf = suf.slice(suf.length - j);
  }
  const mids = {};
  for (const [id, t] of Object.entries(map)) {
    if (pre.length + suf.length > t.length) throw new Error('prompt 頭尾切分失敗：' + id);
    mids[id] = t.slice(pre.length, t.length - suf.length);
  }
  return { pre, suf, mids };
}
const data = {
  version: VERSION, ids,
  modes: {
    lite: { label: '精簡圖示卡（只有名稱＋數字＋圖示，推薦）', imgs: [lite], ...pack(liteP) },
    liteRef: { label: '精簡圖示卡＋原卡參考（畫風較似原卡，但版面可能偏離）', imgs: [lite, ref0008], same: 'lite', refNote: REF_NOTE },
    ...(process.argv.includes('--with-full')
      ? { full: { label: '完整文字卡（18 格，錯字風險高）', imgs: [zonemap, refcard], ...pack(prompts) } }
      : {}),
  },
};
const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');
const shell = fs.readFileSync(path.join(root, 'tools/card-studio/cardmaker.html'), 'utf8');
if (!shell.includes('/*__AVX_DATA__*/')) throw new Error('cardmaker.html 找不到注入點');
const out = path.join(root, 'tools/card-studio/aviandex-card-maker.html');
fs.writeFileSync(out, shell.replace('/*__AVX_DATA__*/', () => 'window.AVX=' + json + ';'), 'utf8');
console.log(`✅ ${path.relative(root, out)}（${(fs.statSync(out).size / 1024).toFixed(0)} KB）· ${ids.length} 隻`);
