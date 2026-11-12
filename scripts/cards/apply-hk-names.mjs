#!/usr/bin/env node
/**
 * 依「權威」修正 birds.json 的中文名（只改 name；編號、英文名、學名不動）
 *   世界權威：eBird/Clements（英文名／學名，已在 birdTaxonomy.json）
 *   香港權威：香港觀鳥會（HKBWS）香港鳥類名錄 — 只人手核對「名稱」，名錄文字／表格不入庫
 * 用法：node scripts/cards/apply-hk-names.mjs [--write]
 * 對照表在 scripts/cards/hk-name-fixes.json（每筆有舊名、新名、依據）
 */
import fs from 'node:fs';
const ROOT = new URL('../../', import.meta.url).pathname;
const birdsPath = ROOT + 'src/data/birds.json';
const fixes = JSON.parse(fs.readFileSync(ROOT + 'scripts/cards/hk-name-fixes.json', 'utf8')).fixes;
const birds = JSON.parse(fs.readFileSync(birdsPath, 'utf8'));
let n = 0;
for (const b of birds) {
  const f = fixes[b.id];
  if (!f) continue;
  if (b.name === f.to) continue;
  if (b.name !== f.from) { console.log('⚠️ 跳過', b.id, '現名', b.name, '≠ 記錄舊名', f.from); continue; }
  b.name = f.to; n++;
}
console.log(`改名 ${n} 筆`);
if (process.argv.includes('--write')) {
  fs.writeFileSync(birdsPath, JSON.stringify(birds, null, 2) + '\n');
  console.log('已寫入 src/data/birds.json');
}
