#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 台灣鳥類名錄交叉核對（不代表任何一方更權威）
 * ------------------------------------------------------------
 *  為什麼要這支？
 *    香港觀鳥會與中華民國野鳥學會（台灣）各有一套中文名，
 *    兩邊都是華文圈長年通行的叫法，沒有誰比誰權威。
 *    使用者可能在書上、網上、朋友口中見到任何一邊的名字，
 *    圖鑑的責任是「兩個名都搵得到」，而不是「只准一個名」。
 *
 *  這支工具做三件事：
 *    1) 用學名把台灣名錄對上我們的 569 張卡
 *    2) 列出「中文名不同」的地方（兩邊都保留，不取代）
 *    3) 把台灣名寫成「別名」，令搜尋時打台灣名都撈得返隻雀
 *       → 寫入 src/data/twNames.json，由 build-explorer-data.mjs 併入索引
 *
 *  ⚠️ 只取「中文名／學名／科名／遷徙屬性／保育等級」這些事實欄位；
 *     不搬名錄的解說文字（尊重原編者，也避免版權問題）。
 *     來源與版本一定記錄在輸出檔，可追溯。
 *
 *  用法：
 *    npm run cards:tw -- --xlsx "C:\...\2026 臺灣鳥類名錄 (0820修正).xlsx"
 *    npm run cards:tw -- --xlsx <檔案> --check     # 只報告，不寫檔
 *    npm run cards:tw                              # 用已存在的 twNames.json 出報告
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

/* xlsx 係 devDependency（只在讀名錄時用），用 require 載入；
   ESM 專案沒有全域 require，所以要自己造一個。 */
const require = createRequire(import.meta.url);

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT = path.join(DATA, 'twNames.json');
const REPORT = path.join(ROOT, 'reports', 'tw-list-diff.md');

const ARGS = process.argv.slice(2);
const arg = (n, d) => { const i = ARGS.indexOf(n); return i >= 0 ? ARGS[i + 1] : d; };
const CHECK = ARGS.includes('--check');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const birds = readJson(path.join(DATA, 'birds.json'));
const tax = readJson(path.join(DATA, 'birdTaxonomy.json'));
const copy = readJson(path.join(DATA, 'cardCopy.json'));

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

/** 學名的屬名在近年大幅變動（Charadrius↔Anarhynchus 等）→ 用「種小名」做次級比對。
 *  ⚠️ 只靠種小名會撞車：「chinensis」同時是 Oriolus chinensis 與 Spilopelia chinensis。
 *     所以次級比對一定要再有第二重證據（科名或英文名）才收貨。 */
const epithet = (sci) => {
  const parts = norm(sci).split(' ');
  return parts.length >= 2 ? parts[1] : '';
};

/** 台灣名錄的「科名」欄是「鳩鴿科 Columbidae」→ 取拉丁部分 */
const latinFamily = (f) => {
  const m = String(f || '').match(/\b([A-Z][a-z]+idae)\b/);
  return m ? m[1] : '';
};

/** 英文名比對：去掉連字號／大小寫差異，唔追求 100% 一致 */
const looseEn = (s) => norm(s).replace(/[-–—]/g, '-').replace(/\s+/g, ' ');

/** 繁體字形差異（臺灣名錄用「臺灣」「鮫」等寫法）→ 只做顯示，不改資料 */
const twToHk = (s) => String(s || '').replace(/臺/g, '台');

/* ------------------------------------------------------------------
 * 一、讀 xlsx（只在用戶本機跑；沙盒無外網）
 * ------------------------------------------------------------------ */
function loadFromXlsx(file) {
  const XLSX = require('xlsx');
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!raw.length) {
    console.error('✗ 讀不到任何資料列（工作表是空的？）');
    process.exit(1);
  }

  /* 欄名逐年微調（「臺灣地區遷徙屬性 （蘭嶼：蘭…）」這種長欄名連括號都變），
     所以用關鍵詞定位，唔硬編死欄名。 */
  const header = Object.keys(raw[0]);
  const find = (re) => header.find((h) => re.test(h)) || '';
  const COL = {
    zh: find(/^中文名$/),
    sci: find(/^學名$/),
    en: find(/^英文名$/),
    family: find(/^科名$/),
    status: find(/臺灣地區遷徙屬性|台灣地區遷徙屬性/),
    protect: find(/保育等級/),
    endemic: find(/特有性/),
  };
  if (!COL.zh || !COL.sci) {
    console.error(`✗ 找不到「中文名」或「學名」欄。實際欄名：${header.join(' ｜ ')}`);
    process.exit(1);
  }

  return raw.map((r) => ({
    zh: String(r[COL.zh] || '').trim(),
    sci: String(r[COL.sci] || '').trim(),
    en: COL.en ? String(r[COL.en] || '').trim() : '',
    family: COL.family ? String(r[COL.family] || '').trim() : '',
    status: COL.status ? String(r[COL.status] || '').trim() : '',
    protect: COL.protect ? String(r[COL.protect] || '').trim() : '',
    endemic: COL.endemic ? String(r[COL.endemic] || '').trim() : '',
  })).filter((r) => r.zh && r.sci);
}

/* ------------------------------------------------------------------
 * 二、對照
 * ------------------------------------------------------------------ */
function diff(rows) {
  const bySci = new Map();
  const byEpithet = new Map();
  for (const r of rows) {
    bySci.set(norm(r.sci), r);
    const e = epithet(r.sci);
    if (e) byEpithet.set(e, [...(byEpithet.get(e) || []), r]);
  }

  const matched = [];
  const nameDiff = [];
  const unmatched = [];

  for (const b of birds) {
    const t = tax[b.id];
    const sci = t && t.sciName;
    const c = copy[b.id] || {};
    const ourZh = b.name;
    if (!sci) { unmatched.push({ id: b.id, name: ourZh, sci: '', why: '冇學名' }); continue; }

    let hit = bySci.get(norm(sci));
    let via = 'sci';
    if (!hit) {
      /* 屬名變動：種小名相同，而且要再有第二重證據（同科 或 英文名相同） */
      const candidates = (byEpithet.get(epithet(sci)) || []).filter((r) => {
        const famOk = latinFamily(r.family) && latinFamily(r.family) === t.family;
        const enOk = r.en && looseEn(r.en) === looseEn(t.comName || b.en);
        return famOk || enOk;
      });
      if (candidates.length === 1) { hit = candidates[0]; via = 'epithet'; }
    }
    if (!hit) { unmatched.push({ id: b.id, name: ourZh, sci, why: '台灣名錄對唔上' }); continue; }

    matched.push({ id: b.id, name: ourZh, sci, twZh: hit.zh, twSci: hit.sci, via });

    /* 中文名不同：唔改卡面，只記錄＋做別名 */
    const a = ourZh.replace(/臺/g, '台');
    const bb = hit.zh.replace(/臺/g, '台');
    if (a !== bb) {
      /* 判斷差異類型，方便你決定要唔要改卡面名 */
      let kind = '用語不同';          /* 兩個完全不同的名 */
      if (a.length === bb.length) {
        const diffs = [...a].filter((ch, i) => ch !== bb[i]).length;
        if (diffs === 1) kind = '一字之差';
      }
      if (a.includes(bb) || bb.includes(a)) kind = '簡稱／全稱';
      nameDiff.push({ id: b.id, name: ourZh, twZh: hit.zh, sci, kind,
        twStatus: hit.status, twProtect: hit.protect });
    }
  }

  /* 台灣名錄有、但我們卡庫冇的（唔關事，只作統計） */
  const ourEpithets = new Set(birds.map((b) => epithet((tax[b.id] || {}).sciName)).filter(Boolean));
  const twOnly = rows.filter((r) => !ourEpithets.has(epithet(r.sci)));

  return { matched, nameDiff, unmatched, twOnly, rows };
}

/* ------------------------------------------------------------------
 * 三、輸出 twNames.json（別名表，唔取代任何現有名）
 * ------------------------------------------------------------------ */
function buildAliasFile(nameDiff) {
  const out = {
    _readme: {
      用途: '台灣鳥類名錄的中文名，只作「搜尋別名」用，唔會取代卡面名稱。',
      來源: '社團法人中華民國野鳥學會《2026 年臺灣鳥類名錄》(0820 修正) 正表',
      取得: 'https://www.bird.org.tw/download/5698',
      規則: '兩套中文名並存：卡面用香港慣用名，搜尋時打台灣名一樣搵得到。沒有任何一方更權威。',
      更新: '名錄出新版時，重跑 npm run cards:tw -- --xlsx <新檔>',
    },
    names: {},
  };
  for (const d of nameDiff) {
    out.names[d.id] = { zh: d.twZh, twSci: d.twSci, kind: d.kind };
  }
  return out;
}

/* ------------------------------------------------------------------
 * 四、主流程
 * ------------------------------------------------------------------ */
const xlsxFile = arg('--xlsx');
let rows;
if (xlsxFile) {
  if (!fs.existsSync(xlsxFile)) {
    console.error(`✗ 找不到檔案：${xlsxFile}`);
    process.exit(1);
  }
  rows = loadFromXlsx(xlsxFile);
  console.log(`📄 讀到台灣鳥類名錄：${rows.length} 種`);
} else if (fs.existsSync(OUT)) {
  const saved = readJson(OUT);
  rows = Object.entries(saved.names).map(([id, v]) => ({
    zh: v.zh, sci: v.twSci, en: '', family: '', status: '', protect: '',
  }));
  console.log(`📄 用已存的 src/data/twNames.json（${rows.length} 筆差異記錄）`);
} else {
  console.error('✗ 未有台灣名錄資料。先跑：npm run cards:tw -- --xlsx "路徑\\2026 臺灣鳥類名錄.xlsx"');
  process.exit(1);
}

const { matched, nameDiff, unmatched, twOnly } = diff(rows);

console.log(`\n🇭🇰 我們的卡：${birds.length} 張`);
console.log(`✅ 對上台灣名錄：${matched.length} 張（學名 ${matched.filter((m) => m.via === 'sci').length}、屬名變動後靠種小名 ${matched.filter((m) => m.via === 'epithet').length}）`);
console.log(`🈶 中文名不同：${nameDiff.length} 張`);
console.log(`❓ 對唔上：${unmatched.length} 張`);
console.log(`（台灣名錄另有 ${twOnly.length} 種不在我們卡庫）`);

const byKind = nameDiff.reduce((m, d) => ({ ...m, [d.kind]: (m[d.kind] || 0) + 1 }), {});
console.log('   差異類型：' + Object.entries(byKind).map(([k, v]) => `${k} ${v}`).join('、'));

console.log('\n最需要你看的 20 個（唔同名字，兩邊都保留）：');
for (const d of nameDiff.slice(0, 20)) {
  console.log(`   ${d.id} 香港「${d.name}」／台灣「${d.twZh}」　(${d.kind})`);
}

/* 報告（只存差異清單，唔存名錄正文） */
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
const md = [
  '# 台灣鳥類名錄 × AvianDex 對照',
  '',
  `- 來源：中華民國野鳥學會《2026 年臺灣鳥類名錄》(0820 修正)`,
  `- 我們的卡：${birds.length}`,
  `- ✅ 對上：${matched.length}（其中 ${matched.filter((m) => m.via === 'epithet').length} 張是靠種小名，屬名已變動）`,
  `- 🈶 中文名不同：${nameDiff.length}`,
  `- ❓ 對唔上：${unmatched.length}`,
  '',
  '> 兩套中文名都保留：卡面用香港慣用名，搜尋時打台灣名一樣搵得到。',
  '',
  '## 中文名不同（按類型）',
  '',
  '| 編號 | 香港慣用 | 台灣名錄 | 學名 | 類型 |',
  '|---|---|---|---|---|',
  ...nameDiff.map((d) => `| ${d.id} | ${d.name} | ${d.twZh} | *${d.sci}* | ${d.kind} |`),
  '',
  '## 對唔上（需要人手確認）',
  '',
  '| 編號 | 卡面中文名 | 學名 | 原因 |',
  '|---|---|---|---|',
  ...unmatched.map((u) => `| ${u.id} | ${u.name} | ${u.sci ? `*${u.sci}*` : '—'} | ${u.why} |`),
  '',
];
fs.writeFileSync(REPORT, `${md.join('\n')}\n`);
console.log(`\n📄 ${path.relative(ROOT, REPORT)}`);

if (CHECK) {
  console.log('（--check：冇寫入 twNames.json）');
} else {
  fs.writeFileSync(OUT, `${JSON.stringify(buildAliasFile(nameDiff), null, 2)}\n`);
  console.log(`📄 src/data/twNames.json（${nameDiff.length} 個台灣別名）`);
  console.log('   下一步：npm run cards:explorer && npm test');
}
