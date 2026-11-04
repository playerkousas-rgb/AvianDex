#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 對照 eBird/Clements 的分類稽核（純離線，唔需要網絡）
 * ============================================================
 *  權威：eBird / Clements Checklist（Cornell Lab of Ornithology）
 *
 *  檢查：
 *    1) birds.json 的英文名 → eBird 有沒有這物種
 *    2) 英文名欄位其實是「學名」→ 應該改回 eBird 正式英文名
 *    3) 英文名是 Unknown Species → 缺英文名，無法查證
 *    4) 兩張卡指向同一個 eBird 物種（speciesCode 重複）＝實質重複
 *    5) 英文名近似但拼法不同（Bean Goose vs Bean-Goose）→ 只提示
 *
 *  用法：
 *    node scripts/cards/audit-vs-ebird.mjs
 *    node scripts/cards/audit-vs-ebird.mjs --json     # 只出 JSON（給腳本用）
 *
 *  輸出：
 *    reports/ebird-audit.md
 *    reports/ebird-audit.json
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const TAXONOMY = path.join(ROOT, 'src/data/ebird-taxonomy.csv');
const META = path.join(ROOT, 'src/data/ebird-taxonomy.meta.json');
const OUT_MD = path.join(ROOT, 'reports/ebird-audit.md');
const OUT_JSON = path.join(ROOT, 'reports/ebird-audit.json');

function parseCsvLine(line) {
  const parts = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      parts.push(field);
      field = '';
    } else field += ch;
  }
  parts.push(field);
  return parts;
}

function loadTaxonomy() {
  if (!fs.existsSync(TAXONOMY)) {
    console.error('❌ 找不到 src/data/ebird-taxonomy.csv');
    console.error('   先跑：node scripts/cards/update-ebird-taxonomy.mjs');
    process.exit(1);
  }
  const lines = fs.readFileSync(TAXONOMY, 'utf8').split('\n').filter(Boolean);
  const header = parseCsvLine(lines.shift());
  const byEn = new Map();
  const bySci = new Map();
  for (const line of lines) {
    const parts = parseCsvLine(line);
    const rec = Object.fromEntries(header.map((h, i) => [h, parts[i] || '']));
    byEn.set(rec.PRIMARY_COM_NAME.toLowerCase().trim(), rec);
    bySci.set(rec.SCI_NAME.toLowerCase().trim(), rec);
  }
  return { byEn, bySci, count: byEn.size };
}

const norm = (s) => s.toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
const loose = (s) => norm(s).replace(/[^a-z ]/g, '');

function main() {
  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  const { byEn, bySci, count } = loadTaxonomy();
  const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {};

  // 建立「寬鬆比對」索引（處理連字號／標點差異）
  const looseIndex = new Map();
  for (const [k, v] of byEn) looseIndex.set(loose(k), v);

  const matched = [];
  const sciInEnField = [];
  const unknownEn = [];
  const notFound = [];
  const looseMatched = [];

  for (const bird of birds) {
    const en = (bird.en || '').trim();
    if (!en) {
      unknownEn.push({ bird, reason: '英文名空白' });
      continue;
    }
    if (/^unknown\b/i.test(en)) {
      unknownEn.push({ bird, reason: 'Unknown Species' });
      continue;
    }
    const direct = byEn.get(en.toLowerCase());
    if (direct) {
      matched.push({ bird, taxon: direct });
      continue;
    }
    // 英文名欄位放的是學名？
    if (/^[A-Z][a-z]+\s+[a-z]/i.test(en)) {
      const sci = bySci.get(en.toLowerCase());
      if (sci) {
        sciInEnField.push({ bird, taxon: sci });
        continue;
      }
    }
    // 寬鬆比對（Bean Goose vs Bean-Goose）
    const l = looseIndex.get(loose(en));
    if (l) {
      looseMatched.push({ bird, taxon: l });
      continue;
    }
    notFound.push({ bird });
  }

  // 重複：兩張卡指向同一個 speciesCode
  const codeToTaxon = new Map();
  for (const { taxon } of [...matched, ...sciInEnField, ...looseMatched]) codeToTaxon.set(taxon.SPECIES_CODE, taxon);
  const byCode = new Map();
  for (const { bird, taxon } of [...matched, ...sciInEnField, ...looseMatched]) {
    const code = taxon.SPECIES_CODE;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push({ id: bird.id, name: bird.name, en: bird.en, comName: taxon.PRIMARY_COM_NAME });
  }
  const duplicates = [...byCode.entries()].filter(([, v]) => v.length > 1);

  const summary = {
    authority: 'eBird / Clements Checklist (Cornell Lab of Ornithology)',
    taxonomySource: meta.source || '(unknown)',
    taxonomySpecies: count,
    retrievedAt: meta.retrievedAt || null,
    cards: birds.length,
    matched: matched.length + looseMatched.length,
    looseMatched: looseMatched.length,
    sciInEnField: sciInEnField.length,
    unknownEn: unknownEn.length,
    notFound: notFound.length,
    duplicateGroups: duplicates.length,
  };

  const md = [
    '# eBird 分類稽核報告（Cornell 為權威）',
    '',
    `- 分類表來源：${summary.taxonomySource}`,
    `- 分類表物種數：${summary.taxonomySpecies}`,
    `- 取得時間：${summary.retrievedAt || '—'}`,
    `- 卡片總數：${summary.cards}`,
    '',
    '| 結果 | 數量 |',
    '|---|---|',
    `| ✅ 英文名直接命中 eBird | ${summary.matched} |`,
    `| 🔤 英文名欄位其實是學名（要改） | ${summary.sciInEnField} |`,
    `| ❓ 英文名缺失 / Unknown Species | ${summary.unknownEn} |`,
    `| ❌ eBird 查不到 | ${summary.notFound} |`,
    `| ⚠️ 兩張卡指向同一物種（實質重複） | ${summary.duplicateGroups} 組 |`,
    '',
  ];

  if (sciInEnField.length) {
    md.push('## 🔤 英文名欄位放的是學名 → 改成 eBird 正式英文名', '', '| 編號 | 中文名 | 現值（學名） | eBird 英文名 | 學名 | 目 | 科 |', '|---|---|---|---|---|---|---|');
    for (const { bird, taxon } of sciInEnField) {
      md.push(
        `| ${bird.id} | ${bird.name} | ${bird.en} | **${taxon.PRIMARY_COM_NAME}** | ${taxon.SCI_NAME} | ${taxon.ORDER} | ${taxon.FAMILY.replace(/\s*\(.*\)\s*$/, '')} |`,
      );
    }
    md.push('');
  }

  if (unknownEn.length) {
    md.push('## ❓ 英文名缺失（無法查證分類）', '', '| 編號 | 中文名 | 原因 | 建議：先用中文維基條目查學名 |', '|---|---|---|---|');
    for (const { bird, reason } of unknownEn) {
      md.push(`| ${bird.id} | ${bird.name} | ${reason} | https://zh.wikipedia.org/wiki/${encodeURIComponent(bird.name)} |`);
    }
    md.push('');
  }

  if (notFound.length) {
    md.push('## ❌ eBird 查不到這個英文名（拼法可能錯）', '', '| 編號 | 中文名 | 現英文名 |', '|---|---|---|');
    for (const { bird } of notFound) md.push(`| ${bird.id} | ${bird.name} | ${bird.en} |`);
    md.push('');
  }

  if (duplicates.length) {
    md.push('## ⚠️ 實質重複（同一 eBird 物種）', '', '| eBird 英文名 | 學名 | 涉及編號 |', '|---|---|---|');
    for (const [code, list] of duplicates) {
      md.push(`| ${list[0].comName} | ${codeToTaxon.get(code).SCI_NAME} | ${list.map((x) => `${x.id}（${x.name}）`).join('、')} |`);
    }
    md.push('');
  }

  if (looseMatched.length) {
    md.push('## 📝 拼法差異（eBird 用連字號／不同寫法）', '', '| 編號 | 現英文名 | eBird 正式名 |', '|---|---|---|');
    for (const { bird, taxon } of looseMatched) md.push(`| ${bird.id} | ${bird.en} | ${taxon.PRIMARY_COM_NAME} |`);
    md.push('');
  }

  md.push(
    '## 下一步',
    '',
    '```bash',
    '# 1) 更新分類表（有 eBird key 更好，用官方即時版）',
    'EBIRD_API_KEY=xxx node scripts/cards/update-ebird-taxonomy.mjs --api',
    '',
    '# 2) 中文名由學名反查（需網絡；在你自己電腦跑）',
    'node scripts/cards/resolve-zh.mjs --all',
    '',
    '# 3) 套用修正（會備份 birds.json）',
    'node scripts/cards/apply-zh.mjs --dry-run',
    '```',
    '',
    '> 原則：**英文／學名／目／科 一律以 eBird 為準**；中文名只是顯示層，',
    '> 由中文維基以「學名」反查，並核對條目分類表的學名是否一致。',
  );

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`);
  fs.writeFileSync(OUT_JSON, `${JSON.stringify({ summary, sciInEnField: sciInEnField.map((x) => ({ ...x.bird, ebird: x.taxon })), unknownEn: unknownEn.map((x) => x.bird), notFound: notFound.map((x) => x.bird), duplicates: duplicates.map(([code, list]) => ({ speciesCode: code, cards: list })), looseMatched: looseMatched.map((x) => ({ ...x.bird, ebird: x.taxon })) }, null, 2)}\n`);

  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    return;
  }

  console.log(`📊 對照 eBird/Clements（${count} 種）`);
  console.log(`   ✅ 命中 ${matched.length + looseMatched.length}（其中拼法差異 ${looseMatched.length}）`);
  console.log(`   🔤 英文名放了學名：${sciInEnField.length}`);
  console.log(`   ❓ 英文名缺失：${unknownEn.length}`);
  console.log(`   ❌ 查不到：${notFound.length}`);
  console.log(`   ⚠️ 實質重複：${duplicates.length} 組`);
  console.log('📄 reports/ebird-audit.md');
}

main();
