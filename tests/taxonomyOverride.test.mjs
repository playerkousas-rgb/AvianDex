/* ============================================================
 *  分類覆寫表測試（node:test）
 *  跑：npm test
 * ------------------------------------------------------------
 *  taxonomyOverrides.json 係「人手核定」的物種對照，錯一個字就會
 *  令整張卡顯示錯科、錯學名，所以呢度要擋住：
 *    1) 每筆都要有 speciesCode、evidence、note（要有得追溯）
 *    2) speciesCode 一定存在於 ebird-taxonomy.csv
 *    3) 覆寫之後 birdTaxonomy.json 真係指住同一種
 *    4) 不准再有英文名係 Unknown Species 的卡
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));

const overrides = read('src/data/taxonomyOverrides.json');
const taxonomy = read('src/data/birdTaxonomy.json');
const birds = read('src/data/birds.json');
const lines = readFileSync(path.join(root, 'src/data/ebird-taxonomy.csv'), 'utf8')
  .split('\n')
  .filter(Boolean);
const codes = new Set(lines.slice(1).map((l) => l.split(',')[0]));
const entries = Object.entries(overrides).filter(([id]) => !id.startsWith('_'));

test('覆寫表每筆都有 speciesCode / evidence / note', () => {
  assert.ok(entries.length > 0, '覆寫表係空嘅');
  for (const [id, o] of entries) {
    assert.match(id, /^\d{4}$/, `${id} 唔係 4 位編號`);
    assert.ok(o.speciesCode, `${id} 冇 speciesCode`);
    assert.ok((o.evidence || '').trim().length > 20, `${id} 冇足夠 evidence（要寫得出依據）`);
    assert.ok((o.note || '').trim(), `${id} 冇 note`);
  }
});

test('覆寫表的 eBird 代碼都存在於 ebird-taxonomy.csv', () => {
  for (const [id, o] of entries) {
    assert.ok(codes.has(o.speciesCode), `${id} 的代碼 ${o.speciesCode} 唔存在`);
  }
});

test('birdTaxonomy.json 已經跟覆寫表（跑 npm run birds:enrich -- --apply 後）', () => {
  for (const [id, o] of entries) {
    const t = taxonomy[id];
    assert.ok(t, `${id} 冇 taxonomy`);
    assert.equal(t.speciesCode, o.speciesCode, `${id} 的 speciesCode 未同步`);
    assert.ok(t.sciName && t.familyZh, `${id} 缺學名或中文科名`);
  }
});

test('不准再有 Unknown Species 的英文名', () => {
  const bad = birds.filter((b) => /^unknown\b/i.test((b.en || '').trim())).map((b) => b.id);
  assert.deepEqual(bad, [], `仲有 ${bad.length} 張：${bad.join(' ')}`);
});

test('覆寫表指定的中文名要同 birds.json 一致', () => {
  for (const [id, o] of entries) {
    if (!o.nameZh) continue;
    const b = birds.find((x) => x.id === id);
    assert.equal(b.name, o.nameZh, `${id} 中文名未同步（應為 ${o.nameZh}）`);
  }
});
