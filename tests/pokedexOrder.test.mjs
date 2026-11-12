/* ============================================================
 *  排序與搜尋測試（node:test）
 *  跑：npm run test:order
 * ------------------------------------------------------------
 *  驗證「跟 eBird 排序、以英文名為主搜尋、中文名只作顯示」：
 *    1) eBird 模式：次序 = taxonOrder（目 → 科 → 種），未對上的排最後
 *    2) NO. 編號永遠唔會因為排序而改變（R2 檔名靠它）
 *    3) 搜尋以英文名優先：打英文名，英文命中排最前
 *    4) 中文名仍然搜得到，但排英文命中之後
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sortBirds, searchBirds } from '../src/lib/pokedexOrder.ts';

const root = path.resolve(import.meta.dirname, '..');
const birds = JSON.parse(readFileSync(path.join(root, 'src/data/birds.json'), 'utf8'));
const taxonomy = JSON.parse(readFileSync(path.join(root, 'src/data/birdTaxonomy.json'), 'utf8'));

/** 造一個似 App 的 Bird 物件 */
function makeBird(b) {
  const tax = taxonomy[b.id];
  return {
    id: b.id,
    name: b.name,
    englishName: tax?.comName || b.en || '???',
    scientificName: tax?.sciName || '???',
    category: tax?.family || '???',
    height: '',
    weight: '',
    description: '',
    imageUrl: '',
    habitat: '',
    diet: '',
    rarity: '',
    discovered: true,
    taxonomy: tax,
  };
}

const list = birds.map(makeBird);

test('eBird 模式：taxonOrder 由細到大（目 → 科 → 種）', () => {
  const sorted = sortBirds(list, 'ebird');
  let prev = -Infinity;
  for (const b of sorted) {
    const order = b.taxonomy?.taxonOrder;
    if (order == null) continue;
    assert.ok(order >= prev, `${b.id} ${b.taxonomy?.comName} 次序倒退：${order} < ${prev}`);
    prev = order;
  }
  assert.equal(sorted[0].taxonomy?.comName, 'Lesser Whistling-Duck', '第一張應該係 eBird 排序最前的鴨');
});

test('排序唔會改 NO. 編號，亦唔會漏卡／多卡', () => {
  for (const mode of ['ebird', 'pokedex', 'chinese']) {
    const sorted = sortBirds(list, mode);
    assert.equal(sorted.length, list.length, `${mode} 張數唔同`);
    assert.deepEqual(
      sorted.map((b) => b.id).sort(),
      list.map((b) => b.id).sort(),
      `${mode} 改動了編號集合`,
    );
  }
  // pokedex 模式必須完全等於原本 0001…0583
  assert.deepEqual(
    sortBirds(list, 'pokedex').map((b) => b.id),
    list.map((b) => b.id),
  );
});

test('未對上 eBird 的卡（??? 佔位）排最後，唔會插隊', () => {
  const withPlaceholder = [
    ...list.slice(0, 5),
    {
      ...makeBird({ id: '9999', name: '???', en: 'Unknown Species' }),
      taxonomy: undefined,
      discovered: false,
    },
  ];
  const sorted = sortBirds(withPlaceholder, 'ebird');
  assert.equal(sorted[sorted.length - 1].id, '9999');
});

test('搜尋以英文名為主：打英文名，英文命中排第一', () => {
  const hits = searchBirds(list, 'spotted dove');
  assert.ok(hits.length > 0, '應該搵到 Spotted Dove');
  assert.equal(hits[0].taxonomy?.comName, 'Spotted Dove');
  assert.equal(hits[0].id, '0001');
});

test('英文名開頭命中優先過中文名包含命中', () => {
  const hits = searchBirds(list, 'magpie');
  assert.ok(hits.length > 0);
  for (let i = 1; i < hits.length; i += 1) {
    const a = (hits[i - 1].taxonomy?.comName || '').toLowerCase();
    const b = (hits[i].taxonomy?.comName || '').toLowerCase();
    if (!a.includes('magpie') && b.includes('magpie')) {
      assert.fail(`排序錯：${hits[i - 1].id} 排在 ${hits[i].id} 之前`);
    }
  }
});

test('中文名仍然搜得到（只係排後）', () => {
  const byZh = searchBirds(list, '珠頸斑鳩');
  assert.ok(byZh.length > 0, '打中文都要搵到');
  assert.equal(byZh[0].id, '0001');

  // 同一個字，英文命中的分數應該高過純中文命中
  const mixed = searchBirds(list, 'dove');
  assert.equal(mixed[0].taxonomy?.comName, 'Spotted Dove');
});

test('學名可以搜，而且唔會被中文名蓋過', () => {
  const hits = searchBirds(list, 'Spilopelia chinensis');
  assert.equal(hits[0].id, '0001');
});

test('空白搜尋＝唔篩選（回傳原清單，由排序決定次序）', () => {
  assert.equal(searchBirds(list, '   ').length, list.length);
});
