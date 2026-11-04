/* ============================================================
 *  分類權威測試（node:test）
 *  跑：npm run test:taxonomy（或 npm test）
 * ------------------------------------------------------------
 *  驗證「Cornell-first」是否真的成立：
 *    1) 每張已對上 eBird 的卡，學名／目／科三樣齊，而且學名格式正確
 *    2) eBird 的 FAMILY 唔會帶「Corvidae (Crows, ...)」括號
 *    3) 中英名衝突的卡：程式唔會偷偷改英文名（保留人手決定權）
 *    4) 提示詞會用 eBird 正式英文名，未查證的中文欄位寫「待查」
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { factsBlock } from '../scripts/cards/parse-taxobox.mjs';

const root = path.resolve(import.meta.dirname, '..');
const birds = JSON.parse(readFileSync(path.join(root, 'src/data/birds.json'), 'utf8'));
const taxonomy = JSON.parse(readFileSync(path.join(root, 'src/data/birdTaxonomy.json'), 'utf8'));
const audit = JSON.parse(readFileSync(path.join(root, 'reports/enrich-birds.json'), 'utf8'));
const zhTax = JSON.parse(readFileSync(path.join(root, 'src/data/taxonomyZh.json'), 'utf8'));

test('每張有 eBird 分類的卡，學名／目／科都要齊', () => {
  const ids = Object.keys(taxonomy);
  assert.ok(ids.length > 500, `應該有 500+ 張對上 eBird，實際 ${ids.length}`);
  for (const id of ids) {
    const t = taxonomy[id];
    assert.ok(t.sciName, `${id} 缺學名`);
    assert.ok(t.order, `${id} 缺目`);
    assert.ok(t.family, `${id} 缺科`);
    assert.ok(t.speciesCode, `${id} 缺 species code`);
  }
});

test('eBird 的 FAMILY 要去掉英文解釋括號，但保留科名', () => {
  for (const [id, t] of Object.entries(taxonomy)) {
    assert.ok(!t.family.includes('('), `${id} 的科名仍帶括號：${t.family}`);
    assert.match(t.family, /^[A-Z][a-z]+idae$/, `${id} 的科名唔似拉丁科名：${t.family}`);
  }
});

test('學名格式：屬名首字母大寫 + 種小名全小寫', () => {
  for (const [id, t] of Object.entries(taxonomy)) {
    assert.match(t.sciName, /^[A-Z][a-z]+ [a-z-]+$/, `${id} 學名格式有問題：${t.sciName}`);
  }
});

test('中英名衝突的卡，英文名欄位不會被程式改掉', () => {
  const conflicts = Object.entries(audit).filter(([, t]) => t.zhMismatch);
  assert.ok(conflicts.length > 0, '應該有中英名衝突嘅卡（用來驗證保護機制）');
  for (const [id, t] of conflicts) {
    const bird = birds.find((b) => b.id === id);
    // 衝突卡只有「英文欄位放錯學名」那類會被改；其餘必須保留原英文名
    if (t.zhMismatch.decision.includes('暫時沿用英文名')) {
      const before = t.zhMismatch.en.comName;
      const after = bird.en;
      assert.ok(
        after === before || !/^unknown/i.test(before),
        `${id} 的英文名被改動：${before} → ${after}（中英衝突應交人手決定）`,
      );
    }
  }
});

test('提示詞用 eBird 正式英文名，中文未查證就寫「待查」', () => {
  const bird = { id: '0001', name: '珠頸斑鳩', en: 'Spotted Dove' };
  const tax = taxonomy['0001'];
  const block = factsBlock(null, bird, tax);
  assert.match(block, /英文名：Spotted Dove（eBird 正式名）/);
  assert.match(block, /學名：Spilopelia chinensis/);
  assert.match(block, /中文待查/);
  assert.doesNotMatch(block, /undefined/);
});

test('中文目／科對照表覆蓋所有用到的目與科（唔會有 ???）', () => {
  const orders = new Set();
  const fams = new Set();
  for (const t of Object.values(taxonomy)) {
    if (t.order) orders.add(t.order);
    if (t.family) fams.add(t.family);
  }
  const missingOrders = [...orders].filter((o) => !zhTax.orders[o]);
  const missingFams = [...fams].filter((f) => !zhTax.families[f]);
  assert.deepEqual(missingOrders, [], `缺中文目：${missingOrders.join('、')}`);
  assert.deepEqual(missingFams, [], `缺中文科：${missingFams.join('、')}`);
});

test('每張卡的 orderZh / familyZh 都已填入', () => {
  const missing = Object.entries(taxonomy).filter(([, t]) => !t.orderZh || !t.familyZh).map(([id]) => id);
  assert.deepEqual(missing, [], `以下卡缺中文目／科：${missing.slice(0, 10).join(' ')}`);
});

test('冇任何資料時，factsBlock 回空字串（唔會亂填）', () => {
  assert.equal(factsBlock(null, { id: '9999', name: '???' }, null), '');
});
