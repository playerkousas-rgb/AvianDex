#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 看抽取結果／合併入 repo
 * ------------------------------------------------------------
 *  「我唔知寫咗去邊」→ 這支工具就是答案：跑完直接印出「哪張卡印哪 7 格、
 *  每格的文字是什麼、來源 pageid 是什麼」，有問題即刻睇得到，不用上傳。
 *
 *  用法：
 *    node scripts/cards/show-picks.mjs                            # 看 src/data/cardCopy.json
 *    node scripts/cards/show-picks.mjs --file data/cardCopy.local.json
 *    node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --ids 0008 0001
 *    node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --lang en
 *    node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --write
 *         ↑ 合併入 src/data/cardCopy.json（先備份成 .bak）
 *    node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --write --dest /tmp/x.json  # 試合併（唔改真檔）
 *    node scripts/cards/show-picks.mjs --file data/cardCopy.local.json --md
 *         ↑ 順便寫一份 reports/copy-review.md 方便你慢慢睇
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIELDS, FIELD_BY_ID, chooseFields, has } from './field-schema.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARGS = process.argv.slice(2);
const arg = (n, d) => { const i = ARGS.indexOf(n); return i >= 0 ? ARGS[i + 1] : d; };
const flag = (n) => ARGS.includes(n);

const COPY_F = arg('--dest', '') ? path.resolve(arg('--dest', '')) : path.join(ROOT, 'src/data/cardCopy.json');
const file = arg('--file', '') ? path.resolve(arg('--file', '')) : COPY_F;
const lang = arg('--lang', 'zh') === 'en' ? 'en' : 'zh';
const mdOut = flag('--md');

if (!fs.existsSync(file)) {
  console.error(`✗ 找不到檔案：${file}`);
  console.error('  先跑：node scripts/cards/extract-bilingual.mjs --ids 0008 --out data/cardCopy.local.json');
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(file, 'utf8'));
const ids = (() => {
  const v = arg('--ids', '');
  if (!v) return Object.keys(all).filter((k) => !k.startsWith('_')).sort();
  return v.split(/[,\s]+/).filter(Boolean).map((s) => s.padStart(4, '0'));
})();

const birds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/birds.json'), 'utf8'));
const nameOf = Object.fromEntries(birds.map((b) => [b.id, b.name]));
const LIM = { zh: 46, en: 160 };
const md = ['# 卡片文案核對表', '', `- 檔案：\`${path.relative(ROOT, file)}\``, `- 語言：${lang}`, ''];

let withCopy = 0;
let empty = 0;
for (const id of ids) {
  const c = all[id];
  if (!c) continue;
  const fc = Array.isArray(c.fieldCopy) ? c.fieldCopy : [];
  const zhN = fc.filter((x) => has(x.zh)).length;
  const enN = fc.filter((x) => has(x.en)).length;
  if (!zhN && !enN) { empty += 1; continue; }
  withCopy += 1;

  /* 用「與 extract 相同的規則」即時重算一次選欄，順便驗證存下來的 picks 沒走樣。
   * 注意：fieldCopy 是雙語表，舊格式是中文 key 直接寫在 copy 上；
   * 兩種都要餵給 chooseFields，否則會誤判成「只有 5 格資料」。 */
  const zhFromCells = Object.fromEntries(fc.filter((x) => has(x.zh)).map((x) => [x.id, x.zh]));
  const enFromCells = Object.fromEntries(fc.filter((x) => has(x.en)).map((x) => [x.id, x.en]));
  const view = { ...c, ...zhFromCells, en: { ...(c.en || {}), ...enFromCells } };
  const sel = chooseFields(view, {});
  const same = Array.isArray(c.picks) && c.picks.join() === sel.picks.join();

  const head = `\n${'═'.repeat(64)}\n${id} ${nameOf[id] || ''}　中 ${zhN} 欄／英 ${enN} 欄　印 ${sel.picks.length} 格`;
  console.log(head);
  if (!same && Array.isArray(c.picks)) {
    console.log(`  ⚠️ 存下來的 picks（${c.picks.join('/')}）與重算（${sel.picks.join('/')}）不同 → 資料改過但未重算`);
  }
  console.log(`  來源：${c.source || '—'}`);
  const extra = [c.length && `身長 ${c.length}`, c.weight && `體重 ${c.weight}`,
    (c.iucn || c.iucnEn) && `IUCN ${c.iucn || ''}${c.iucnEn ? ' / ' + c.iucnEn : ''}`,
    Array.isArray(c.aliases) && c.aliases.length && `別名 ${c.aliases.join('、')}`].filter(Boolean);
  if (extra.length) console.log(`  ${extra.join('　')}`);

  md.push(`## ${id} ${nameOf[id] || ''}`, '', `- 中文欄 ${zhN}／英文欄 ${enN}，印 ${sel.picks.length} 格`, `- 來源：${c.source || '—'}`, '');

  for (const f of FIELDS.filter((x) => x.slot === 'grid4')) {
    const cell = fc.find((x) => x.id === f.id);
    if (!cell) continue;
    const text = lang === 'en' ? cell.en : cell.zh;
    const other = lang === 'en' ? cell.zh : cell.en;
    if (!has(text) && !has(other)) continue;
    const picked = sel.picks.includes(f.id);
    const mark = picked ? '■' : '□';
    const t = String(Array.isArray(text) ? text.join(' ／ ') : text || '（此行缺）');
    const lim = LIM[lang] || 60;
    const line = `${mark} ${f.zh.padEnd(7, '　')} ${t}`;
    console.log(line.length > 190 ? line.slice(0, 190) + ' …' : line);
    if (!has(text)) console.log(`      （${lang === 'en' ? '英文' : '中文'}缺，出圖會印「${lang === 'en' ? 'Data pending' : '資料待查'}」）`);
    md.push(`${mark} **${f.zh}**（${f.en}）`, '', t, '');
    void lim;
  }
  console.log('  ■ = 會印在卡面　□ = 有資料但今次不印');
}

console.log(`\n共 ${ids.length} 張：有文案 ${withCopy}、空白 ${empty}`);
if (mdOut) {
  const f = path.join(ROOT, 'reports/copy-review.md');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, md.join('\n') + '\n');
  console.log(`📄 ${path.relative(ROOT, f)}`);
}

/* ------------------------------------------------------------------
 * --write：合併入 src/data/cardCopy.json
 *   · 只覆蓋「本次檔案內有文案」的卡，其餘 543 張原封不動
 *   · 先備份 cardCopy.json.bak
 *   · 同時重算 picks（避免資料改了但 picks 舊）
 * ------------------------------------------------------------------ */
if (flag('--write')) {
  const base = JSON.parse(fs.readFileSync(COPY_F, 'utf8'));
  const bak = COPY_F + '.bak';
  fs.writeFileSync(bak, JSON.stringify(base, null, 2) + '\n');
  let changed = 0;
  for (const [id, c] of Object.entries(all)) {
    if (id.startsWith('_')) continue;
    const fc = Array.isArray(c.fieldCopy) ? c.fieldCopy : [];
    const zhN = fc.filter((x) => has(x.zh)).length;
    const enN = fc.filter((x) => has(x.en)).length;
    if (!zhN && !enN) continue;
    const zhC = Object.fromEntries(fc.filter((x) => has(x.zh)).map((x) => [x.id, x.zh]));
    const enC = Object.fromEntries(fc.filter((x) => has(x.en)).map((x) => [x.id, x.en]));
    const view = { ...c, ...zhC, en: { ...(c.en || {}), ...enC } };
    const sel = chooseFields(view, {});
    base[id] = { ...base[id], ...c, picks: sel.picks };
    /* Pillow 引擎與舊測試讀中文舊 key，一併補上（只補空位，不覆蓋已有人手修正） */
    for (const [k, v] of Object.entries(zhC)) if (!has(base[id][k])) base[id][k] = v;
    changed += 1;
  }
  fs.writeFileSync(COPY_F, JSON.stringify(base, null, 2) + '\n');
  console.log(`\n✅ 已合併 ${changed} 張 → ${COPY_F}`);
  console.log(`   備份：${bak}`);
  console.log('   之後：npm test && npm run cards:studio');
  /* 逐張核對「卡面欄位表」有沒有被改壞 */
  for (const f of FIELDS) if (!FIELD_BY_ID[f.id]) console.error('✗ 欄位表異常：' + f.id);
}
