#!/usr/bin/env node
/**
 * 套用「香港優先」編號表（scripts/cards/hk-master.json）：
 *   1. kept 的編號：中文名改為香港名錄用名（英文學名不動）
 *   2. assigned：這些編號改成香港名錄缺的種（英文名＝eBird/Clements），0570 起為新增編號
 *   3. 被換掉的編號：清掉舊物種的逐編號資料（cardCopy／measurements／cardDetails／cardSources／dexScores），
 *      避免新物種掛著舊物種的文案；新物種的欄位一律「資料待查」，不由 AI 補
 *   4. taxonomyOverrides：被換掉的編號移除覆寫；中文名同步
 * 之後請跑：  node scripts/cards/enrich-birds.mjs --apply && node scripts/cards/build-explorer-data.mjs
 * 用法：node scripts/cards/apply-hk-master.mjs [--write]
 */
import fs from 'node:fs';
const ROOT = new URL('../../', import.meta.url).pathname;
const D = ROOT + 'src/data/';
const rd = f => JSON.parse(fs.readFileSync(D + f, 'utf8'));
const WRITE = process.argv.includes('--write');
const master = JSON.parse(fs.readFileSync(ROOT + 'scripts/cards/hk-master.json', 'utf8'));
const birds = rd('birds.json');
const byId = new Map(birds.map(b => [b.id, b]));
let renamed = 0, swapped = 0, added = 0;
const reassigned = [];
for (const [id, k] of Object.entries(master.kept)) {
  const b = byId.get(id);
  if (b && b.name !== k.zh) { b.name = k.zh; renamed++; }
}
for (const [id, m] of Object.entries(master.assigned)) {
  const b = byId.get(id);
  if (b) {
    if (b.name === m.zh && b.en === m.en) continue;
    reassigned.push(id); b.name = m.zh; b.en = m.en; swapped++;
  } else { const nb = { id, name: m.zh, en: m.en }; birds.push(nb); byId.set(id, nb); added++; }
}
birds.sort((a, b) => a.id.localeCompare(b.id));
console.log(`改中文名 ${renamed}｜換物種 ${swapped}｜新增編號 ${added}｜總數 ${birds.length}`);
if (!WRITE) process.exit(0);
fs.writeFileSync(D + 'birds.json', JSON.stringify(birds, null, 2) + '\n');
const prune = (file, pick) => {
  const raw = fs.readFileSync(D + file, 'utf8'); const pretty = /^\{\n  "/.test(raw);
  const j = JSON.parse(raw); const t = pick(j); let n = 0;
  for (const id of reassigned) if (t[id] !== undefined) { delete t[id]; n++; }
  fs.writeFileSync(D + file, JSON.stringify(j, null, pretty ? 2 : 0) + (raw.endsWith('\n') ? '\n' : '')); return n;
};
const pr = [
  ['cardCopy.json', j => j], ['measurements.json', j => j],
  ['cardDetails.zh.json', j => j.birds], ['cardDetails.en.json', j => j.birds],
  ['cardSources.json', j => j.sources], ['dexScores.json', j => j.scores],
];
for (const [f, p] of pr) console.log('清除', f, prune(f, p));
const ov = rd('taxonomyOverrides.json');
for (const id of reassigned) delete ov[id];
for (const [id, k] of Object.entries(master.kept)) if (ov[id] && ov[id].nameZh && ov[id].nameZh !== k.zh) ov[id].nameZh = k.zh;
fs.writeFileSync(D + 'taxonomyOverrides.json', JSON.stringify(ov, null, 2) + '\n');
console.log('已寫入。請接著跑 enrich-birds --apply 與 build-explorer-data');
