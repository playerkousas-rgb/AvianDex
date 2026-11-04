/* ============================================================
 *  資料查證測試（node:test）
 *  跑：npm run test:facts
 * ------------------------------------------------------------
 *  驗證「AI 不准自己編分類」的機制：
 *    1) 維基科學分類表抽得準（目/科/屬 + 學名 + IUCN）
 *    2) 抽不到的欄位會標記為「資料待查」，而不是靜靜留空
 *    3) 提示詞只會包含已查證資料
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseTaxobox, factsBlock, htmlToText } from '../scripts/cards/parse-taxobox.mjs';

const root = path.resolve(import.meta.dirname, '..');
const fixture = readFileSync(path.join(root, 'tests/fixtures/wiki-zhuhuanqiu-section0.html'), 'utf8');

test('由維基科學分類表抽出正確的分類（珠頸斑鳩）', () => {
  const facts = parseTaxobox(fixture);
  assert.equal(facts.rank['目'], '鴿形目');
  assert.equal(facts.latin['目'], 'Columbiformes');
  assert.equal(facts.rank['科'], '鳩鴿科');
  assert.equal(facts.latin['科'], 'Columbidae');
  assert.equal(facts.rank['屬'], '副斑鳩屬');
  assert.equal(facts.latin['屬'], 'Spilopelia');
  assert.equal(facts.scientificName, 'Spilopelia chinensis');
  assert.match(facts.iucn, /無危/);
  assert.ok(facts.intro.includes('珠頸斑鳩'), '首段應該抽到物種描述');
});

test('抽不到的欄位要留空，不准估', () => {
  const facts = parseTaxobox('保護狀況\n資料缺乏（IUCN 3.1）\n科學分類\n界：\n動物界 Animalia');
  assert.equal(facts.rank['目'], undefined);
  assert.equal(facts.rank['科'], undefined);
  assert.equal(facts.scientificName, '');
});

test('提示詞只包含已查證資料，缺欄位會明確標示「不准猜」', () => {
  const facts = parseTaxobox(fixture);
  facts.source = { url: 'https://zh.wikipedia.org/wiki/珠颈斑鸠', pageid: 554483 };
  const block = factsBlock(facts, { name: '珠頸斑鳩', en: 'Spotted Dove' });

  assert.match(block, /鴿形目（Columbiformes）/);
  assert.match(block, /鳩鴿科（Columbidae）/);
  assert.match(block, /Spilopelia chinensis/);
  assert.match(block, /嚴禁自行補充/);

  const missing = factsBlock(parseTaxobox('界：動物界 Animalia'), { name: 'X', en: 'Y' });
  assert.match(missing, /資料待查/);
  assert.match(missing, /不准猜/);
});

test('HTML 轉文字不會把分類表吞掉', () => {
  const text = htmlToText('<tr><td>目：</td><td>鴿形目 Columbiformes</td></tr>');
  assert.match(text, /目：/);
  assert.match(text, /Columbiformes/);
});
