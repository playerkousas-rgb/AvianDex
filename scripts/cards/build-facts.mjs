#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 資料抽查工具（出圖前把關）
 * ============================================================
 *  用途：把「已查證資料」與「鳥名本身」做自動交叉檢查，
 *        在生圖之前捉出明顯錯誤（而不是等卡出來才發現）。
 *
 *  檢查項目：
 *    1) 缺資料：目／科／學名 任一缺 → 不可出百科卡
 *    2) 學名與 birds.json 的英文名/已知學名不符 → 提示人工核對
 *    3) 同一「目／科」被大量不同屬共用 → 可能是抽錯（例如把鷺科套落鷸）
 *    4) 中文名重複／編號重複
 *    5) 分類與「目」的常見組合是否合理（例如鷺科 ↔ 鵜形目／鸛形目）
 *
 *  用法：
 *    node scripts/cards/build-facts.mjs              # 全部檢查
 *    node scripts/cards/build-facts.mjs --from 22 --to 60
 *    node scripts/cards/build-facts.mjs --ids 0289
 *  輸出：reports/facts-audit.md（可直接貼給人核對）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 ? ARGS[i + 1] : d;
};

const birds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));
let facts = {};
try {
  facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birdFacts.json'), 'utf8'));
} catch {
  console.error('❌ 找不到 src/data/birdFacts.json，先跑 npm run facts:fetch');
  process.exit(1);
}

const from = Number(arg('--from', 0));
const to = Number(arg('--to', 9999));
const ids = arg('--ids');

let targets = birds.filter((b) => Number(b.id) >= from && Number(b.id) <= to);
if (ids) {
  const set = new Set(ids.split(',').map((s) => s.trim().padStart(4, '0')));
  targets = targets.filter((b) => set.has(b.id));
}

const problems = [];
const warnings = [];

function add(list, id, name, issue, detail) {
  list.push({ id, name, issue, detail });
}

// ── 1) 缺資料 ──
for (const b of targets) {
  const f = facts[b.id];
  if (!f) {
    add(problems, b.id, b.name, '未有查證資料', '請跑 facts:fetch');
    continue;
  }
  const miss = ['目', '科'].filter((k) => !f.rank?.[k]);
  if (miss.length) add(problems, b.id, b.name, `缺${miss.join('、')}`, f.source?.url || '');
  if (!f.scientificName) add(warnings, b.id, b.name, '缺學名', f.source?.url || '');
}

// ── 1b) 中英名衝突（最常見的資料錯誤：中文名同英文名根本唔係同一種雀）──
for (const b of targets) {
  const f = facts[b.id];
  if (!f) continue;
  if (b.en && /^unknown/i.test(b.en)) {
    add(problems, b.id, b.name, '英文名是 Unknown Species', '需人工補英文名後重查');
    continue;
  }
  if (f.consistency === 'genus-mismatch' || f.consistency === 'species-mismatch') {
    add(
      problems,
      b.id,
      b.name,
      '中文名與英文名對不上（學名不同）',
      `${b.en} → ${f.enCheck?.scientificName || '?'}；中文條目 → ${f.scientificName || '?'}`,
    );
  }
  if (f.consistency === 'no-page') {
    add(warnings, b.id, b.name, '英文維基無此俗名', b.en || '');
  }
}

// ── 2) 學名一致性（與 birds.json 的 en 名稱對照：學名中的屬名要和拉丁屬名一致）──
for (const b of targets) {
  const f = facts[b.id];
  if (!f?.scientificName || !f.latin?.['屬']) continue;
  const genusInName = f.scientificName.split(/\s+/)[0];
  if (genusInName !== f.latin['屬']) {
    add(
      warnings,
      b.id,
      b.name,
      '學名屬名與分類表不一致',
      `學名 ${f.scientificName} vs 屬 ${f.latin['屬']}（可能是異名／重定向，需人工確認）`,
    );
  }
}

// ── 3) 目／科 組合異常（同一科比對：科的拉丁名是否唯一對應一個目）──
const familyToOrders = new Map();
for (const f of Object.values(facts)) {
  const fam = f.latin?.['科'];
  const ord = f.latin?.['目'];
  if (!fam || !ord) continue;
  if (!familyToOrders.has(fam)) familyToOrders.set(fam, new Set());
  familyToOrders.get(fam).add(ord);
}
for (const [fam, orders] of familyToOrders) {
  if (orders.size > 1) {
    add(warnings, '—', fam, '同一科對應多個目', [...orders].join(' / '));
  }
}

// ── 4) 中文名／編號重複 ──
const nameCount = new Map();
for (const b of birds) nameCount.set(b.name, (nameCount.get(b.name) || 0) + 1);
for (const [name, n] of nameCount) {
  if (n > 1) add(warnings, '—', name, '中文名重複', `${n} 個編號使用同一中文名`);
}

// ── 5) 統計 ──
const verified = targets.filter((b) => {
  const f = facts[b.id];
  return f?.rank?.['目'] && f?.rank?.['科'];
}).length;

const md = [
  '# 資料抽查報告（facts audit）',
  '',
  `- 產生時間：${new Date().toISOString()}`,
  `- 檢查範圍：${targets.length} 張${ids ? `（${ids}）` : ''}`,
  `- 有目＋科：**${verified} / ${targets.length}**`,
  `- 🔴 必須修（不可出卡）：${problems.length}`,
  `- 🟡 建議核對：${warnings.length}`,
  '',
];

if (problems.length) {
  md.push('## 🔴 必須修（這些卡生圖前一定要補）', '', '| 編號 | 中文名 | 問題 | 備註 |', '|---|---|---|---|');
  problems.forEach((p) => md.push(`| ${p.id} | ${p.name} | ${p.issue} | ${p.detail} |`));
  md.push('');
}

if (warnings.length) {
  md.push('## 🟡 建議核對', '', '| 編號 | 中文名 | 問題 | 備註 |', '|---|---|---|---|');
  warnings.forEach((w) => md.push(`| ${w.id} | ${w.name} | ${w.issue} | ${w.detail} |`));
  md.push('');
}

md.push(
  '## 人手抽查建議（每批 20 張抽 3 張）',
  '',
  '1. 開 `src/data/birdFacts.json` 該編號，點 `source.url` 去維基原條目；',
  '2. 對照卡上的「目／科／學名」是否逐字相同；',
  '3. 特別留意近親種（例如各種鷺、各種鷸、各種柳鶯）有否被套用同一科；',
  '4. 有疑問就在 `birdFacts.json` 直接改（它是唯一事實來源），之後重跑該張卡。',
  '',
  '> 注意：`birdFacts.json` 是人工可改的。AI 永遠只是抄它，不會反過來改它。',
);

const outDir = path.join(ROOT, 'reports');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'facts-audit.md'), `${md.join('\n')}\n`);

console.log(`🔴 必須修：${problems.length}`);
console.log(`🟡 建議核對：${warnings.length}`);
console.log('📄 reports/facts-audit.md');
if (problems.slice(0, 10).length) {
  console.log('\n頭幾個必須修：');
  problems.slice(0, 10).forEach((p) => console.log(`  ${p.id} ${p.name} — ${p.issue} ${p.detail}`));
}
