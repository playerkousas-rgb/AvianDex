/* ============================================================
 *  簡體 → 香港繁體測試（node:test）
 *  跑：npm test
 * ------------------------------------------------------------
 *  zh-hk.mjs 是「只轉字形、不改詞」的最後一道閘，出錯會直接印在卡面，
 *  所以呢度要鎖死四件事：
 *    1) 簡體一定轉到（含繁簡混排那句）
 *    2) 純繁體句一個字都唔准改（OpenCC 會把「群」變「羣」、「厘米」變「釐米」）
 *    3) 香港慣用寫法（台灣／厘米／干擾／了解／岩）唔會被轉成古體
 *    4) 英文、學名、檔名一律原樣
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';

import { toHk, toHkDeep, looksSimplified } from '../scripts/cards/zh-hk.mjs';

test('簡體字一定轉成繁體', () => {
  assert.equal(toHk('这种翠鸟含有鱼类'), '這種翠鳥含有魚類');
  assert.equal(toHk('分布于四川、云南'), '分佈於四川、雲南');
  assert.equal(toHk('主要栖息于山地、林缘'), '主要棲息於山地、林緣');
});

test('繁簡混排的句子也要轉（維基不少條目是這樣）', () => {
  /* 0084 實例：整段繁體，中間夾一個簡體「们」 */
  assert.equal(toHk('它们分佈在泰國南部'), '它們分佈在泰國南部');
  assert.equal(looksSimplified('它们分佈在泰國南部'), true);
  /* 同一個詞已經是繁體 → 唔准再改 */
  assert.equal(toHk('它們分佈在泰國南部'), '它們分佈在泰國南部');
});

test('純繁體句一個字都唔准改（OpenCC 會出古體）', () => {
  const cases = [
    '這種翠鳥分佈於尼泊爾，體長19至21厘米',
    '台灣、裡面、干擾、了解、群島、岩石、公里',
    '達烏里寒鴉',
    '鵲鴝體長19至21厘米，雄鳥上半部為黑色',
  ];
  for (const s of cases) assert.equal(toHk(s), s, `繁體句被改動：${s} → ${toHk(s)}`);
  for (const s of cases) assert.equal(looksSimplified(s), false, `誤判為簡體：${s}`);
});

test('香港慣用寫法（唔會變古體／異體）', () => {
  assert.equal(toHk('臺灣'), '台灣');
  assert.equal(toHk('公釐'), '毫米');
  assert.equal(toHk('瞭解'), '了解');
  assert.equal(toHk('幹擾'), '干擾');
  assert.ok(!toHk('這種翠鳥分佈於尼泊爾').includes('羣'));
});

test('英文／學名／檔名原樣保留', () => {
  for (const s of ['Niltava davidi', 'File:Gold.jpg', 'Black Paradise-Flycatcher', 'IUCN LC']) {
    assert.equal(toHk(s), s);
  }
});

test('idempotent：轉兩次結果一樣', () => {
  const once = toHk('主要栖息于山地、林缘，分布于四川，台湾');
  assert.equal(toHk(once), once);
});

test('toHkDeep 逐層轉換巢狀結構', () => {
  const input = { a: '这种鸟', b: ['分布于云南'], c: { d: '台湾' }, n: 5 };
  const out = toHkDeep(input);
  assert.equal(out.a, '這種鳥');
  assert.deepEqual(out.b, ['分佈於雲南']);
  assert.equal(out.c.d, '台灣');
  assert.equal(out.n, 5);
});
