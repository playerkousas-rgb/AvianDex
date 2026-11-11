#!/usr/bin/env node
/* ============================================================
 *  由 cardCopy.json（2.8 MB）抽出「每隻雀一句出處」
 * ------------------------------------------------------------
 *  用戶要求：所有內容都要標明出處（pageid），但不可能為了印一句出處
 *  而下載 2.8 MB。所以抽出 id → source 字串，約 70 KB，只在砌卡時才載入。
 *
 *  用法：node scripts/build-card-sources.mjs
 * ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const copy = JSON.parse(readFileSync(path.join(root, 'src/data/cardCopy.json'), 'utf8'));

const out = {};
let missing = 0;
for (const [id, v] of Object.entries(copy)) {
  if (id === '_readme' || !v || typeof v !== 'object') continue;
  if (v.source) out[id] = String(v.source).trim();
  else missing += 1;
}

const payload = {
  _readme: [
    '每隻雀的資料出處（維基百科語系／條目／pageid ＋ 分類來源），由 scripts/build-card-sources.mjs 產生，不要手改。',
    '用途：圖鑑資訊卡底欄「資料出處（可追溯）」。卡面上不可以只寫「資料來源：網絡」。',
  ],
  sources: out,
};
writeFileSync(path.join(root, 'src/data/cardSources.json'), JSON.stringify(payload) + '\n', 'utf8');
console.log('已寫入 src/data/cardSources.json：', Object.keys(out).length, '隻；缺出處', missing, '隻');
