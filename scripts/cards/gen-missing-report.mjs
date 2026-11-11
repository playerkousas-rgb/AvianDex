#!/usr/bin/env node
/* ============================================================
 *  gen-missing-report.mjs —— 出圖進度與缺資料清單
 * ------------------------------------------------------------
 * 用戶換 Google 帳號前先要一份「幾時做完、邊隻缺幾多格」的清單。
 *
 * 輸出 deliver/cards-progress.md：
 *   · 已出／未出統計
 *   · 每隻的待查格數，按齊全度排序（先出齊全的）
 *   · 建議批次（每 50 張一卷 zip）
 *
 * 用法：node scripts/cards/gen-missing-report.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const J = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const idx = J('src/data/explorerIndex.json');
const copy = J('src/data/cardCopy.json');
const meas = J('src/data/measurements.json');
const scores = J('src/data/dexScores.json').scores;

/* 已出圖的目錄（本地工作區，不入 Git） */
const OUT_DIRS = ['data/card-demo/out', 'deliver/cards/avif', 'data/card-demo'];
const done = new Set();
for (const d of OUT_DIRS) {
  const p = path.join(root, d);
  if (!existsSync(p)) continue;
  for (const f of readdirSync(p)) {
    const m = f.match(/(\d{4})\.(png|jpg|jpeg|webp|avif)$/i);
    if (m) done.add(m[1]);
  }
}

function missingCells(id) {
  const e = idx.birds[id] || {};
  const c = copy[id] || {};
  const m = meas[id] || {};
  const miss = [];
  if (!(c.length || e.len)) miss.push('體長');
  if (!m.mass) miss.push('體重');
  if (!c.look) miss.push('外形');
  if (!c.diet) miss.push('食性');
  if (!c.range) miss.push('分佈');
  if (!c.breeding) miss.push('繁殖');
  if (!c.behavior) miss.push('行為');
  if (!c.funFact) miss.push('冷知識');
  if (!c.voice) miss.push('鳴聲');
  if (!c.conservation) miss.push('保育');
  if (!c.iucn) miss.push('IUCN');
  if (!scores[id] || scores[id].o == null) miss.push('評分');
  return miss;
}

const rows = Object.keys(idx.birds).sort().map((id) => ({
  id,
  zh: idx.birds[id].z || '',
  miss: missingCells(id),
  done: done.has(id),
}));

const doneCount = rows.filter((r) => r.done).length;
const byQuality = rows.slice().sort((a, b) => a.miss.length - b.miss.length || a.id.localeCompare(b.id));

const lines = [];
lines.push('# 卡面出圖進度與缺資料清單');
lines.push('');
lines.push(`產生時間：${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
lines.push('');
lines.push('## 總覽');
lines.push('');
lines.push(`- 圖鑑總數：**${rows.length}**`);
lines.push(`- 已出卡：**${doneCount}**`);
lines.push(`- 待出：**${rows.length - doneCount}**`);
lines.push('');
lines.push('資料完整度分佈：');
const dist = {};
rows.forEach((r) => { const k = r.miss.length; dist[k] = (dist[k] || 0) + 1; });
Object.keys(dist).sort((a, b) => a - b).forEach((k) => {
  lines.push(`- 缺 ${k} 項：${dist[k]} 隻`);
});
lines.push('');
lines.push('## 建議批次（每 50 張一卷 zip）');
lines.push('');
let batch = 1;
for (let i = 0; i < byQuality.length; i += 50) {
  const chunk = byQuality.slice(i, i + 50);
  const ids = chunk.map((r) => r.id).sort();
  lines.push(`${batch}. #${ids[0]}–#${ids[ids.length - 1]}（${chunk.length} 隻，平均缺 ${(
    chunk.reduce((a, r) => a + r.miss.length, 0) / chunk.length
  ).toFixed(1)} 項）`);
  batch += 1;
}
lines.push('');
lines.push('## 逐隻狀態（按資料齊全度排序）');
lines.push('');
lines.push('| 編號 | 中文名 | 已出 | 缺格數 | 缺哪幾格 |');
lines.push('|---|---|---|---|---|');
for (const r of byQuality) {
  lines.push(`| ${r.id} | ${r.zh} | ${r.done ? '✔' : ''} | ${r.miss.length} | ${r.miss.join('、')} |`);
}

mkdirSync(path.join(root, 'deliver'), { recursive: true });
writeFileSync(path.join(root, 'deliver/cards-progress.md'), lines.join('\n') + '\n', 'utf8');
console.log(`已寫入 deliver/cards-progress.md（${rows.length} 隻，已出 ${doneCount}）`);
