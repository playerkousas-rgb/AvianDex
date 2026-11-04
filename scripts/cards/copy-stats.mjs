#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 卡面文案覆蓋率統計（可離線跑，無網路）
 * ============================================================
 *  用途：
 *    · 本地看進度：node scripts/cards/copy-stats.mjs
 *    · GitHub Actions（extract-copy workflow）用它生成 PR 描述
 *
 *  輸出兩種格式：
 *    預設        人類看的表格
 *    --markdown  貼進 PR／Issue 的 Markdown（會被 workflow 寫入 PR body）
 *    --json      給其他腳本用
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const COPY = path.join(ROOT, 'src/data/cardCopy.json');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const TAX = path.join(ROOT, 'src/data/birdTaxonomy.json');

const FIELDS = ['diet', 'range', 'look', 'habitat', 'funFact', 'iucn'];
const ARGS = process.argv.slice(2);
const wants = (f) => ARGS.includes(f);

const copy = JSON.parse(fs.readFileSync(COPY, 'utf8'));
const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
const tax = JSON.parse(fs.readFileSync(TAX, 'utf8'));

const ids = Object.keys(copy).filter((k) => /^\d{4}$/.test(k)).sort();
const totalSlots = birds.length;
const withTax = birds.filter((b) => tax[b.id]).length;

const rows = ids.map((id) => {
  const c = copy[id];
  const have = FIELDS.filter((f) => String(c[f] || '').trim());
  const missing = FIELDS.filter((f) => !String(c[f] || '').trim());
  return {
    id,
    name: (birds.find((b) => b.id === id) || {}).name || '',
    have: have.length,
    missing,
    hasNotes: Boolean(String(c.notes || '').trim()),
    source: String(c.source || ''),
  };
});

const full = rows.filter((r) => r.have === FIELDS.length);
const partial = rows.filter((r) => r.have > 0 && r.have < FIELDS.length);
const empty = rows.filter((r) => r.have === 0);

// 缺欄原因統計（哪一欄最常缺）
const missCount = {};
for (const f of FIELDS) missCount[f] = rows.filter((r) => r.missing.includes(f)).length;

// 冇 source 的卡（不合格，不應上卡）
const noSource = rows.filter((r) => !r.source.trim());

const stats = {
  totalSlots,
  withTaxonomy: withTax,
  cardsWithCopy: ids.length,
  full: full.length,
  partial: partial.length,
  empty: empty.length,
  noSource: noSource.map((r) => r.id),
  missingByField: missCount,
  coveragePct: ids.length ? Math.round((full.length / ids.length) * 100) : 0,
  ofTaxonomyPct: withTax ? Math.round((full.length / withTax) * 100) : 0,
};

if (wants('--json')) {
  console.log(JSON.stringify({ ...stats, rows }, null, 2));
} else if (wants('--markdown')) {
  const pct = (n) => `${Math.round((n / Math.max(withTax, 1)) * 100)}%`;
  const lines = [
    '### 卡面文案覆蓋率（自動抽取後）',
    '',
    `- 圖鑑槽位：**${totalSlots}**；已對上 eBird：**${withTax}**`,
    `- 有文案的卡：**${ids.length}**（完整 ${full.length}／部分 ${partial.length}／全空 ${empty.length}）`,
    `- 六欄全齊：**${full.length} / ${withTax}（${pct(full.length)}）**`,
    `- 冇 source 的卡：**${noSource.length}**${noSource.length ? `（${noSource.map((r) => r.id).slice(0, 10).join(' ')}…）` : ''}`,
    '',
    '| 欄位 | 仍缺張數 |',
    '|---|---|',
    ...FIELDS.map((f) => `| ${f} | ${missCount[f]} |`),
    '',
    '> 抽唔到的欄位一律留空，卡面印「資料待查」；**沒有 AI 代寫**。',
    '> 若某欄缺得特別多，通常代表中文維基該物種條目本身冇呢段（不是程式問題），',
    '> 需要換來源（HKBWS 名錄／香港鳥類圖鑑）才可補。',
  ];
  console.log(lines.join('\n'));
} else {
  console.log(`圖鑑槽位 ${totalSlots}｜已對上 eBird ${withTax}`);
  console.log(
    `有文案 ${ids.length}（完整 ${full.length}／部分 ${partial.length}／全空 ${empty.length}）｜六欄全齊 ${stats.ofTaxonomyPct}% of eBird 卡`,
  );
  console.log('');
  console.log('欄位        仍缺');
  for (const f of FIELDS) console.log(`${f.padEnd(10)} ${String(missCount[f]).padStart(4)}`);
  if (noSource.length) console.log(`\n⚠️ 冇 source：${noSource.map((r) => r.id).join(' ')}`);
  const worst = rows.filter((r) => r.have > 0 && r.have < FIELDS.length).slice(0, 12);
  if (worst.length) {
    console.log('\n部分完成的卡（缺哪幾欄）：');
    for (const r of worst) console.log(`  ${r.id} ${r.name} — 缺 ${r.missing.join('/')}`);
  }
}
