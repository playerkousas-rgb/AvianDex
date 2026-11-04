#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 從 eBird 標籤（CODE 欄）建立名稱別名表
 * ============================================================
 *  背景：香港鳥類名錄／圖鑑上印的「CODE」其實是 eBird 的物種代碼
 *    （例如 `whrmun` = White-rumped Munia 白腰文鳥、`spodov` = Spotted Dove 珠頸斑鳩）。
 *    用代碼做橋，就可以把「卡片中文名」對到「eBird 權威英文名／學名」，
 *    完全不需要靠人手猜中文名。
 *
 *  資料來源（皆為 GitHub 公開資料，MIT / 公開名錄）：
 *    1. eBird/Clements 分類表            → 代碼 → 英文名、學名、目、科（權威）
 *    2. 中文名錄（含 eBird 代碼對照）     → 代碼 → 中文名
 *
 *  用法：
 *    # 用已內建的 zh-name-codes.json（scripts 已附）
 *    node scripts/cards/build-name-alias.mjs
 *
 *    # 換一份名錄（CSV 要有 CODE 欄 + 中文名欄）
 *    node scripts/cards/build-name-alias.mjs --roster ~/hk-list.csv --name-col 中文名
 *
 *  輸出：
 *    src/data/name-aliases.generated.json
 *       { "<中文名>": { aliases: ["<英文名>", "<學名>"], ebird: {...}, sources: [...] } }
 *    reports/name-alias.md   衝突／對不上的清單
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TAXONOMY = path.join(ROOT, 'src/data/ebird-taxonomy.csv');
const ZH_CODES = path.join(__dirname, 'zh-name-codes.json');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const OUT_JSON = path.join(ROOT, 'src/data/name-aliases.generated.json');
const OUT_MD = path.join(ROOT, 'reports/name-alias.md');

const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 ? ARGS[i + 1] : d;
};

function parseCsvLine(line) {
  const out = [];
  let f = '';
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        f += '"';
        i += 1;
      } else if (ch === '"') q = false;
      else f += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') {
      out.push(f);
      f = '';
    } else f += ch;
  }
  out.push(f);
  return out;
}

function loadTaxonomy() {
  const lines = fs.readFileSync(TAXONOMY, 'utf8').split('\n').filter(Boolean);
  const header = parseCsvLine(lines.shift());
  const byCode = new Map();
  for (const line of lines) {
    const parts = parseCsvLine(line);
    const rec = Object.fromEntries(header.map((h, i) => [h, parts[i] || '']));
    byCode.set(rec.SPECIES_CODE, rec);
  }
  return byCode;
}

/** 讀 CSV 名錄：找 CODE 欄與中文名欄（自動偵測） */
function loadRoster(file, nameCol) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = parseCsvLine(lines.shift()).map((h) => h.trim());
  const ci = header.findIndex((h) => /^(code|species_code|ebird.?code)$/i.test(h));
  if (ci < 0) throw new Error(`${file} 找不到 CODE 欄（欄位：${header.join(' / ')}）`);
  const ni = nameCol ? header.indexOf(nameCol) : header.findIndex((h) => /name|中文|名稱/i.test(h) && !/english|英文/i.test(h));
  if (ni < 0) throw new Error(`${file} 找不到中文名欄，請用 --name-col 指定`);
  const rows = [];
  for (const line of lines) {
    const p = parseCsvLine(line);
    const code = (p[ci] || '').trim();
    const name = (p[ni] || '').trim();
    if (code && name) rows.push({ code, name });
  }
  return rows;
}

function main() {
  const taxonomy = loadTaxonomy();
  const alias = {};
  const conflicts = [];
  const unknownCodes = [];

  const rosterFile = arg('--roster', '');
  const entries = rosterFile
    ? loadRoster(path.resolve(rosterFile.replace(/^~/, process.env.HOME || '~')), arg('--name-col', ''))
    : JSON.parse(fs.readFileSync(ZH_CODES, 'utf8')).species.map((s) => ({ code: s.code, name: s.name }));

  const nameToCode = new Map();
  for (const { code, name } of entries) {
    const tax = taxonomy.get(code);
    if (!tax) {
      unknownCodes.push({ code, name });
      continue;
    }
    const key = name;
    if (!alias[key]) {
      alias[key] = {
        ebird: {
          speciesCode: tax.SPECIES_CODE,
          comName: tax.PRIMARY_COM_NAME,
          sciName: tax.SCI_NAME,
          order: tax.ORDER,
          family: tax.FAMILY.replace(/\s*\(.*\)\s*$/, ''),
        },
        aliases: [tax.PRIMARY_COM_NAME, tax.SCI_NAME],
        sources: rosterFile ? [path.basename(rosterFile)] : ['zh-name-codes.json (eBird CODE roster)'],
      };
    } else if (alias[key].ebird.speciesCode !== code) {
      // 同一中文名指向兩個 eBird 物種 → 記錄衝突（例如「大山雀」＝ Asian Tit / Great Tit）
      conflicts.push({ name: key, a: alias[key].ebird, b: { speciesCode: code, comName: tax.PRIMARY_COM_NAME, sciName: tax.SCI_NAME } });
      if (!alias[key].alsoCodes) alias[key].alsoCodes = [];
      alias[key].alsoCodes.push(code);
      for (const extra of [tax.PRIMARY_COM_NAME, tax.SCI_NAME]) if (!alias[key].aliases.includes(extra)) alias[key].aliases.push(extra);
    }
    if (nameToCode.has(code) && nameToCode.get(code) !== key) {
      conflicts.push({ name: key, a: { speciesCode: code, comName: nameToCode.get(code) }, b: { speciesCode: code, comName: key }, kind: 'same-code-diff-name' });
    }
    nameToCode.set(code, key);
  }

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(alias, null, 2)}\n`);

  // ── 對現有卡片：能用別名救幾張 ──
  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  const rescued = [];
  const stillBad = [];
  for (const b of birds) {
    const a = alias[b.name];
    const en = (b.en || '').trim();
    const enOk = a && [a.ebird.comName, a.ebird.sciName].some((x) => x.toLowerCase() === en.toLowerCase());
    if (a && !enOk) rescued.push({ id: b.id, name: b.name, old: en, fixed: a.ebird });
    else if (!a) stillBad.push(b);
  }

  const md = [
    '# 名稱別名表（eBird CODE 為橋）',
    '',
    `- 產生時間：${new Date().toISOString()}`,
    `- 名錄筆數：${entries.length}`,
    `- 成功對上 eBird 物種的中文名：${Object.keys(alias).length}`,
    `- 名錄內 eBird 查不到的代碼：${unknownCodes.length}`,
    `- 同名多物種／同碼多名的衝突：${conflicts.length}`,
    '',
    '## 這張表解決什麼',
    '',
    '卡片的中文名不是權威，但**香港名錄上的 CODE 就是 eBird 代碼**。',
    '所以：`中文名 → CODE → eBird 英文名／學名／目／科`，全程唔需要猜。',
    '',
    '### 可以即刻修正的卡片（用別名表對回 eBird）',
    '',
    '| 編號 | 中文名 | 現英文名 | 應為（eBird 權威） | 學名 |',
    '|---|---|---|---|---|',
    ...rescued.map((r) => `| ${r.id} | ${r.name} | ${r.old || '（空）'} | **${r.fixed.comName}** | ${r.fixed.sciName} |`),
    '',
  ];

  if (conflicts.length) {
    md.push('## ⚠️ 同名多物種（要人手揀）', '', '| 中文名 | 物種 A | 物種 B |', '|---|---|---|');
    for (const c of conflicts.slice(0, 60)) {
      md.push(`| ${c.name} | ${c.a.comName || ''} ${c.a.sciName ? `(${c.a.sciName})` : ''} | ${c.b.comName || ''} ${c.b.sciName ? `(${c.b.sciName})` : ''} |`);
    }
    md.push('');
  }

  if (unknownCodes.length) {
    md.push('## 名錄代碼在 Clements 找不到', '', '| 代碼 | 名稱 |', '|---|---|');
    for (const u of unknownCodes.slice(0, 200)) md.push(`| ${u.code} | ${u.name} |`);
    md.push('');
  }

  md.push('## 用法', '', '```js', "import aliases from './src/data/name-aliases.generated.json';", "const hit = aliases['珠頸斑鳩']; // → { ebird: {...}, aliases: ['Spotted Dove', 'Spilopelia chinensis'] }", '```', '');

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`);

  console.log(`🔤 別名表：${Object.keys(alias).length} 個中文名 → eBird 物種`);
  console.log(`   ✅ 可修正卡片：${rescued.length}`);
  console.log(`   ⚠️ 同名多物種：${conflicts.filter((c) => c.kind !== 'same-code-diff-name').length}`);
  console.log(`   ❓ 名錄代碼查不到：${unknownCodes.length}`);
  console.log('📄 src/data/name-aliases.generated.json');
  console.log('📄 reports/name-alias.md');
}

main();
