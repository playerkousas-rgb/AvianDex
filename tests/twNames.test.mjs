/**
 * 兩套中文名並存：香港慣用名做主名，台灣鳥類名錄的名做別名。
 *
 * 為什麼有這個測試？
 *   華文圈沒有一個「官方」中文鳥名。香港觀鳥會、台灣野鳥學會各有名錄，
 *   兩邊都是長年通行的叫法，沒有誰比誰權威。
 *   圖鑑的責任是：見到任何一邊的名字都搵得到隻雀，
 *   而不是把另一個名字當錯字刪掉。
 *
 * 所以規矩是：
 *   1. cardCopy.json／birds.json 的主名永遠是香港寫法，台灣工具不得覆蓋
 *   2. 台灣名只出現在別名（explorerIndex.n），搜尋時可命中（via: 'alias'）
 *   3. 別名欄位有上限，所以要有優先次序，唔可以盲塞
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.resolve(import.meta.dirname, '../src/data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));

test('主名唔會被台灣名錄覆蓋（bird name 與 cardCopy 一致）', () => {
  const birds = read('birds.json');
  const copy = read('cardCopy.json');
  const bad = [];
  for (const b of birds) {
    const c = copy[b.id];
    if (c && c.name && c.name !== b.name) bad.push(`${b.id} ${b.name} ≠ ${c.name}`);
  }
  assert.deepEqual(bad, [], `主名被改動：${bad.slice(0, 5).join('；')}`);
});

test('台灣名只作別名，且未取代主名', () => {
  const twPath = path.join(DATA, 'twNames.json');
  if (!fs.existsSync(twPath)) return; // 未跑過 npm run cards:tw，略過
  const tw = JSON.parse(fs.readFileSync(twPath, 'utf8')).names || {};
  const idx = read('explorerIndex.json').birds;
  const birds = read('birds.json');
  const byId = new Map(birds.map((b) => [b.id, b]));

  for (const [id, v] of Object.entries(tw)) {
    const b = byId.get(id);
    if (!b || !idx[id]) continue;
    // 主名保持香港寫法
    assert.equal(idx[id].z, b.name, `${id} 主名被台灣名覆蓋`);
    // 台灣名入別名（若與主名不同）
    if (v.zh && v.zh !== b.name) {
      assert.ok(
        (idx[id].n || []).includes(v.zh),
        `${id} 台灣名「${v.zh}」未入別名，打台灣名會搵唔到`,
      );
    }
  }
});

test('別名表有出處（可回查）', () => {
  const twPath = path.join(DATA, 'twNames.json');
  if (!fs.existsSync(twPath)) return;
  const f = JSON.parse(fs.readFileSync(twPath, 'utf8'));
  assert.ok(f._readme, '缺少 _readme');
  assert.match(f._readme.來源, /臺灣鳥類名錄|台灣鳥類名錄/);
  assert.match(f._readme.取得, /^https?:\/\//);
});
