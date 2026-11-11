#!/usr/bin/env node
/* ============================================================
 *  build-card-maker.mjs —— 產生「資訊卡一鍵出圖」單檔 HTML
 * ------------------------------------------------------------
 *  選編號 → 按生成 → 下載。不用貼 prompt：
 *    · 每隻鳥的完整 prompt（18 格鎖死文字＋規則）由 gen-card-prompts.mjs 預先砌好內嵌
 *    · 去字位圖 docs/card-samples/zonemap-naturalist.png（IMAGE 1）
 *    · 樣本卡   docs/card-samples/0022-v3.webp          （IMAGE 2）
 *
 *  用法：node scripts/cards/build-card-maker.mjs
 *  輸出：tools/card-studio/aviandex-card-maker.html
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { cells, buildAgentPrompt } from './gen-card-prompts.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const VERSION = '1.0';
const idx = JSON.parse(fs.readFileSync(path.join(root, 'src/data/explorerIndex.json'), 'utf8'));

const b64 = (file, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(root, file)).toString('base64');
const zonemap = b64('docs/card-samples/zonemap-naturalist.png', 'image/png');
const refcard = b64('docs/card-samples/0022-v3.webp', 'image/webp');

const ids = [];
const prompts = {};
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
}

/* 縮體積：所有 prompt 共用頭尾，只存每隻鳥不同的中段（4 MB → 約 1.3 MB） */
const all = Object.values(prompts);
let pre = all[0], suf = all[0];
for (const t of all) {
  let i = 0; while (i < pre.length && i < t.length && pre[i] === t[i]) i++;
  pre = pre.slice(0, i);
  let j = 0; while (j < suf.length && j < t.length && suf[suf.length - 1 - j] === t[t.length - 1 - j]) j++;
  suf = suf.slice(suf.length - j);
}
const mids = {};
for (const [id, t] of Object.entries(prompts)) {
  if (!t.startsWith(pre) || !t.endsWith(suf) || pre.length + suf.length > t.length) throw new Error('prompt 頭尾切分失敗：' + id);
  mids[id] = t.slice(pre.length, t.length - suf.length);
}
const data = { version: VERSION, zonemap, refcard, ids, pre, suf, mids };
const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');
const shell = fs.readFileSync(path.join(root, 'tools/card-studio/cardmaker.html'), 'utf8');
if (!shell.includes('/*__AVX_DATA__*/')) throw new Error('cardmaker.html 找不到注入點');
const out = path.join(root, 'tools/card-studio/aviandex-card-maker.html');
fs.writeFileSync(out, shell.replace('/*__AVX_DATA__*/', () => 'window.AVX=' + json + ';'), 'utf8');
console.log(`✅ ${path.relative(root, out)}（${(fs.statSync(out).size / 1024).toFixed(0)} KB）· ${ids.length} 隻`);
