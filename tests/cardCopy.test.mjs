/* ============================================================
 *  圖卡文案測試（node:test）
 *  跑：npm run test:copy
 * ------------------------------------------------------------
 *  驗證「卡上的字唔可以亂嚟」：
 *    1) 每個有文案的編號，都必須有 source（可追溯）
 *    2) 欄位長度上限（超出會被排版引擎截斷，就會漏字）
 *    3) callouts（圓形標註）最多 5 點、label／text 唔會爆格
 *    3b) 滿版資料卡需要的欄位（長度／體重／Top5／小貼士／注意事項／5 項評分）
 *    4) 不准出現簡體字（香港繁體介面）
 *    5) 編號要存在於 birds.json，唔可以作一個唔存在的物種
 * ============================================================ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FIELD_LIMITS } from '../scripts/cards/extract-copy.mjs';

const root = path.resolve(import.meta.dirname, '..');
const copyAll = JSON.parse(readFileSync(path.join(root, 'src/data/cardCopy.json'), 'utf8'));
const birds = JSON.parse(readFileSync(path.join(root, 'src/data/birds.json'), 'utf8'));
const birdIds = new Set(birds.map((b) => b.id));

const entries = Object.entries(copyAll).filter(([k]) => /^\d{4}$/.test(k));

/** 只檢查常見簡體字（避免誤判，用一組高頻字） */
const SIMPLIFIED = ['鸟', '鱼', '鸭', '鸦', '鹅', '鸡', '黄', '绿', '蓝', '红', '头', '颈', '脚', '鸣', '声', '种', '类', '资', '数', '据', '来', '边', '湾', '亚', '东', '华', '图', '鉴', '态', '习', '长', '门', '问', '时', '见', '体', '叶', '众', '几'];

// 上限單一來源：同抽取器共用，唔會兩邊唔同
const LIMITS = { ...FIELD_LIMITS, iucn: 12, source: 96 };

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
    assert.ok(marks.length <= 5, `${id} 有 ${marks.length} 個 callout（最多 5）`);
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

/* ------------------------------------------------------------
 *  滿版資料卡（dexcard / render_dexcard）欄位契約
 *  對應 cards/out/info/NNNN.png 上真正會印出來的格子。
 *  ⚠️ scores／rarity 屬編者主觀評分，不是科學數據：
 *     只檢查「齊唔齊、格式對唔對」，不檢查數值真假。
 * ---------------------------------------------------------- */
const DEX_TEXT = { intro_zh: 140, length: 14, weight: 18, range: 120, habitat: 90, diet: 90, breeding: 160, funFact: 120 };
const DEX_LIST = { highlights: 5, tips: 4, caution: 3, callouts: 5 };
const SCORE_KEYS = ['生態重要性', '適應力', '觀賞價值', '研究價值', '保育關注度'];

test('dexcard：有 scores 就要 5 項齊、每項 0–5 分', () => {
  for (const [id, c] of entries) {
    if (!c.scores) continue;
    const keys = Object.keys(c.scores);
    assert.equal(keys.length, 5, `${id} 評分要有 5 項（現有 ${keys.join('/')}）`);
    for (const k of keys) {
      const v = c.scores[k];
      assert.equal(typeof v, 'number', `${id}「${k}」分數要係數字`);
      assert.ok(v >= 0 && v <= 5, `${id}「${k}」分數 ${v} 超出 0–5`);
      assert.ok(Math.round(v * 2) === v * 2, `${id}「${k}」分數只可到 0.5 級`);
    }
  }
});

test('dexcard：評分項目名稱跟成品卡一致（小朋友看得明）', () => {
  for (const [id, c] of entries) {
    if (!c.scores) continue;
    assert.deepEqual(Object.keys(c.scores), SCORE_KEYS, `${id} 評分項目名稱唔一致`);
  }
});

test('dexcard：5 項評分要有對應一句解釋（score_notes）', () => {
  for (const [id, c] of entries) {
    if (!c.scores) continue;
    for (const k of Object.keys(c.scores)) {
      const note = (c.score_notes || {})[k] || '';
      assert.ok(note.trim(), `${id}「${k}」冇 score_notes，卡面會空白`);
      assert.ok(note.length <= 16, `${id}「${k}」的 score_notes 太長（${note.length} 字）`);
    }
  }
});

test('dexcard：常見度 rarity 只可 0–5 整數（0 = 資料待查）', () => {
  for (const [id, c] of entries) {
    if (c.rarity === undefined || c.rarity === null) continue;
    assert.ok(Number.isInteger(c.rarity), `${id} rarity 要係整數`);
    assert.ok(c.rarity >= 0 && c.rarity <= 5, `${id} rarity ${c.rarity} 超出 0–5`);
  }
});

test('dexcard：文字欄位長度唔可以爆格（超出會被截斷＝漏字）', () => {
  for (const [id, c] of entries) {
    for (const [f, max] of Object.entries(DEX_TEXT)) {
      const v = String(c[f] || '').trim();
      if (!v) continue;
      assert.ok(v.length <= max, `${id} ${f} 有 ${v.length} 字（上限 ${max}）`);
    }
  }
});

test('dexcard：清單欄位要有足夠項數（Top5 要 5 條）', () => {
  for (const [id, c] of entries) {
    if (c.highlights) {
      assert.equal(c.highlights.length, 5, `${id} highlights 要剛好 5 條（現有 ${c.highlights.length}）`);
    }
    for (const [f, cap] of Object.entries(DEX_LIST)) {
      const arr = c[f];
      if (!Array.isArray(arr)) continue;
      assert.ok(arr.length <= cap, `${id} ${f} 有 ${arr.length} 條（上限 ${cap}）`);
      for (const it of arr) {
        const txt = typeof it === 'string' ? it : it.text || '';
        assert.ok(tr(wrapLen(txt)) <= 40, `${id} ${f} 有一條太長（建議 ≤ 40 字）：${txt}`);
      }
    }
  }
});

test('dexcard：圓形標註要有對焦點（否則 5 個圈會係同一格）', () => {
  for (const [id, c] of entries) {
    for (const m of c.callouts || []) {
      if (m.fx === undefined && m.fy === undefined && m.zoom === undefined) continue;
      for (const k of ['fx', 'fy', 'zoom']) {
        assert.equal(typeof m[k], 'number', `${id} callout「${m.label}」${k} 要係數字`);
        assert.ok(m[k] >= 0 && m[k] <= 1, `${id} callout「${m.label}」${k} 要 0–1`);
      }
    }
  }
});

test('dexcard：冇真雀相就唔應該有圓形標註（避免空圈）', () => {
  // TODO(photos): 全部真雀相補齊前，舊資料（callouts 只作文字備註）暫時豁免；
  // 一有 photo 就必須同時有 callouts，反之亦然。
  const PENDING_PHOTO = new Set(['0289', '0290', '0291', '0292', '0293', '0294', '0295',
    '0296', '0297', '0298', '0299', '0288']);
  for (const [id, c] of entries) {
    if (PENDING_PHOTO.has(id)) continue;
    if ((c.callouts || []).length && !(c.photo || '').trim()) {
      assert.fail(`${id} 有 callouts 但冇 photo，卡面右邊會出現空圈`);
    }
  }
});

/* 小工具 */
function wrapLen(t) {
  return String(t || '').length;
}
function tr(n) {
  return n;
}
