#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 把 cardCopy.json 的中文「簡體 → 香港繁體」
 * ------------------------------------------------------------
 *  為什麼要這一支？
 *    抽取器（extract-bilingual.mjs）已經在入庫前轉一次；
 *    但舊資料（PR #7 之前入庫的 559 張）仍然可能是簡體，
 *    而且英文欄位（fieldCopy[].en）一個字都唔可以碰。
 *    這支只掃「中文」欄位，逐句判斷有冇簡體，冇簡體就原樣保留。
 *
 *  ⚠️ 只轉字形，不改詞、不改句：轉完仍然可以逐句對回維基原文。
 *
 *  用法：
 *    npm run cards:hk            # 轉換並寫入（先備份 .prehk）
 *    npm run cards:hk -- --check # 只報告，唔寫入
 *    npm run cards:hk -- --ids 0084,0359
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

import { toHk, looksSimplified } from './zh-hk.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const FILE = path.join(ROOT, 'src/data/cardCopy.json');

/** 中文欄位（英文只在 fieldCopy[].en，唔會經這裡） */
const ZH_FIELDS = [
  'look', 'diet', 'habitat', 'range', 'breeding', 'funFact', 'voice', 'behavior',
  'migration', 'conservation', 'humanRelation', 'etymology', 'highlights',
  'notes', 'length', 'weight', 'iucn', 'orderZh', 'familyZh',
];

const ARGS = process.argv.slice(2);
const arg = (n, d) => { const i = ARGS.indexOf(n); return i >= 0 ? ARGS[i + 1] : d; };
const CHECK = ARGS.includes('--check');
const ids = arg('--ids') ? new Set(arg('--ids').split(',').map((s) => s.trim().padStart(4, '0'))) : null;

const fix = (v) => (typeof v === 'string' ? toHk(v) : Array.isArray(v) ? v.map(fix) : v);

const copy = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const hits = [];
let touchedCards = 0;

for (const [id, c] of Object.entries(copy)) {
  if (!/^\d{4}$/.test(id)) continue;
  if (ids && !ids.has(id)) continue;
  let touched = 0;

  for (const k of ZH_FIELDS) {
    const before = c[k];
    if (before == null) continue;
    const after = fix(before);
    if (JSON.stringify(after) !== JSON.stringify(before)) {
      if (!CHECK) c[k] = after;
      touched += 1;
      const sample = Array.isArray(before) ? before[0] : before;
      if (hits.length < 12) hits.push(`${id} ${k}：${String(sample).slice(0, 46)}`);
    }
  }

  /* fieldCopy：只轉 zh，en 原樣（英文欄位出現中文就是 bug，交由測試把關） */
  for (const cell of c.fieldCopy || []) {
    if (!cell || typeof cell.zh !== 'string' || !cell.zh) continue;
    if (!looksSimplified(cell.zh)) continue;
    if (!CHECK) cell.zh = toHk(cell.zh);
    touched += 1;
    if (hits.length < 12) hits.push(`${id} ${cell.id}.zh：${cell.zh.slice(0, 46)}`);
  }

  /* callouts 的 text 也是中文 */
  for (const m of c.callouts || []) {
    if (!m || typeof m.text !== 'string') continue;
    if (!looksSimplified(m.text)) continue;
    if (!CHECK) m.text = toHk(m.text);
    touched += 1;
  }

  if (touched) touchedCards += 1;
}

console.log(`${CHECK ? '🔍（只報告）' : '✅'} 含簡體的中文欄位：${touchedCards} 張卡`);
for (const h of hits) console.log(`   ${h}`);

if (!CHECK && touchedCards) {
  fs.copyFileSync(FILE, `${FILE}.prehk`);
  fs.writeFileSync(FILE, `${JSON.stringify(copy, null, 2)}\n`, 'utf8');
  console.log(`💾 已寫入 src/data/cardCopy.json（備份：cardCopy.json.prepk）`);
  console.log('   下一步：npm test && npm run cards:data');
}
