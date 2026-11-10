/* ============================================================
 *  補齊詳細資料（gap fill）測試
 * ------------------------------------------------------------
 *  為甚麼要測這支？
 *    補欄位最容易出事：為了「填滿」而寫出不屬於這隻雀的句子。
 *    這批測試用一條真實條目的存檔原文（藍翡翠）跑，驗四件事：
 *
 *      1. 抽到的句子裏不可以有維基標記殘骸（「]] 具有…」這種）
 *      2. 不可以有「，又名，」這種名字被遮走的爛句
 *      3. 同一句不可以同時塞入兩個欄（浪費版面，而且看起來像重複）
 *      4. 講遷徙的句子要歸位到「遷徙」，不要霸住「行為習性」
 *
 *  最重要的一條：抽不到就留空 —— 空白的卡比錯的卡安全。
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { proposeFromPages, cleanCell } from '../scripts/cards/fill-gaps.mjs';

const root = path.resolve(import.meta.dirname, '..');
const WT = readFileSync(path.join(root, 'tests/fixtures/wiki-zh-lanfeicui.wt'), 'utf8');
const ALL = ['range', 'habitat', 'diet', 'look', 'breeding', 'funFact',
  'voice', 'behavior', 'migration', 'conservation', 'humanRelation', 'etymology'];

const run = () => proposeFromPages(
  { zh: { pageid: 1099000, title: '藍翡翠', wt: WT } },
  { name: '藍翡翠', sci: 'Halcyon pileata', miss: ALL },
);

test('抽到的句子不會有維基標記殘骸', () => {
  for (const [field, cell] of Object.entries(run())) {
    const t = cell.zh || cell.en || '';
    assert.ok(!/\[\[|\]\]|\{\{|\}\}|<ref/i.test(t), `${field} 有標記殘骸：${t}`);
    assert.ok(!t.startsWith('，'), `${field} 以逗號開頭：${t}`);
  }
});

test('不會寫入「名字被遮走」的爛句', () => {
  for (const [field, cell] of Object.entries(run())) {
    const t = cell.zh || cell.en || '';
    assert.ok(!/^(又名|又稱|也稱|俗稱|別名)[，,、：:]/.test(t), `${field} 是殘句：${t}`);
  }
});

test('同一句不會同時出現在兩個欄', () => {
  const got = run();
  const seen = new Map();
  for (const [field, cell] of Object.entries(got)) {
    const key = (cell.zh || cell.en || '').slice(0, 24);
    assert.ok(!seen.has(key), `${field} 與 ${seen.get(key)} 內容重複：${key}`);
    seen.set(key, field);
  }
});

test('講遷徙的句子歸入「遷徙」欄，不會霸住「行為習性」', () => {
  const got = run();
  if (!got.migration) return; // 這條條目抽不到就略過
  assert.match(got.migration.zh || got.migration.en, /遷徙|越冬|過境|留鳥|候鳥/);
  if (got.behavior) {
    assert.ok(!/冬季會遷徙/.test(got.behavior.zh || got.behavior.en),
      '行為習性裏仍然是遷徙句');
  }
});

test('每一格都帶得返 pageid（可回查）', () => {
  for (const [field, cell] of Object.entries(run())) {
    const id = cell.srcZh?.pageid ?? cell.srcEn?.pageid;
    assert.ok(Number.isInteger(id) && id > 0, `${field} 沒有 pageid`);
  }
});

test('已存在的欄位一個字都不會被改動（只補空）', () => {
  // miss 為空 → 不應產生任何建議
  const got = proposeFromPages(
    { zh: { pageid: 1, title: 'x', wt: WT } },
    { name: '藍翡翠', sci: 'Halcyon pileata', miss: [] },
  );
  assert.deepEqual(got, {});
});

test('cleanCell 會丟棄殘骸，保留完整句子', () => {
  assert.equal(cleanCell(']] 具有紫藍色的翅膀和背部，黑色的頭部。'), '具有紫藍色的翅膀和背部，黑色的頭部。');
  assert.equal(cleanCell('，又名，廣泛分佈於熱帶亞洲，從印度向東延伸。'), '');
  assert.equal(cleanCell('[[File:x.jpg|thumb]] 圖說文字'), '');
  assert.equal(cleanCell('短'), '');
  assert.equal(cleanCell('該物種主要棲息於紅樹林和沿海河口地區。'), '該物種主要棲息於紅樹林和沿海河口地區。');
});
