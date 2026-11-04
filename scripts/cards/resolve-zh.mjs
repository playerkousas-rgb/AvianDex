#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 以 Cornell(eBird) 為權威，反查中文名
 * ============================================================
 *  方向（重要）：
 *    ✅ eBird 英文名／學名／目／科  = 權威（不修改）
 *    ✅ 中文名 = 只作顯示，由中文維基以「學名」反查得來（HK 繁體）
 *    ❌ 絕不會用中文名去改英文名
 *
 *  用途一：修正 birds.json 入面的錯配（例如 0017「暗綠繡眼鳥 / Eastern Buzzard」）
 *  用途二：補中文名（原本是簡體或空白）
 *
 *  流程（每張卡）：
 *    1. birds.json 的英文名 → 對 eBird 分類表（大小寫不敏感）
 *       對不上就用「學名」欄位（有些卡把學名錯放在英文名）
 *    2. 取 eBird 的 SCI_NAME / ORDER / FAMILY（權威）
 *    3. 中文維基 search 該學名 → 找中文條目
 *    4. parse section 0（variant=zh-hk）→ 抽分類表、比對學名是否一致
 *    5. 學名一致 → 採用該中文標題；不一致 → 標為「需人工確認」
 *
 *  用法：
 *    node scripts/cards/resolve-zh.mjs --ids 0017,0009
 *    node scripts/cards/resolve-zh.mjs --from 1 --to 30
 *    node scripts/cards/resolve-zh.mjs --all --delay 500
 *
 *  輸出：
 *    src/data/zh-resolution.json   每張卡的對名結果（含依據）
 *    reports/zh-resolution.md      需人工確認清單（中文名／英文名衝突）
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { parseTaxobox } from './parse-taxobox.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const TAXONOMY = path.join(ROOT, 'src/data/ebird-taxonomy.csv');
const OUT = path.join(ROOT, 'src/data/zh-resolution.json');
const CACHE = path.join(ROOT, '.cache/zh');
const REPORT = path.join(ROOT, 'reports/zh-resolution.md');

const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 ? ARGS[i + 1] : d;
};
const has = (n) => ARGS.includes(n);
const DELAY = Number(arg('--delay', 500));
const UA = 'AvianDex-ZhResolver/1.0 (educational; ai@skwscout.org.hk)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 網路（處理沙盒／代理的 CA 問題，但不會靜默停用憑證檢查）──
async function robustFetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (!/CERT|UNABLE_TO_VERIFY|self.signed/i.test(String(err?.cause?.code || err?.message))) throw err;
    return await new Promise((resolve, reject) => {
      https
        .get(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt') }, (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch (e) {
              reject(e);
            }
          });
        })
        .on('error', reject);
    });
  }
}

async function cached(url, key) {
  fs.mkdirSync(CACHE, { recursive: true });
  const file = path.join(CACHE, `${key.replace(/[^\w.-]/g, '_')}.json`);
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      /* 壞快取 */
    }
  }
  const json = await robustFetchJson(url);
  fs.writeFileSync(file, JSON.stringify(json));
  await sleep(DELAY);
  return json;
}

// ── 1. 讀 eBird 分類表 ──
function loadTaxonomy() {
  const text = fs.readFileSync(TAXONOMY, 'utf8');
  const lines = text.split('\n').filter(Boolean);
  const header = lines.shift().split(',');
  const byEn = new Map();
  const bySci = new Map();
  for (const line of lines) {
    // 欄位可能有引號內逗號（FAMILY (Common name)），用簡單 CSV 分割
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
    const rec = Object.fromEntries(header.map((h, i) => [h, parts[i] || '']));
    byEn.set(rec.PRIMARY_COM_NAME.toLowerCase().trim(), rec);
    bySci.set(rec.SCI_NAME.toLowerCase().trim(), rec);
  }
  return { byEn, bySci };
}

// ── 2. 中文維基：學名 → 中文條目 ──
async function findZhBySciName(sciName) {
  const q = encodeURIComponent(`"${sciName}"`);
  const search = await cached(
    `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${q}&srlimit=5&format=json&formatversion=2`,
    `search-${sciName}`,
  );
  const hits = search?.query?.search || [];
  for (const hit of hits) {
    // 只信「條目本身是物種」的結果：取 section 0 的分類表核對學名
    const parse = await cached(
      `https://zh.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(hit.title)}` +
        '&prop=text&section=0&variant=zh-hk&redirects=1&format=json&formatversion=2',
      `sec0-${hit.title}`,
    );
    const text = parse?.parse?.text;
    if (!text) continue;
    const facts = parseTaxobox(text);
    if (!facts.scientificName) continue;
    if (facts.scientificName.toLowerCase() === sciName.toLowerCase()) {
      return {
        title: parse.parse.title,
        pageid: parse.parse.pageid,
        facts,
        matchedBy: 'sci-name-in-taxobox',
      };
    }
  }
  // 次選：搜尋結果首筆（無分類表可比對 → 只作提示，不自動採用）
  if (hits.length) {
    return { title: hits[0].title, pageid: hits[0].pageid, facts: null, matchedBy: 'search-first-hit', unverified: true };
  }
  return null;
}

// ── 3. 主流程 ──
async function main() {
  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  const { byEn, bySci } = loadTaxonomy();

  const results = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

  let targets = birds;
  const ids = arg('--ids');
  if (ids) {
    const set = new Set(ids.split(',').map((s) => s.trim().padStart(4, '0')));
    targets = targets.filter((b) => set.has(b.id));
  } else {
    const from = Number(arg('--from', 0));
    const to = Number(arg('--to', 9999));
    targets = targets.filter((b) => Number(b.id) >= from && Number(b.id) <= to);
  }
  if (has('--missing-only')) targets = targets.filter((b) => !results[b.id]);

  console.log(`🔗 以 eBird/Clements 為權威，解析 ${targets.length} 張卡的中文名`);

  for (const bird of targets) {
    const enRaw = (bird.en || '').trim();
    const enKey = enRaw.toLowerCase();

    // ① 用英文名對 eBird
    let taxon = byEn.get(enKey) || null;
    let matchedBy = taxon ? 'english-name' : '';

    // ② 英文名其實是學名（例如 "Aythya Baeri"、"Zoothera Aurea"）
    if (!taxon && /\s/.test(enRaw) && /^[A-Z][a-z]+\s+[a-z]/i.test(enRaw)) {
      taxon = bySci.get(enKey) || null;
      if (taxon) matchedBy = 'scientific-name-in-en-field';
    }

    // ③ 都對不上 → 用中文名在中文維基找條目，由條目分類表拿學名，再回 eBird
    if (!taxon) {
      const zhHit = await cached(
        `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(bird.name)}&srlimit=3&format=json&formatversion=2`,
        `zhsearch-${bird.name}`,
      );
      const title = zhHit?.query?.search?.[0]?.title;
      if (title) {
        const parse = await cached(
          `https://zh.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}` +
            '&prop=text&section=0&variant=zh-hk&redirects=1&format=json&formatversion=2',
          `sec0-${title}`,
        );
        const facts = parseTaxobox(parse?.parse?.text || '');
        if (facts.scientificName) {
          taxon = bySci.get(facts.scientificName.toLowerCase()) || null;
          if (taxon) matchedBy = 'zh-page-sci-name';
        }
      }
    }

    if (!taxon) {
      results[bird.id] = {
        id: bird.id,
        zhName: bird.name,
        enName: bird.en || '',
        status: 'unmatched',
        note: 'eBird 分類表查不到此英文名／學名，需人工確認英文名是否正確',
        checkedAt: new Date().toISOString(),
      };
      console.log(`   ❓ ${bird.id} ${bird.name} / ${enRaw || '（無英文名）'} — eBird 查不到`);
      continue;
    }

    const ebird = {
      speciesCode: taxon.SPECIES_CODE,
      comName: taxon.PRIMARY_COM_NAME,
      sciName: taxon.SCI_NAME,
      order: taxon.ORDER,
      family: taxon.FAMILY.replace(/\s*\(.*\)\s*$/, ''),
    };

    // ④ 由學名找中文名
    const zh = await findZhBySciName(ebird.sciName);

    let status = 'ok';
    let note = '';
    if (!zh) {
      status = 'no-zh-page';
      note = '中文維基找不到對應條目，中文名需人工補';
    } else if (zh.unverified) {
      status = 'zh-unverified';
      note = `中文條目「${zh.title}」找不到可核對的分類表，需人工確認`;
    } else {
      const zhSciMatches = zh.facts?.scientificName?.toLowerCase() === ebird.sciName.toLowerCase();
      if (!zhSciMatches) {
        status = 'zh-sci-mismatch';
        note = `中文條目學名 ${zh.facts?.scientificName} ≠ eBird ${ebird.sciName}`;
      }
    }

    const zhName = zh?.title || '';
    const nameChanged = zhName && zhName !== bird.name;

    results[bird.id] = {
      id: bird.id,
      // 權威（不要手改，改就改 eBird 來源）
      ebird,
      matchedBy,
      // 顯示用中文名（維基）
      zhName,
      previousZhName: bird.name,
      previousEnName: bird.en || '',
      zhSource: zh ? { title: zh.title, pageid: zh.pageid, matchedBy: zh.matchedBy } : null,
      zhTaxonomy: zh?.facts
        ? { order: zh.facts.rank?.['目'] || '', family: zh.facts.rank?.['科'] || '', genus: zh.facts.rank?.['屬'] || '' }
        : null,
      status,
      note,
      nameChanged,
      checkedAt: new Date().toISOString(),
    };

    const icon = status === 'ok' ? '✅' : status === 'unmatched' ? '❓' : '⚠️';
    console.log(
      `   ${icon} ${bird.id} ${bird.name} → ${ebird.comName} (${ebird.sciName}) ${zhName ? `→ 中文：${zhName}` : ''}${
        nameChanged ? '  ⬅ 中文名不同' : ''
      }`,
    );
  }

  const ordered = {};
  for (const b of birds) if (results[b.id]) ordered[b.id] = results[b.id];
  fs.writeFileSync(OUT, `${JSON.stringify(ordered, null, 2)}\n`);

  // ── 報告 ──
  const list = Object.values(ordered);
  const ok = list.filter((r) => r.status === 'ok');
  const problems = list.filter((r) => r.status !== 'ok');
  const renamed = list.filter((r) => r.nameChanged);
  const enWrong = list.filter((r) => r.matchedBy === 'scientific-name-in-en-field');

  const md = [
    '# 中文名解析報告（以 eBird/Clements 為權威）',
    '',
    `- 產生時間：${new Date().toISOString()}`,
    `- 權威來源：eBird / Clements Checklist（Cornell Lab of Ornithology）`,
    `- 已解析：${list.length}`,
    `- ✅ 中文名與學名對得上：${ok.length}`,
    `- ⚠️ 需人工確認：${problems.length}`,
    `- 🔤 英文名欄位其實是學名（需改）：${enWrong.length}`,
    `- 🀄 中文名與維基不同（建議更新）：${renamed.length}`,
    '',
  ];

  if (enWrong.length) {
    md.push('## 🔤 英文名欄位放錯了學名（eBird 有正式英文名）', '', '| 編號 | 現值 | eBird 正式英文名 | 學名 |', '|---|---|---|---|');
    enWrong.forEach((r) => md.push(`| ${r.id} | ${r.previousEnName} | **${r.ebird.comName}** | ${r.ebird.sciName} |`));
    md.push('');
  }

  if (renamed.length) {
    md.push('## 🀄 中文名與維基不一致（建議採用維基）', '', '| 編號 | 現中文名 | 維基中文名 | eBird 英文名 | 學名 |', '|---|---|---|---|---|');
    renamed.slice(0, 200).forEach((r) =>
      md.push(`| ${r.id} | ${r.previousZhName} | **${r.zhName}** | ${r.ebird.comName} | ${r.ebird.sciName} |`),
    );
    md.push('');
  }

  const unmatched = list.filter((r) => r.status === 'unmatched');
  if (unmatched.length) {
    md.push('## ❓ eBird 查不到（英文名要人手改）', '', '| 編號 | 中文名 | 現英文名 |', '|---|---|---|');
    unmatched.forEach((r) => md.push(`| ${r.id} | ${r.zhName} | ${r.previousEnName || '（空）'} |`));
    md.push('');
  }

  const warnings = list.filter((r) => r.status === 'no-zh-page' || r.status === 'zh-unverified' || r.status === 'zh-sci-mismatch');
  if (warnings.length) {
    md.push('## ⚠️ 中文名需人工確認', '', '| 編號 | eBird 英文名 | 學名 | 原因 |', '|---|---|---|---|');
    warnings.slice(0, 200).forEach((r) => md.push(`| ${r.id} | ${r.ebird?.comName || ''} | ${r.ebird?.sciName || ''} | ${r.note} |`));
    md.push('');
  }

  md.push(
    '## 如何套用',
    '',
    '```bash',
    'node scripts/cards/apply-zh.mjs --dry-run   # 先看會改乜',
    'node scripts/cards/apply-zh.mjs             # 寫入 birds.json（會備份）',
    '```',
    '',
    '> 規則：**只改中文名與英文名（英文名僅在「現在放的是學名」時才改）**，',
    '> 學名／目／科一律以 eBird 為準，寫入 `birdTaxonomy.json`，不會寫回 birds.json 的英文字段。',
    '',
  );
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, `${md.join('\n')}\n`);

  console.log('');
  console.log(`✅ 完成：${list.length} 張（ok ${ok.length} · 需確認 ${problems.length}）`);
  console.log(`📄 src/data/zh-resolution.json`);
  console.log(`📄 reports/zh-resolution.md`);
}

main().catch((e) => {
  console.error('❌ 執行失敗：', e);
  process.exit(1);
});
