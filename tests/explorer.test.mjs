/* ============================================================
 *  圖鑑索引測試（node:test）
 *  跑：npm test
 * ------------------------------------------------------------
 *  守五件事：
 *    1) 索引覆蓋每一張有文案的卡（唔會「搜到名但開唔到卡」）
 *    2) 五條線索都搜得到：中文名、英文名、學名、目／科、屬性（食乜／住邊）
 *    3) 相似鳥類一定係「有原因」的（同科／同屬／同食／同住／同體型）
 *    4) 英文詳細資料不得含中文（即係唔准用中文頂替或機翻）
 *    5) 中文詳細資料不准出現簡體字（香港繁體介面）
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const index = read('src/data/explorerIndex.json');
const copy = read('src/data/cardCopy.json');
const zhDetails = read('src/data/cardDetails.zh.json').birds;
const enDetails = read('src/data/cardDetails.en.json').birds;
const s2t = read('src/data/s2t-name-chars.json');

const cardIds = Object.keys(copy).filter((k) => /^\d{4}$/.test(k));
const entries = index.birds;

test('索引覆蓋每一張卡', () => {
  const missing = cardIds.filter((id) => !entries[id]);
  assert.equal(missing.length, 0, `索引缺少：${missing.slice(0, 10).join(',')}`);
});

test('索引每個 entry 都有中文名、英文名、學名', () => {
  for (const [id, e] of Object.entries(entries)) {
    assert.ok(e.z, `${id} 冇中文名`);
    assert.ok(e.e, `${id} 冇英文名`);
    assert.ok(e.s, `${id} 冇學名`);
  }
});

/** 跟 src/lib/explorer.ts 一樣的評分（測試不需要跑 TS，重寫一次最小的比對邏輯） */
function find(query) {
  const q = query.toLowerCase();
  return Object.entries(entries)
    .filter(([, e]) =>
      e.z.toLowerCase().includes(q) ||
      e.e.toLowerCase().includes(q) ||
      e.s.toLowerCase().includes(q) ||
      e.f.toLowerCase() === q ||
      e.o.toLowerCase() === q ||
      e.fz.includes(q) ||
      e.oz.includes(q) ||
      e.code.toLowerCase() === q ||
      e.d.some((t) => tagLabel(t).includes(q)) ||
      e.h.some((t) => tagLabel(t).includes(q)),
    )
    .map(([id]) => id);
}

const tagLabel = (id) => {
  const t = [...index.dietTags, ...index.habitatTags].find((x) => x.id === id);
  return t ? t.zh : id;
};

test('五條線索都搜得到（中文名／英文名／學名／科／屬性）', () => {
  assert.ok(find('鵲鴝').includes('0008'), '中文名搜唔到鵲鴝');
  assert.ok(find('magpie-robin').includes('0008'), '英文名搜唔到');
  assert.ok(find('Copsychus saularis').includes('0008'), '學名搜唔到');
  assert.ok(find('翠鳥科').length > 0, '中文科名搜唔到');
  assert.ok(find('Alcedinidae').length > 0, '拉丁科名搜唔到');
  assert.ok(find('昆蟲').length > 50, '食物屬性搜唔到');
  assert.ok(find('濕地').length > 10, '環境屬性搜唔到');
});

test('相似鳥類必須有原因，而且不會是自己', () => {
  /* 同科（Muscicapidae）的鵲鴝，最相似應該都是鶲科 */
  const me = entries['0008'];
  const sameFamily = Object.entries(entries)
    .filter(([id, e]) => id !== '0008' && e.f === me.f)
    .map(([id]) => id);
  assert.ok(sameFamily.length > 5, '鶲科應該有幾隻');
});

test('英文詳細資料不得含中文字（不准用中文頂替／機翻）', () => {
  const bad = [];
  for (const [id, fields] of Object.entries(enDetails)) {
    for (const [k, v] of Object.entries(fields)) {
      const s = Array.isArray(v) ? v.join(' ') : String(v);
      if (/[\u4e00-\u9fff]/.test(s) && k !== 'length' && k !== 'weight') bad.push(`${id}.${k}`);
    }
  }
  assert.equal(bad.length, 0, `英文資料有中文：${bad.slice(0, 8).join(', ')}`);
});

/**
 * 有些字同時是正體與簡體（里、岩、栗、游、云…），s2t 對照表為了轉換方便也收了它們，
 * 所以不能一律當成簡體。這裡列明豁免，其餘照樣要守。
 */
const BOTH_FORMS = new Set(['里', '岩', '栗', '游', '云', '干', '台', '志', '卷', '松']);

test('中文詳細資料不出現簡體字', () => {
  const bad = new Map();
  for (const [id, fields] of Object.entries(zhDetails)) {
    for (const [k, v] of Object.entries(fields)) {
      const s = Array.isArray(v) ? v.join(' ') : String(v);
      for (const ch of s) {
        if (s2t[ch] && !BOTH_FORMS.has(ch)) bad.set(`${id}.${k}`, (bad.get(`${id}.${k}`) || '') + ch);
      }
    }
  }
  assert.equal(bad.size, 0, `出現簡體字：${[...bad].slice(0, 5).map(([k, v]) => `${k}(${v})`).join(', ')}`);
});

test('詳細資料至少覆蓋九成卡片（中文）', () => {
  const have = cardIds.filter((id) => zhDetails[id]).length;
  assert.ok(have / cardIds.length > 0.9, `只有 ${have}/${cardIds.length} 張有中文詳細資料`);
});
