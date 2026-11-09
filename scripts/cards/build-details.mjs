#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 「詳細資料」文案（中／英分開兩個檔）
 * ------------------------------------------------------------
 *  為什麼不直接 import cardCopy.json？
 *    那份有 2.8 MB（含每張卡的維基原文、picks、notes…），手機開首頁唔應該付這個代價。
 *    這裡只抽「詳細資料頁真的會顯示」的欄位，中英分檔，
 *    並且由 App 用 dynamic import 只在用戶撳「詳細資料」時才載入。
 *
 *  ⚠️ 只搬運、不創作：文字全部原封不動來自 cardCopy.json，
 *     英文只取 fieldCopy[].en（維基英文原文），冇就留空 → 介面顯示 Data pending。
 *
 *  跑：npm run cards:details
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const MAX_CHARS = 420;     /* 單一欄位上限，避免一頁落落長；超出以「…」結尾 */

/** 中文短文案欄位（卡面已校對那批） */
const ZH_FIELDS = [
  'look', 'diet', 'habitat', 'range', 'breeding', 'funFact',
  'behavior', 'voice', 'migration', 'conservation', 'humanRelation', 'etymology',
  'highlights', 'length', 'weight', 'iucn',
];

const clip = (v) => {
  if (typeof v !== 'string') return v;
  const s = v.trim();
  return s.length > MAX_CHARS ? s.slice(0, MAX_CHARS).replace(/[，、；,;]$/, '') + '…' : s;
};

function main() {
  const copy = JSON.parse(fs.readFileSync(path.join(DATA, 'cardCopy.json'), 'utf8'));

  const zh = {};
  const en = {};

  for (const [id, c] of Object.entries(copy)) {
    if (!/^\d{4}$/.test(id)) continue;

    const z = {};
    for (const k of ZH_FIELDS) {
      if (c[k] == null) continue;
      const v = clip(c[k]);
      if (Array.isArray(v) ? v.length : String(v).trim()) z[k] = v;
    }
    /* 即使一個字都冇，都要留一個空 entry：
       1) 介面可以講清楚「這張卡未有詳細文案」，而不是靜靜空白；
       2) 測試可以逐張數覆蓋率（少過 100% 就知邊幾張要補）。 */
    zh[id] = z;

    /* 英文：fieldCopy 的 en 是維基英文原文；缺就唔寫，介面會印 Data pending */
    const e = {};
    for (const f of c.fieldCopy || []) {
      if (!f || !f.id) continue;
      if (f.id === 'look' || f.id === 'highlights') continue; /* 兩樣在中文版才有校對版，英文唔重複 */
      if (typeof f.en === 'string' && f.en.trim()) e[f.id] = clip(f.en);
      else if (Array.isArray(f.en) && f.en.length) e[f.id] = clip(f.en.join('；'));
    }
    if (typeof c.length === 'string' && c.length) e.length = c.length;
    if (typeof c.weight === 'string' && c.weight) e.weight = c.weight;
    if (typeof c.iucnEn === 'string' && c.iucnEn) e.iucn = c.iucnEn;
    if (Object.keys(e).length) en[id] = e;
  }

  const meta = {
    _readme: {
      用途: '「詳細資料」頁的中英文案，由 npm run cards:details 產生。App 用 dynamic import 按語言載入。',
      來源: 'src/data/cardCopy.json（中文短文案）＋ fieldCopy[].en（英文維基原文）',
      規則: '只搬運不改寫。英文缺 → 介面顯示 Data pending，不得用中文頂替或機翻。',
    },
  };

  const write = (name, obj) => {
    const p = path.join(DATA, name);
    fs.writeFileSync(p, JSON.stringify(obj), 'utf8');
    return (fs.statSync(p).size / 1024).toFixed(0);
  };

  const zhKB = write('cardDetails.zh.json', { ...meta, birds: zh });
  const enKB = write('cardDetails.en.json', { ...meta, birds: en });

  console.log(`✅ cardDetails.zh.json（${zhKB} KB，${Object.keys(zh).length} 張）`);
  console.log(`✅ cardDetails.en.json（${enKB} KB，${Object.keys(en).length} 張）`);
}

main();
