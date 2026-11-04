#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 卡面文案交叉核對（Cross-species contamination audit）
 * ------------------------------------------------------------
 *  為什麼要有這支？
 *    文案是「從中文維基抽一句原文」得來的。抽取器一旦認錯條目，
 *    整格資料就會變成另一隻雀——比「資料待查」危險一百倍，
 *    因為它看起來很正常，但係錯的。
 *
 *  三種檢查：
 *    A. 來源標題（source 內嘅維基條目名）同 eBird 中文名唔對應
 *       － 可能只係命名差異（例如 白翅海番鴨 vs 白翅黑番鴨），唔一定係錯
 *    B. 條目名稱同卡面名完全唔同 → 高風險
 *    C. 文案內文提到別隻雀的名字、但冇提到自己 → 幾乎肯定認錯條目
 *
 *  輸出：docs/CARD_DATA_AUDIT.md（唔會改任何資料）
 *  用法：node scripts/cards/audit-copy.mjs [--json]
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(ROOT, 'src/data');
const read = (p) => JSON.parse(fs.readFileSync(path.join(DATA, p), 'utf8'));

const birds = read('birds.json');
const copy = read('cardCopy.json');
const aliases = (() => {
  try { return read('name-aliases.generated.json'); } catch { return {}; }
})();

/* 簡→繁（只用於「鳥名比對」，142 對字，由 OpenCC 預先產生一次並提交：
 *  src/data/s2t-name-chars.json。不在執行期依賴 OpenCC，令 CI 唔需要額外套件。） */
const S2T = (() => {
  try { return read('s2t-name-chars.json'); } catch { return {}; }
})();
const s2t = (s) => [...String(s || '')].map((c) => S2T[c] || c).join('');

/* 全部中文鳥名（用最長匹配，避免「麻雀」命中「樹麻雀」） */
const names = [...new Set(birds.map((b) => b.name).filter(Boolean))].sort((a, b) => b.length - a.length);

function mentionedNames(text) {
  const t = s2t(text);
  const hits = new Set();
  for (const n of names) {
    if (n.length >= 2 && t.includes(n)) hits.add(n);
  }
  return [...hits];
}

/* 單一欄位是否「講緊另一隻雀」：
 *   ① 句子一開頭就係別隻雀的名（「普通鵟體重約759克…」）→ 幾乎肯定抓錯條目
 *   ② 提到別隻雀 ≥2 次、而完全冇提自己 → 高風險
 *   ③ 只提到一次、而且係句中比較（「體型只有麻雀大小」）→ 正常寫法，不報
 * 寧可漏報都唔好誤報：誤報會令人唔信報告，之後真錯都無人睇。 */
const CMP = /相比|相似|近似|有別於|區別|不同於|相似種|容易混淆|分辨/;
function fieldRisk(text, own) {
  let t = s2t(text);
  const ownName = s2t(own);
  /* 先把自己名字挖空，否則「小雲雀」會被當成提到了「雲雀」、「白背針尾雨燕」會被當成「雨燕」 */
  if (ownName) t = t.split(ownName).join('＿');
  let others = mentionedNames(t).filter((n) => n !== ownName && n !== '＿');
  /* 別隻雀的名字如果係自己名字的一部份，剔除（例如自己的名字含「雨燕」→ 唔算提別隻雨燕） */
  others = others.filter((n) => !ownName.includes(n));
  if (!others.length) return { level: 0, others: [] };

  /* 逐句看：句子一開頭就係別隻雀的名字 → 幾乎肯定整句講緊人哋 */
  const sentences = t.split(/[。；！？\n]/).map((x) => x.trim()).filter(Boolean);
  const startsWithOther = sentences.some((sen) =>
    others.some((n) => sen.startsWith(n) || sen.startsWith('＿' + n)));
  let count = 0;
  for (const n of others) count += t.split(n).length - 1;
  const comparing = CMP.test(t);   /* 比較句（「與大嘴烏鴉相比，本物種…」）→ 正常寫法 */

  let level;
  /* 句中有「例如 / 如 / 包括 / 等」→ 別隻雀名只係舉例，唔算污染 */
  const example = /例如|譬如|包括|如[^此]|等[。，、]/.test(t);
  if (example) level = 1;
  else if (startsWithOther && !comparing) level = 2;
  else if (count >= 2 && !comparing && !t.includes('＿')) level = 2;
  else if (count >= 1) level = 1;
  else level = 0;
  return { level, others };
}

const FIELDS = ['look', 'habitat', 'diet', 'range', 'funFact'];
const rows = [];
for (const [id, c] of Object.entries(copy)) {
  if (!/^\d{4}$/.test(id)) continue;
  const bird = birds.find((b) => b.id === id) || {};
  const own = bird.name || '';
  const src = c.source || '';
  const title = s2t((src.match(/wikipedia\s+([^\s·（(]+)/) || [])[1] || '');

  const per = {};
  let worst = 0;
  const otherNames = new Set();
  for (const f of FIELDS) {
    if (!c[f]) continue;
    const r = fieldRisk(c[f], own);
    per[f] = r;
    worst = Math.max(worst, r.level);
    r.others.forEach((n) => otherNames.add(n));
  }
  if (c.callouts) {
    const r = fieldRisk(c.callouts.map((m) => m.text).join(' '), own);
    per.callouts = r;
    worst = Math.max(worst, r.level);
    r.others.forEach((n) => otherNames.add(n));
  }
  const others = [...otherNames];
  const badFields = Object.entries(per).filter(([, r]) => r.level === 2).map(([k]) => k);
  const titleMatch = !title || title.includes(own) || own.includes(title);
  const high = worst === 2;
  const mid = !high && (!titleMatch && title.length >= 2 && title !== '中文維基' || worst === 1);

  rows.push({ id, own, title, titleMatch, others, high, mid, badFields,
    fields: FIELDS.filter((k) => c[k]),
    sample: (c.look || c.habitat || c.diet || '').slice(0, 34) });
}

const high = rows.filter((r) => r.high);
const mid = rows.filter((r) => !r.high && r.mid);
const ok = rows.length - high.length - mid.length;

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ total: rows.length, high, mid }, null, 2));
  process.exit(0);
}

const md = [];
md.push('# 卡面文案核對報告（自動產生）', '');
md.push(`> 由 \`node scripts/cards/audit-copy.mjs\` 產生。呢份報告**唔會改資料**，只係指出邊張卡要人手覆核。`, '');
md.push('## 為什麼要核對', '');
md.push('文案係「由中文維基抽一句原文」得來。抽取器認錯條目，整格就會變成**另一隻雀**的描述——');
md.push('比「資料待查」危險，因為佢睇落完全正常。以下三種情況要分清楚：', '');
md.push('| 級別 | 判斷 | 意思 |', '|---|---|---|');
md.push('| 🔴 嚴重 | 內文提到別隻雀、但冇提自己 | 幾乎肯定抓錯條目，該卡資料不可用 |');
md.push('| 🟡 待查 | 來源條目名同 eBird 名唔同 | 可能只係命名差異（別名／舊名／簡繁），需要人手看一眼 |');
md.push('| 🟢 通過 | 條目名對得上 | — |', '');
md.push('## 摘要', '');
md.push(`- 有文案的卡：**${rows.length}** 張`);
md.push(`- 🔴 嚴重：**${high.length}** 張（建議先隔離，唔好出卡）`);
md.push(`- 🟡 待查：**${mid.length}** 張`);
md.push(`- 🟢 通過：**${ok}** 張`, '');

if (high.length) {
  md.push('## 🔴 嚴重（內文講緊另一隻雀）', '');
  md.push('| 編號 | 卡面名 | 來源條目 | 有問題欄位 | 內文提到的雀 | 內文開頭 |');
  md.push('|---|---|---|---|---|---|');
  for (const r of high) {
    md.push(`| ${r.id} | ${r.own} | ${r.title || '—'} | ${r.badFields.join('、')} | ${r.others.join('、')} | ${r.sample}… |`);
  }
  md.push('');
}

if (mid.length) {
  md.push('## 🟡 待查（來源條目名唔同）', '');
  md.push('| 編號 | 卡面名 | 來源條目 | 已補欄位 |');
  md.push('|---|---|---|---|');
  for (const r of mid) {
    md.push(`| ${r.id} | ${r.own} | ${r.title} | ${r.fields.join('、') || '—'} |`);
  }
  md.push('');
}

md.push('## 怎樣修', '');
md.push('1. 先修抽取器（`scripts/cards/extract-copy.mjs`）「條目 → 編號」的對應邏輯，令佢用 `pageid` 而唔係靠標題搜尋；');
md.push('2. 重跑抽取，只覆蓋有問題的編號（其餘唔動）；');
md.push('3. 重跑 `npm test` 與 `node scripts/cards/audit-copy.mjs`，🔴 應該清零。', '');

const out = path.join(ROOT, 'docs/CARD_DATA_AUDIT.md');
fs.writeFileSync(out, md.join('\n'), 'utf8');
console.log(`✅ docs/CARD_DATA_AUDIT.md`);
console.log(`   總 ${rows.length}｜🔴 ${high.length}｜🟡 ${mid.length}｜🟢 ${ok}`);
if (high.length) {
  console.log('\n🔴 最需要處理（前 20）：');
  for (const r of high.slice(0, 20)) {
    console.log(`   ${r.id} ${r.own} ←「${r.title}」　欄位：${r.badFields.join('、')}　提到：${r.others.join('/')}`);
  }
}
