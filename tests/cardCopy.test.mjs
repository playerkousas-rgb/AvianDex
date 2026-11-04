/* ============================================================
 *  圖卡文案測試（node:test）
 *  跑：npm run test:copy
 * ------------------------------------------------------------
 *  驗證「卡上的字唔可以亂嚟」：
 *    1) 每個有文案的編號，都必須有 source（可追溯）
 *    2) 欄位長度上限（超出會被排版引擎截斷，就會漏字）
 *    3) callouts 最多 3 點、label ≤ 6 字、text ≤ 12 字
 *    4) 不准出現簡體字（香港繁體介面）
 *    5) 編號要存在於 birds.json，唔可以作一個唔存在的物種
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const copyAll = JSON.parse(readFileSync(path.join(root, 'src/data/cardCopy.json'), 'utf8'));
const birds = JSON.parse(readFileSync(path.join(root, 'src/data/birds.json'), 'utf8'));
const birdIds = new Set(birds.map((b) => b.id));

const entries = Object.entries(copyAll).filter(([k]) => /^\d{4}$/.test(k));

/** 只檢查常見簡體字（避免誤判，用一組高頻字） */
const SIMPLIFIED = ['鸟', '鱼', '鸭', '鸦', '鹅', '鸡', '黄', '绿', '蓝', '红', '头', '颈', '脚', '鸣', '声', '种', '类', '资', '数', '据', '来', '边', '湾', '亚', '东', '华', '图', '鉴', '态', '习', '长', '门', '问', '时', '见', '体', '叶', '众', '几'];

const LIMITS = { diet: 46, range: 46, look: 46, habitat: 46, funFact: 60, iucn: 12, source: 96 };

test('每個文案都有對應的卡片編號', () => {
  for (const [id] of entries) {
    assert.ok(birdIds.has(id), `${id} 唔存在於 birds.json`);
  }
});

test('每個文案都要有 source（可追溯）', () => {
  for (const [id, c] of entries) {
    assert.ok((c.source || '').trim().length > 0, `${id} 冇 source，卡上會變成「資料待查」`);
  }
});

test('欄位長度唔可以超出排版上限', () => {
  for (const [id, c] of entries) {
    for (const [key, max] of Object.entries(LIMITS)) {
      const v = c[key];
      if (!v) continue;
      assert.ok([...v].length <= max, `${id} 的 ${key} 有 ${[...v].length} 字，超出 ${max} 字上限（會被截斷）`);
    }
  }
});

/** 顯示寬度：中文／全形 = 2，英數 = 1（同排版引擎的估算一致） */
const dw = (s) => [...(s || '')].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0);

test('callouts 格式：最多 3 點、label 寬 ≤ 13、text 寬 ≤ 24', () => {
  for (const [id, c] of entries) {
    const marks = c.callouts || [];
    assert.ok(marks.length <= 3, `${id} 有 ${marks.length} 個 callout（最多 3）`);
    for (const m of marks) {
      assert.ok(dw(m.label) <= 13, `${id} callout label 太寬（${dw(m.label)}）：${m.label}`);
      assert.ok(dw(m.text) <= 24, `${id} callout text 太寬（${dw(m.text)}）：${m.text}`);
      assert.ok((m.label || '').trim() && (m.text || '').trim(), `${id} callout 有空白欄位`);
    }
  }
});

test('不准出現簡體字（香港繁體介面）', () => {
  const texts = [];
  for (const [id, c] of entries) {
    texts.push([id, c.diet, c.range, c.look, c.habitat, c.funFact, c.source, c.orderZh, c.familyZh]);
  }
  for (const [id, ...values] of texts) {
    for (const v of values) {
      if (!v) continue;
      const bad = SIMPLIFIED.filter((ch) => v.includes(ch));
      assert.equal(bad.length, 0, `${id} 出現簡體字：${bad.join('')}（${v}）`);
    }
  }
});

test('iucn 只用 IUCN 標準中文用語', () => {
  const allowed = ['無危 LC', '近危 NT', '易危 VU', '瀕危 EN', '極危 CR', '野外滅絕 EW', '滅絕 EX', '數據缺乏 DD', '未評估 NE'];
  for (const [id, c] of entries) {
    if (!c.iucn) continue;
    assert.ok(allowed.includes(c.iucn), `${id} 的 IUCN 寫法「${c.iucn}」唔標準（應該係：${allowed.join(' / ')}）`);
  }
});
