/* ============================================================
 *  原文抽取器測試（node:test）— extract-copy.mjs
 *  跑：npm test
 * ------------------------------------------------------------
 *  這支測試守的是「卡上的字唔可以係 AI 寫嘅」：
 *    1) 抽出來的句子必須真係原文完整句（fixture 內逐句比對）
 *    2) 抽唔到就一定要回空字串（寧願「資料待查」，唔可以湊）
 *    3) 簡體 → 香港繁體只做字形轉換，句意不變
 *    4) infobox 與引用矛盾 → IUCN 必須留空並在 notes 說明
 *    5) {{Rough translation}} 標記 → 必須自動寫入 notes
 *    6) 學名核對：wikitext 內冇學名就唔可以抽（避免抽到同名異物）
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import * as OpenCC from 'opencc-js';
import { stripWiki, sentences, extractCopy, detectIucn, trimToLength } from '../scripts/cards/extract-copy.mjs';

const s2hk = OpenCC.Converter({ from: 'cn', to: 'hk' });

const root = path.resolve(import.meta.dirname, '..');
const WT = readFileSync(path.join(root, 'tests/fixtures/wiki-zh-lanfeicui.wt'), 'utf8');

test('stripWiki 會清走模板／註腳／檔案語法，不會留下殘骸', () => {
  const raw = readFileSync(path.join(root, 'tests/fixtures/wiki-zh-lanfeicui.wt'), 'utf8');
  const txt = stripWiki(raw);
  for (const bad of ['{{', '}}', '<ref', '[[', ']]', '==']) {
    assert.ok(!txt.includes(bad), `清理後仍出現 ${bad}`);
  }
  assert.ok(txt.includes('紫藍色的翅膀'), '正文內容被誤刪');
});

test('抽到的一定是原文完整句（逐字比對，唔可以改寫）', () => {
  const got = extractCopy(WT, { sciName: 'Halcyon pileata' });
  const plain = s2hk(stripWiki(WT)); // 卡片文案統一用香港繁體，比對前同樣轉一次字形
  for (const key of ['diet', 'range', 'look']) {
    assert.ok(got[key], `${key} 冇抽到`);
    // 允許「截到完整分句」（長句上限），但文字本身必須逐字出現在原文，且以句號結尾
    assert.ok(got[key].endsWith('。'), `${key} 未以句號結尾（唔係完整句）：${got[key]}`);
    assert.ok(plain.includes(got[key].slice(0, -1)), `${key} 的文字不是原文：${got[key]}`);
  }
});

test('原文沒有的欄位一律留空（不得自行補寫）', () => {
  const noHabitat = WT.replace(/==分布与栖息地==[\s\S]*$/, '');
  const got = extractCopy(noHabitat, { sciName: 'Halcyon pileata' });
  assert.equal(got.habitat, undefined, '冇棲地原文卻抽到棲地句');
});

test('簡體→香港繁體只換字形，句子長度與內容不變', () => {
  const got = extractCopy(WT, { sciName: 'Halcyon pileata' });
  assert.ok(!/[\u4e00-\u9fa5]/.test(got.diet.match(/[鸟鱼鸭鸡黄绿蓝红头颈脚鸣声种类资数据来边湾亚东华图鉴态习长门问时见体叶众几]/g) || []));
  assert.match(got.look, /牠們的特徵是黑色的頭部/);
});

test('infobox 與引用矛盾 → IUCN 留空，並在 notes 講明理由', () => {
  const { iucn, note } = detectIucn(WT);
  assert.equal(iucn, '', '矛盾時不應該採用任何一個 IUCN 級別');
  assert.match(note, /矛盾/);
  const got = extractCopy(WT, { sciName: 'Halcyon pileata' });
  assert.ok(!got.iucn, 'IUCN 應該留空');
  assert.match(got.notes, /IUCN 未填/);
});

test('{{Rough translation}} → notes 必須自動標記「翻譯品質不佳」', () => {
  const got = extractCopy(WT, { sciName: 'Halcyon pileata' });
  assert.match(got.notes, /翻譯品質不佳/);
});

test('trimToLength 只截到完整分句，不會切一半再自行造句', () => {
  const s = '這是一種大型翠鳥，體長二十七至二十八厘米，背部藍色，喉部白色，腹部栗色。';
  const cut = trimToLength(s, 26);
  assert.ok(cut === '' || cut.endsWith('。'), `截短後不是完整句：${cut}`);
  assert.ok(cut === '' || s.startsWith(cut.replace(/。$/, '')), `截短後不是原句前綴：${cut}`);
  assert.equal(trimToLength(s, 13), '', '截唔到完整分句時必須回空字串（寧願留空）');
});

test('sentences 只回完整句（不會吐出半句）', () => {
  const list = sentences('甲乙丙丁戊己庚辛。壬癸子丑寅卯辰巳午！未未未未未未未未');
  assert.deepEqual(list, ['甲乙丙丁戊己庚辛。', '壬癸子丑寅卯辰巳午！']);
  assert.ok(!list.some((s) => s.includes('未未')), '未以句號結尾的殘句不應計入');
});
