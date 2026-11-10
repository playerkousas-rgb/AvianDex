#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 補齊「詳細資料」12 欄（維基原文，不改寫）
 * ------------------------------------------------------------
 *  為什麼要有這支？
 *    詳細資料頁有 12 欄，但 569 張卡入面有大量空格：
 *      habitat 缺 358、humanRelation 缺 444、conservation 缺 374…
 *    空格本身不是問題（寧願空都好過亂填），問題係「明明有原文，
 *    只是之前冇抓到」。這支工具專門補這一類。
 *
 *  三條底線（照舊，不變）
 *    1. 只取維基原文**整句**，不改寫、不機翻、不摘要生成
 *    2. 每個填進去的字都要記 pageid／條目標題，可回查
 *    3. 抽不到就留空，絕不為湊欄位寫字
 *
 *  做法
 *    - 以 cardCopy.json 的 source 內的 pageid 直接取 wikitext（最準，不會抓錯條目）
 *    - 冇 pageid 就退為「用學名搜尋，並核對 wikitext 真的含該學名」
 *    - 交給既有的 extractFields() 抽取（同一支抽取器，規則同卡面一致）
 *    - 只填「本來是空」的欄；已有文字的欄一個字都不碰
 *
 *  ⚠️ 這支要在**你的電腦**跑：沙盒連不到 wikipedia。
 *
 *  用法
 *    npm run cards:gaps                 # 只出建議，唔改檔（安全）
 *    npm run cards:gaps -- --apply      # 寫入 cardCopy.json（自動備份）
 *    npm run cards:gaps -- --ids 0021,0236
 *    npm run cards:gaps -- --limit 20   # 先試 20 張
 *    npm run cards:gaps -- --delay 300  # 請求間隔（毫秒）
 *
 *  輸出
 *    data/gapfill/proposals.json   建議清單（逐欄附 pageid）
 *    reports/gapfill.md            人看的報告
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

import { extractFields } from './extract-bilingual.mjs';
import { FIELDS } from './field-schema.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT_DIR = path.join(ROOT, 'data', 'gapfill');
const REPORT = path.join(ROOT, 'reports', 'gapfill.md');
const CACHE = path.join(ROOT, '.cache', 'gapfill');
const UA = 'AvianDex-GapFill/1.0 (personal field guide; contact: ai@skwscout.org.hk)';

const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 && ARGS[i + 1] && !ARGS[i + 1].startsWith('--') ? ARGS[i + 1] : d;
};
const flag = (n) => ARGS.includes(n);
const APPLY = flag('--apply');
const DELAY = Number(arg('--delay', 350));

/** 只補這 12 欄（＋Top5）。長度／體重／IUCN 由 infobox 讀，另有機制。 */
const TARGETS = FIELDS.filter((f) => f.slot === 'grid4').map((f) => f.id);
const ZH_FIELDS = [...TARGETS];

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const filled = (v) => (Array.isArray(v) ? v.filter((x) => String(x || '').trim()).length > 0 : !!String(v ?? '').trim());

/* ------------------------------------------------------------------
 * 一、從 source 字串取出 pageid
 * ------------------------------------------------------------------ */
function pagesFromSource(src = '') {
  const out = {};
  const zh = src.match(/zh\.wikipedia\s+([^·｜]+?)\s*·\s*pageid\s+(\d+)/);
  const en = src.match(/en\.wikipedia\s+([^·｜]+?)\s*·\s*pageid\s+(\d+)/);
  if (zh) out.zh = { title: zh[1].trim(), pageid: Number(zh[2]) };
  if (en) out.en = { title: en[1].trim(), pageid: Number(en[2]) };
  return out;
}

/* ------------------------------------------------------------------
 * 二、抓 wikitext（帶快取，重跑不會再打 wikipedia）
 * ------------------------------------------------------------------ */
function cacheFile(lang, key) {
  fs.mkdirSync(CACHE, { recursive: true });
  return path.join(CACHE, `${lang}-${String(key).replace(/[^\w\u4e00-\u9fa5.-]/g, '_').slice(0, 80)}.json`);
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } }, (res) => {
      if (res.statusCode >= 300 && res.headers.location) {
        res.resume();
        getJson(res.headers.location).then(resolve, reject);
        return;
      }
      const c = [];
      res.on('data', (d) => c.push(d));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(c).toString('utf8'))); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

async function cachedJson(key, url) {
  const f = cacheFile('json', key);
  if (fs.existsSync(f)) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* 重抓 */ }
  }
  const json = await getJson(url);
  fs.writeFileSync(f, JSON.stringify(json));
  await sleep(DELAY);
  return json;
}

/** 用 pageid 取 wikitext（pageid 比標題穩定：條目改名都追得返） */
async function wikitextByPageId(lang, pageid) {
  const api = `https://${lang}.wikipedia.org/w/api.php`;
  const url = `${api}?action=parse&format=json&formatversion=2&prop=wikitext&pageid=${pageid}&redirects=1`;
  const j = await cachedJson(`page-${lang}-${pageid}`, url);
  const p = j?.parse;
  if (!p?.wikitext) return null;
  return { title: p.title, pageid: p.pageid, wt: p.wikitext };
}

/** 冇 pageid 時：用學名搜尋，並核對 wikitext 真的含該學名（防止認錯雀） */
async function findPageBySciName(lang, sciName) {
  if (!sciName) return null;
  const api = `https://${lang}.wikipedia.org/w/api.php`;
  const q = encodeURIComponent(`"${sciName}"`);
  const s = await cachedJson(
    `search-${lang}-${sciName}`,
    `${api}?action=query&format=json&formatversion=2&list=search&srsearch=${q}&srlimit=5`,
  );
  for (const hit of s?.query?.search || []) {
    const t = await cachedJson(
      `ttl-${lang}-${hit.pageid}`,
      `${api}?action=parse&format=json&formatversion=2&prop=wikitext&page=${encodeURIComponent(hit.title)}&redirects=1`,
    );
    const wt = t?.parse?.wikitext;
    if (!wt) continue;
    if (!wt.toLowerCase().includes(sciName.toLowerCase())) continue;
    return { title: t.parse.title, pageid: t.parse.pageid, wt };
  }
  return null;
}

/* ------------------------------------------------------------------
 * 三、純函數：由 wikitext 產生建議（不涉網絡，可單獨測試）
 * ------------------------------------------------------------------ */
/**
 * 把抽到的句子清乾淨，或者判定「唔要」。
 *
 * 為什麼要這一步？實測（藍翡翠條目）抽到三種垃圾：
 *   「]] 具有紫藍色的翅膀…」         ← 維基連結未拆乾淨，開頭剩 ]]
 *   「，又名，廣泛分佈於熱帶亞洲…」   ← 名字被遮住之後剩一堆標點
 *   behavior 同 migration 是同一句   ← 同一句塞兩個欄，浪費版面
 * 這些字若果寫入資料庫，卡面就會出現「]] 具有…」這種東西。
 * 寧願該欄留空（介面顯示「資料待查」），都不要出這種字。
 */
const JUNK_HEAD = /^[\s，、；：。！？·\-—()（）\[\]【】「」『』"'']+/;
const JUNK_MARKUP = /\[\[|\]\]|\{\{|\}\}|<ref|<[a-z]+\s*\/?>/i;
const DANGLING_NAME = /^(又名|又稱|也稱|俗稱|別名|英名|學名)[，,、：:；;\s]/;

export function cleanCell(text) {
  if (typeof text !== 'string') return '';
  let t = text.trim();
  for (let i = 0; i < 3; i += 1) {
    const before = t;
    t = t.replace(JUNK_HEAD, '').trim();
    if (t === before) break;
  }
  if (!t) return '';
  if (JUNK_MARKUP.test(t)) return '';      /* 未拆乾淨的維基標記 → 唔用 */
  if (DANGLING_NAME.test(t)) return '';    /* 開頭就是「又名，」→ 名字被遮走，唔完整 */
  if (t.length < 8) return '';
  if (!/[\u4e00-\u9fff]/.test(t) && !/[A-Za-z]{3}/.test(t)) return '';
  return t;
}

/**
 * @param {{zh?: {pageid:number,title:string,wt:string}, en?: {pageid:number,title:string,wt:string}}} pages
 * @param {{name?:string, sci?:string, enName?:string, miss:string[]}} ctx
 * @returns {Record<string, {zh?:string, en?:string, srcZh?:object, srcEn?:object}>}
 */
export function proposeFromPages(pages, ctx) {
  const { name = '', sci = '', enName = '', miss = [] } = ctx;
  const got = {};
  if (!miss.length) return got;

  if (pages.zh?.wt) {
    const f = extractFields(pages.zh.wt, { lang: 'zh', sciName: sci, ownName: name, only: miss });
    for (const k of miss) {
      if (!filled(f[k])) continue;
      got[k] = { ...(got[k] || {}), zh: f[k], srcZh: { pageid: pages.zh.pageid, title: pages.zh.title } };
    }
  }
  if (pages.en?.wt) {
    const f = extractFields(pages.en.wt, { lang: 'en', sciName: sci, ownName: enName, only: miss });
    for (const k of miss) {
      if (!filled(f[k])) continue;
      got[k] = { ...(got[k] || {}), en: f[k], srcEn: { pageid: pages.en.pageid, title: pages.en.title } };
    }
  }

  /* 清乾淨：唔完整的句子寧願丟，唔好寫入去 */
  for (const k of Object.keys(got)) {
    if (got[k].zh) {
      const c = cleanCell(got[k].zh);
      if (c) got[k].zh = c; else delete got[k].zh;
    }
    if (got[k].en) {
      const c = cleanCell(got[k].en);
      if (c) got[k].en = c; else delete got[k].en;
    }
    if (!got[k].zh && !got[k].en) delete got[k];
  }

  /* 去重：同一句唔可以同時塞入兩個欄（按 TARGETS 次序保留較前那個） */
  const seen = new Map();
  for (const k of [...got.__order || miss].filter((x) => got[x])) {
    const key = (got[k].zh || got[k].en || '').slice(0, 24);
    if (!key) continue;
    if (seen.has(key)) { delete got[k]; continue; }
    seen.set(key, k);
  }

  /* 歸位：一句明顯講遷徙的句子，如果 migration 有空，就唔應該放在「行為習性」。
     這不是改寫（字句一字不動），只是把它放到對的格子。 */
  const MIGRATION_HINT = /遷徙|越冬|過境|留鳥|候鳥|南遷|北返/;
  if (miss.includes('migration') && !got.migration) {
    for (const k of Object.keys(got)) {
      if (k === 'migration') continue;
      const t = got[k].zh || got[k].en || '';
      if (MIGRATION_HINT.test(t)) {
        got.migration = got[k];
        delete got[k];
        break;
      }
    }
  }

  return got;
}

/* ------------------------------------------------------------------
 * 四、主流程
 * ------------------------------------------------------------------ */
/* 單張卡出錯（網絡抖一下）不可以拖死整批 569 張 → 逐張 try/catch，
   並在開跑前先試一次連線，冇網就即刻講清楚，唔好空跑 569 次。 */
async function preflight() {
  try {
    await getJson('https://zh.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&meta=siteinfo');
    return true;
  } catch (e) {
    console.error('✗ 連不上 zh.wikipedia.org：' + e.message);
    console.error('');
    console.error('  這支工具要在你自己的電腦跑（沙盒連不到維基）。');
    console.error('  如果電腦有網但仍然失敗：公司／學校網絡可能擋了 wikipedia，試試手機熱點。');
    return false;
  }
}

async function main() {
  if (!(await preflight())) process.exit(1);

  const copy = read(path.join(DATA, 'cardCopy.json'));
  const tax = read(path.join(DATA, 'birdTaxonomy.json'));

  let ids = Object.keys(copy).filter((k) => /^\d{4}$/.test(k)).sort();
  const only = arg('--ids');
  if (only) ids = ids.filter((id) => only.split(',').map((s) => s.trim()).includes(id));
  const limit = Number(arg('--limit', 0));
  if (limit > 0) ids = ids.slice(0, limit);

  const proposals = {};
  const stats = Object.fromEntries(TARGETS.map((f) => [f, 0]));
  const noSource = [];
  const nothingFound = [];
  const errors = [];

  for (const [i, id] of ids.entries()) {
    const c = copy[id];
    const miss = TARGETS.filter((f) => !filled(c[f]));
    if (!miss.length) continue;                 /* 12 欄齊 → 唔使做 */

    const pages = pagesFromSource(c.source);
    const sci = tax[id]?.sciName || '';

    let zhPage = null;
    let enPage = null;
    try {
      /* 中文：有 pageid 用 pageid；冇就用學名搵 */
      zhPage = pages.zh ? await wikitextByPageId('zh', pages.zh.pageid) : null;
      if (!zhPage && sci) zhPage = await findPageBySciName('zh', sci);
      /* 英文同理 */
      enPage = pages.en ? await wikitextByPageId('en', pages.en.pageid) : null;
      if (!enPage && sci) enPage = await findPageBySciName('en', sci);
    } catch (e) {
      errors.push({ id, name: c.name || '', why: e.message });
      continue;
    }

    if (!zhPage && !enPage) { noSource.push({ id, name: c.name || '', sci }); continue; }

    const got = proposeFromPages(
      { zh: zhPage, en: enPage },
      { name: c.name || '', sci, enName: tax[id]?.comName || '', miss },
    );

    if (!Object.keys(got).length) {
      nothingFound.push({ id, name: c.name || '', zh: zhPage?.title || '', en: enPage?.title || '' });
      continue;
    }
    proposals[id] = got;
    for (const k of Object.keys(got)) stats[k] += 1;

    if ((i + 1) % 25 === 0) {
      console.log(`  …已處理 ${i + 1}/${ids.length}（累計新增建議 ${Object.values(stats).reduce((a, b) => a + b, 0)} 格）`);
    }
  }

  /* ---------------- 輸出建議 ---------------- */
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const propFile = path.join(OUT_DIR, 'proposals.json');
  fs.writeFileSync(propFile, JSON.stringify({
    _readme: {
      用途: '詳細資料空缺的補齊建議。每格附維基 pageid，可逐句回查。',
      來源: 'wikipedia（zh／en）wikitext，經 scripts/cards/extract-bilingual.mjs 抽取',
      規則: '只取原文整句；不改寫、不機翻；抽不到就留空。',
      產生時間: new Date().toISOString(),
    },
    proposals,
  }, null, 2));

  const totalCells = Object.values(stats).reduce((a, b) => a + b, 0);
  console.log(`\n📊 建議新增 ${Object.keys(proposals).length} 張卡、共 ${totalCells} 格：`);
  for (const [f, n] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    if (n) console.log(`   ${f.padEnd(13)} +${n}`);
  }
  if (noSource.length) console.log(`\n⚠️ 連條目都搵唔到：${noSource.length} 張`);
  if (errors.length) {
    console.log(`⚠️ 網絡出錯而跳過：${errors.length} 張（重跑會用快取，只補未做的）`);
    for (const e of errors.slice(0, 5)) console.log(`   ${e.id} ${e.name}：${e.why}`);
  }
  if (nothingFound.length) console.log(`⚠️ 條目搵到但抽唔到可用整句：${nothingFound.length} 張（寧願留空）`);

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  const md = [
    '# 詳細資料補齊報告',
    '',
    `- 產生：${new Date().toISOString()}`,
    `- 建議新增：**${Object.keys(proposals).length}** 張卡、**${totalCells}** 格`,
    `- 連條目都搵唔到：${noSource.length}`,
    `- 條目有但抽唔到整句：${nothingFound.length}（一律留空，不硬填）`,
    '',
    '| 欄位 | 可補格數 |',
    '|---|---|',
    ...Object.entries(stats).sort((a, b) => b[1] - a[1]).map(([f, n]) => `| ${f} | ${n} |`),
    '',
    '## 樣本（每欄 3 條，全部附 pageid）',
    '',
  ];
  for (const f of TARGETS) {
    const rows = Object.entries(proposals).filter(([, g]) => g[f]).slice(0, 3);
    if (!rows.length) continue;
    md.push(`### ${f}`, '');
    for (const [id, g] of rows) {
      const cell = g[f];
      const src = cell.srcZh?.pageid ?? cell.srcEn?.pageid;
      const lang = cell.zh ? 'zh' : 'en';
      md.push(`- \`${id}\` **${lang}** · pageid ${src}：${cell.zh || cell.en}`);
    }
    md.push('');
  }
  if (nothingFound.length) {
    md.push('## 抽唔到（需要人手或另找來源）', '', '| 編號 | 卡名 | 中文條目 | 英文條目 |', '|---|---|---|---|');
    for (const x of nothingFound) md.push(`| ${x.id} | ${x.name} | ${x.zh || '—'} | ${x.en || '—'} |`);
    md.push('');
  }
  if (noSource.length) {
    md.push('## 連維基條目都搵唔到', '', '| 編號 | 卡名 | 學名 |', '|---|---|---|');
    for (const x of noSource) md.push(`| ${x.id} | ${x.name} | *${x.sci || '—'}* |`);
    md.push('');
  }
  fs.writeFileSync(REPORT, `${md.join('\n')}\n`);
  console.log(`\n📄 ${path.relative(ROOT, propFile)}`);
  console.log(`📄 ${path.relative(ROOT, REPORT)}`);

  /* ---------------- 寫入 ---------------- */
  if (!APPLY) {
    console.log('\n（未寫入。看過 reports/gapfill.md 之後，加 --apply 才寫入 cardCopy.json）');
    return;
  }
  if (!Object.keys(proposals).length) return;

  const backup = path.join(DATA, 'cardCopy.json.bak-gapfill');
  fs.copyFileSync(path.join(DATA, 'cardCopy.json'), backup);
  let applied = 0;
  for (const [id, g] of Object.entries(proposals)) {
    const c = copy[id];
    for (const [field, cell] of Object.entries(g)) {
      if (filled(c[field])) continue;          /* 再確認一次：已有字就唔碰 */
      /* 同一欄的中英文要成對：有 zh 就寫 zh，有 en 就入 fieldCopy，
         兩者都源自同一批 pageid，介面才會中英一致 */
      if (cell.zh) c[field] = cell.zh;
      c.fieldCopy = Array.isArray(c.fieldCopy) ? c.fieldCopy : [];
      let fc = c.fieldCopy.find((x) => x && x.id === field);
      if (!fc) { fc = { id: field, zh: '', en: '' }; c.fieldCopy.push(fc); }
      if (cell.zh && !filled(fc.zh)) fc.zh = cell.zh;
      if (cell.en && !filled(fc.en)) fc.en = cell.en;
      /* 來源：把新用到的 pageid 補入 source，保留原有內容 */
      const add = [];
      if (cell.srcZh && !String(c.source || '').includes(`pageid ${cell.srcZh.pageid}`)) {
        add.push(`zh.wikipedia ${cell.srcZh.title} · pageid ${cell.srcZh.pageid}`);
      }
      if (cell.srcEn && !String(c.source || '').includes(`pageid ${cell.srcEn.pageid}`)) {
        add.push(`en.wikipedia ${cell.srcEn.title} · pageid ${cell.srcEn.pageid}`);
      }
      if (add.length) c.source = `${c.source || ''} ｜ ${add.join(' ｜ ')}`.trim();
      applied += 1;
    }
  }
  fs.writeFileSync(path.join(DATA, 'cardCopy.json'), `${JSON.stringify(copy, null, 2)}\n`);
  console.log(`\n✅ 已寫入 ${applied} 格（備份：${path.relative(ROOT, backup)}）`);
  console.log('   下一步：npm run cards:details && npm test');
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error('✗', e.message);
    process.exit(1);
  });
}
