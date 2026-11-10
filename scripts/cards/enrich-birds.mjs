#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 把 eBird/Clements 權威分類接上 App
 * ============================================================
 *  做三件事（全部可離線跑）：
 *    1. 逐張卡解析 eBird 物種：英文名 → 學名欄位 → 中文名別名表
 *    2. 寫出 src/data/birdTaxonomy.json
 *         每張卡的 speciesCode / 英文名 / 學名 / 目 / 科（eBird 權威）
 *         → 前端就有真學名可顯示、可搜尋，不再是「???」
 *    3. 修正 birds.json 的 `en` 欄位（只在此欄位確實錯時才改）
 *         - 放了學名（Aythya Baeri）→ 換成 eBird 正式英文名
 *         - 大小寫／連字號不同（Bean Goose → Bean-Goose）→ 統一成 eBird 寫法
 *         ⚠️ 中文名 `name` 一律不動（改名屬編輯決定，見 docs/DATA_ISSUES.md）
 *
 *  用法：
 *    node scripts/cards/enrich-birds.mjs --dry-run    # 只報告（預設）
 *    node scripts/cards/enrich-birds.mjs --apply      # 寫入 birds.json（先備份）
 *
 *  前置：
 *    node scripts/cards/update-ebird-taxonomy.mjs     # 分類表
 *    node scripts/cards/build-name-alias.mjs          # 中文名別名表（可選）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const TAXONOMY = path.join(ROOT, 'src/data/ebird-taxonomy.csv');
const ALIASES = path.join(ROOT, 'src/data/name-aliases.generated.json');
const OVERRIDES = path.join(ROOT, 'src/data/taxonomyOverrides.json');
const TAXONOMY_ZH = path.join(ROOT, 'src/data/taxonomyZh.json');
const OUT_TAXONOMY = path.join(ROOT, 'src/data/birdTaxonomy.json');
const OUT_AUDIT = path.join(ROOT, 'reports/enrich-birds.json');
const REPORT = path.join(ROOT, 'reports/enrich-birds.md');

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');

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

const norm = (s) => (s || '').toLowerCase().replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
const stripFamily = (s) => (s || '').replace(/\s*\(.*\)\s*$/, '').trim();

function loadTaxonomy() {
  if (!fs.existsSync(TAXONOMY)) {
    throw new Error('找不到 src/data/ebird-taxonomy.csv — 先跑 update-ebird-taxonomy.mjs');
  }
  const lines = fs.readFileSync(TAXONOMY, 'utf8').split('\n').filter(Boolean);
  const header = parseCsvLine(lines.shift());
  const byEn = new Map();
  const bySci = new Map();
  const byCode = new Map();
  const loose = new Map();
  for (const line of lines) {
    const parts = parseCsvLine(line);
    const rec = Object.fromEntries(header.map((h, i) => [h, parts[i] || '']));
    byEn.set(norm(rec.PRIMARY_COM_NAME), rec);
    bySci.set(norm(rec.SCI_NAME), rec);
    byCode.set(rec.SPECIES_CODE, rec);
    loose.set(norm(rec.PRIMARY_COM_NAME).replace(/[^a-z ]/g, ''), rec);
  }
  return { byEn, bySci, byCode, loose };
}

function main() {
  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  const tax = loadTaxonomy();
  const aliases = fs.existsSync(ALIASES) ? JSON.parse(fs.readFileSync(ALIASES, 'utf8')) : {};
  /* 人手核定的覆寫（英文名空白／中英指向不同種時用）。物種代碼先驗證，錯字即刻報錯，
     唔會靜靜當「對唔上」。 */
  const overrides = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {};
  const badOverride = [];
  for (const [id, o] of Object.entries(overrides)) {
    if (id.startsWith('_')) continue;
    if (!o || !o.speciesCode) badOverride.push(`${id}（冇 speciesCode）`);
    else if (!tax.byCode.has(o.speciesCode)) badOverride.push(`${id}（代碼 ${o.speciesCode} 唔在 ebird-taxonomy.csv）`);
  }
  if (badOverride.length) {
    console.error(`✗ taxonomyOverrides.json 有問題：${badOverride.join('、')}`);
    process.exit(1);
  }
  const zhTax = fs.existsSync(TAXONOMY_ZH) ? JSON.parse(fs.readFileSync(TAXONOMY_ZH, 'utf8')) : { orders: {}, families: {} };

  const taxonomy = {};
  const fixes = [];
  const fixesName = [];
  const unresolved = [];
  const conflicts = [];
  const counts = { direct: 0, format: 0, 'sci-in-en': 0, 'zh-alias': 0, override: 0 };

  for (const bird of birds) {
    const en = (bird.en || '').trim();

    // A) 先用英文名找 eBird
    let enRec = null;
    let enVia = '';
    if (en && !/^unknown\b/i.test(en)) {
      enRec = tax.byEn.get(norm(en)) || null;
      if (enRec) enVia = 'direct';
      if (!enRec) {
        const l = tax.loose.get(norm(en).replace(/[^a-z ]/g, ''));
        if (l) {
          enRec = l;
          enVia = 'format';
        }
      }
      if (!enRec && /^[A-Z][a-z]+\s+[a-z]/i.test(en)) {
        const s2 = tax.bySci.get(norm(en));
        if (s2) {
          enRec = s2;
          enVia = 'sci-in-en';
        }
      }
    }

    // B) 再用中文名別名表（eBird CODE）找 eBird
    let zhRec = null;
    const aliasCode = aliases[bird.name]?.ebird?.speciesCode;
    if (aliasCode) zhRec = tax.byCode.get(aliasCode) || null;

    // C) 兩邊都有但指向不同物種 → 記錄，交人手
    let rec = enRec;
    let via = enVia;
    let zhMismatch = null;
    if (enRec && zhRec && enRec.SPECIES_CODE !== zhRec.SPECIES_CODE) {
      zhMismatch = {
        en: { comName: enRec.PRIMARY_COM_NAME, sciName: enRec.SCI_NAME, family: stripFamily(enRec.FAMILY) },
        zh: { comName: zhRec.PRIMARY_COM_NAME, sciName: zhRec.SCI_NAME, family: stripFamily(zhRec.FAMILY) },
      };
      // 英文名其實是「另一個物種的學名」→ 幾乎肯定係填錯，取中文名對到的物種
      if (enVia === 'sci-in-en') {
        rec = zhRec;
        via = 'zh-alias(over-sci-mistake)';
        zhMismatch.decision = '採用中文名對應物種（英文欄位放錯學名）';
      } else {
        zhMismatch.decision = '暫時沿用英文名（英文為權威），但中英名不一致，需人手確認';
      }
    } else if (!rec && zhRec) {
      rec = zhRec;
      via = 'zh-alias';
    }

    // D) 人手覆寫最優先（核實過的物種代碼）
    const ov = overrides[bird.id];
    if (ov && ov.speciesCode) {
      rec = tax.byCode.get(ov.speciesCode) || null;
      via = 'override';
      zhMismatch = null;
      if (!rec) {
        unresolved.push({ id: bird.id, name: bird.name, en, note: 'override code 唔存在' });
        continue;
      }
    }

    if (!rec) {
      unresolved.push({ id: bird.id, name: bird.name, en });
      continue;
    }

    const bucket = via.startsWith('zh-alias') ? 'zh-alias' : via;
    counts[bucket] = (counts[bucket] || 0) + 1;
    taxonomy[bird.id] = {
      speciesCode: rec.SPECIES_CODE,
      comName: rec.PRIMARY_COM_NAME,
      sciName: rec.SCI_NAME,
      order: rec.ORDER,
      family: stripFamily(rec.FAMILY),
      // 中文目／科（只作顯示；分類權威仍然係 eBird）
      orderZh: zhTax.orders?.[rec.ORDER] || '',
      familyZh: zhTax.families?.[stripFamily(rec.FAMILY)] || '',
      // eBird/Clements 演化排序（目 → 科 → 種）；前端「跟 eBird 排序」用
      taxonOrder: Number(rec.TAXON_ORDER) || 0,
      source: 'eBird/Clements',
      via,
      ...(zhMismatch ? { zhMismatch } : {}),
    };

    if (zhMismatch) conflicts.push({ id: bird.id, name: bird.name, en, ...zhMismatch });

    // 是否需要改英文名
    if (via === 'override' && ov.nameZh && ov.nameZh !== bird.name) {
      /* 中文名以覆寫表為準（例如「黑臉噪眉」→「黑臉噪鶥」）；--apply 才寫入 */
      fixesName.push({ id: bird.id, name: bird.name, to: ov.nameZh, via: 'override' });
    }
    if (via === 'direct' && !zhMismatch) continue;
    if (zhMismatch && enVia !== 'sci-in-en') continue; // 有衝突就不自動改
    const target = rec.PRIMARY_COM_NAME;
    if (target === en) continue;
    fixes.push({ id: bird.id, name: bird.name, from: en, to: target, sciName: rec.SCI_NAME, via });
  }

  // ── 寫 taxonomy（前端用）──
  // 前端只需要 5 個欄位；via／source 等審計資訊放 reports，避免 bundle 白肥。
  const ordered = {};
  for (const b of birds) {
    const t = taxonomy[b.id];
    if (!t) continue;
    ordered[b.id] = {
      speciesCode: t.speciesCode,
      comName: t.comName,
      sciName: t.sciName,
      order: t.order,
      family: t.family,
      orderZh: t.orderZh,
      familyZh: t.familyZh,
      taxonOrder: t.taxonOrder,
    };
  }
  fs.writeFileSync(OUT_TAXONOMY, `${JSON.stringify(ordered)}\n`);
  fs.writeFileSync(OUT_AUDIT, `${JSON.stringify(taxonomy, null, 2)}\n`);

  // ── 必要時寫回 birds.json ──
  let applied = 0;
  if (APPLY && (fixes.length || fixesName.length)) {
    const fixById = new Map(fixes.map((f) => [f.id, f]));
    const nameById = new Map(fixesName.map((f) => [f.id, f]));
    const next = birds.map((b) => {
      const f = fixById.get(b.id);
      const n = nameById.get(b.id);
      if (!f && !n) return b;
      applied += 1;
      return { ...b, ...(f ? { en: f.to } : {}), ...(n ? { name: n.to } : {}) };
    });
    fs.writeFileSync(`${BIRDS}.bak`, `${JSON.stringify(birds, null, 2)}\n`);
    fs.writeFileSync(BIRDS, `${JSON.stringify(next, null, 2)}\n`);
  }

  // ── 報告 ──
  const resolved = Object.keys(ordered).length;
  const md = [
    '# 卡片 ↔ eBird 對照結果',
    '',
    `- 產生時間：${new Date().toISOString()}`,
    `- 權威來源：eBird / Clements Checklist（Cornell Lab of Ornithology）`,
    `- 卡片總數：${birds.length}`,
    `- ✅ 已對上 eBird：${resolved}`,
    `- ❓ 對不上：${unresolved.length}`,
    `- ✏️ 需要修正英文名：${fixes.length}（${APPLY ? `已寫入 ${applied} 筆` : '未寫入（--dry-run）'}）`,
    `- 🈶 需要修正中文名：${fixesName.length}`,
    `- ⚠️ 中英名衝突（不自動改）：${conflicts.length}`,
    '',
    '| 比對途徑 | 數量 |',
    '|---|---|',
    `| 英文名完全一致 | ${counts.direct} |`,
    `| 只有大小寫／連字號不同 | ${counts.format} |`,
    `| 英文名欄位放的是學名 | ${counts['sci-in-en']} |`,
    `| 用中文名別名表（eBird CODE）救回 | ${counts['zh-alias']} |`,
    `| 人手核定覆寫（taxonomyOverrides.json） | ${counts.override || 0} |`,
    '',
  ];

  if (fixes.length) {
    md.push('## ✏️ 英文名修正', '', '| 編號 | 中文名 | 現值 | 應為（eBird） | 學名 | 途徑 |', '|---|---|---|---|---|---|');
    for (const f of fixes) md.push(`| ${f.id} | ${f.name} | ${f.from || '（空）'} | **${f.to}** | ${f.sciName} | ${f.via} |`);
    md.push('');
  }

  if (fixesName.length) {
    md.push('## 🈶 中文名修正（taxonomyOverrides.json 指定）', '', '| 編號 | 現值 | 應為 |', '|---|---|---|');
    for (const f of fixesName) md.push(`| ${f.id} | ${f.name} | **${f.to}** |`);
    md.push('');
  }

  if (conflicts.length) {
    md.push(
      '## ⚠️ 中英名指向不同物種（請人手確認）',
      '',
      '> 英文為權威，但卡片的中文名與英文名明顯係兩隻雀，程式唔會自動改名。',
      '> 括號內係 eBird 的目／科，方便你一眼看出邊個合理。',
      '',
      '| 編號 | 中文名 | 現英文名 → eBird | 中文名 → eBird | 程式處理 |',
      '|---|---|---|---|---|',
    );
    for (const c of conflicts) {
      md.push(
        `| ${c.id} | ${c.name} | ${c.en.comName}（${c.en.sciName}；${c.en.family}） | ${c.zh.comName}（${c.zh.sciName}；${c.zh.family}） | ${c.decision} |`,
      );
    }
    md.push('');
  }

  if (unresolved.length) {
    md.push('## ❓ 仍然對不上（需要你確認英文名）', '', '| 編號 | 中文名 | 英文名現值 |', '|---|---|---|');
    for (const u of unresolved) md.push(`| ${u.id} | ${u.name} | ${u.en || '（空）'} |`);
    md.push('');
  }

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, `${md.join('\n')}\n`);

  console.log(`🦜 eBird 對照：${resolved}/${birds.length} 張卡`);
  console.log(`   英文名完全一致 ${counts.direct} · 格式差異 ${counts.format} · 放了學名 ${counts['sci-in-en']} · 靠別名救回 ${counts['zh-alias']}`);
  console.log(`   需修正英文名 ${fixes.length} · 中英衝突 ${conflicts.length} · 對不上 ${unresolved.length}`);
  console.log(`📄 src/data/birdTaxonomy.json（${(fs.statSync(OUT_TAXONOMY).size / 1024).toFixed(0)} KB，前端用）`);
  console.log(`📄 reports/enrich-birds.json（含比對途徑，審計用）`);
  console.log(`📄 reports/enrich-birds.md`);
  if (APPLY) console.log(`✏️ 已寫入 birds.json（備份：src/data/birds.json.bak）`);
  else console.log('（--dry-run：未改 birds.json；要寫入請加 --apply）');
}

main();
