#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 物種資料查證抓取器（唯一事實來源）
 * ============================================================
 *  原則：生圖之前，先把「目／科／屬／學名／IUCN」查實並存檔。
 *        AI 只會被餵「已查證」的欄位；查唔到的欄位會明確標示「資料待查」。
 *
 *  為什麼可以信：
 *    · 資料直接抽自中文維基百科條目頂部的「科學分類」表（有編者維護、有引用）
 *    · 明確指定 variant=zh-hant 並跟隨重定向 → 一定拿到繁體標題（唔會變簡體）
 *    · 每一筆都記錄 pageid／修訂時間／網址，可追溯、可審計
 *
 *  用法（可在本機或有網的環境跑）：
 *    node scripts/cards/fetch-facts.mjs --ids 0289,0001
 *    node scripts/cards/fetch-facts.mjs --from 22 --to 60
 *    node scripts/cards/fetch-facts.mjs --missing-only
 *
 *  輸出：
 *    src/data/birdFacts.json      已查證資料（進 Git，作審計紀錄）
 *    reports/facts-report.md      進度／缺資料／抓不到清單
 *
 *  ⚠️ 禮貌抓取：每種最多 2 個請求、預設 400ms 間隔、帶可識別 User-Agent、有本機快取。
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTaxobox } from './parse-taxobox.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const FACTS = path.join(ROOT, 'src/data/birdFacts.json');
const CACHE = path.join(ROOT, '.cache/facts');
const REPORT = path.join(ROOT, 'reports/facts-report.md');

const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 ? ARGS[i + 1] : d;
};
const has = (n) => ARGS.includes(n);

const DELAY = Number(arg('--delay', 400));
const UA = 'AvianDex-FactCheck/1.0 (educational field guide; ai@skwscout.org.hk)';
const WIKI = 'https://zh.wikipedia.org/w/api.php';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureDirs() {
  fs.mkdirSync(CACHE, { recursive: true });
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
}

async function cachedFetchJson(url, cacheKey) {
  const cacheFile = path.join(CACHE, `${cacheKey}.json`);
  if (fs.existsSync(cacheFile) && !has('--no-cache')) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (cached && !cached.error) return cached;
    } catch {
      /* 壞快取 → 重抓 */
    }
  }
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  fs.writeFileSync(cacheFile, JSON.stringify(json));
  await sleep(DELAY);
  return json;
}

/**
 * 用英文維基交叉核對學名（1 個請求）。
 * 英文維基的摘要第一句通常寫成「The Common Kingfisher (Alcedo atthis) is ...」，
 * 可以直接抽出二名法，再與中文維基分類表的學名比對。
 */
async function checkEnglishName(bird) {
  if (!bird.en || /unknown/i.test(bird.en)) {
    return { status: 'unknown-en', note: 'birds.json 的英文名是 Unknown Species，需人工補' };
  }
  const url =
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bird.en)}` +
    '?redirect=true';
  try {
    const data = await cachedFetchJson(url, `en-${encodeURIComponent(bird.en)}`);
    if (!data?.extract) return { status: 'no-page', note: 'English Wikipedia 找不到此俗名' };
    const m = data.extract.match(/\b([A-Z][a-z]{2,})\s+([a-z][a-z-]{2,})\b/);
    return {
      status: m ? 'ok' : 'no-binomial',
      scientificName: m ? `${m[1]} ${m[2]}` : '',
      wikiTitle: data.title,
      note: '',
    };
  } catch (err) {
    return { status: 'error', note: err.message };
  }
}

/**
 * 抓一個物種的維基 section 0（含科學分類表）。
 * 先試繁體名，再試簡體/英文俗名（有些頁面只有簡體標題）。
 */
async function fetchWikiSection0(bird) {
  const candidates = [...new Set([bird.name, bird.en].filter(Boolean))];
  let lastError = null;

  for (const title of candidates) {
    const url =
      `${WIKI}?action=parse&page=${encodeURIComponent(title)}` +
      '&prop=text&section=0&variant=zh-hant&redirects=1&format=json&formatversion=2';
    try {
      const data = await cachedFetchJson(url, `sec0-${encodeURIComponent(title)}`);
      if (data?.error) {
        lastError = data.error.info || data.error.code;
        continue;
      }
      const parse = data?.parse;
      if (!parse?.text) continue;
      const facts = parseTaxobox(parse.text);
      // 完全抽唔到分類 = 這頁不是物種條目，試下一個
      if (!facts.rank['目'] && !facts.rank['科']) {
        lastError = '頁面沒有科學分類表';
        continue;
      }
      const en = await checkEnglishName(bird);
      let consistency = 'ok';
      if (en.status === 'ok' && facts.scientificName) {
        const zhGenus = facts.scientificName.split(/\s+/)[0];
        const enGenus = en.scientificName.split(/\s+/)[0];
        consistency = en.scientificName === facts.scientificName ? 'exact' : zhGenus !== enGenus ? 'genus-mismatch' : 'species-mismatch';
      } else if (en.status !== 'ok') {
        consistency = en.status;
      }
      return {
        ...facts,
        enCheck: en,
        consistency,
        title: parse.title,
        pageid: parse.pageid,
        redirectedFrom: parse.redirects?.[0]?.from || null,
        source: {
          site: 'zh.wikipedia.org',
          title: parse.title,
          pageid: parse.pageid,
          url: `https://zh.wikipedia.org/wiki/${encodeURIComponent(parse.title)}`,
        },
      };
    } catch (err) {
      lastError = err.message;
    }
  }
  return { error: lastError || '找不到條目' };
}

async function main() {
  ensureDirs();
  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  let existing = {};
  if (fs.existsSync(FACTS)) {
    try {
      existing = JSON.parse(fs.readFileSync(FACTS, 'utf8'));
    } catch {
      existing = {};
    }
  }

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
  if (has('--missing-only')) targets = targets.filter((b) => !existing[b.id]?.rank?.['科']);

  console.log(`🔎 查證 ${targets.length} 種（來源：中文維基百科「科學分類」表）`);
  console.log(`   間隔 ${DELAY}ms，可用 --delay 調；有 .cache/facts 快取，重跑不會重抓`);

  let ok = 0;
  let failed = 0;
  const failures = [];

  for (const bird of targets) {
    try {
      const facts = await fetchWikiSection0(bird);
      if (facts.error) {
        failed += 1;
        failures.push({ id: bird.id, name: bird.name, reason: facts.error });
        console.error(`   ⚠️  ${bird.id} ${bird.name}：${facts.error}`);
      } else {
        existing[bird.id] = { id: bird.id, name: bird.name, en: bird.en || '', ...facts, verifiedAt: new Date().toISOString() };
        ok += 1;
        process.stdout.write(`   ✅ ${bird.id} ${bird.name} → ${facts.rank['目'] || '?'}/${facts.rank['科'] || '?'}\n`);
      }
    } catch (err) {
      failed += 1;
      failures.push({ id: bird.id, name: bird.name, reason: err.message });
      console.error(`   ❌ ${bird.id} ${bird.name}：${err.message}`);
    }
  }

  // 依 original 順序輸出
  const ordered = {};
  for (const b of birds) if (existing[b.id]) ordered[b.id] = existing[b.id];
  fs.writeFileSync(FACTS, `${JSON.stringify(ordered, null, 2)}\n`);

  // ── 報告 ──
  const all = Object.values(ordered);
  const withBoth = all.filter((f) => f.rank?.['目'] && f.rank?.['科']);
  const noFamily = all.filter((f) => !f.rank?.['科']);
  const md = [
    '# 物種資料查證報告（facts report）',
    '',
    `- 產生時間：${new Date().toISOString()}`,
    `- 來源：中文維基百科條目「科學分類」表（variant=zh-hant, redirects=1）`,
    `- 已查證（有目＋科）：**${withBoth.length} / ${all.length}**`,
    `- 缺「科」：${noFamily.length}`,
    '',
    '## 缺資料（生圖時這些欄位會寫「資料待查」，不准 AI 自己填）',
    '',
    noFamily.length
      ? '```\n' + noFamily.map((f) => `${f.id} ${f.name} — 目：${f.rank?.['目'] || '缺'}`).join('\n') + '\n```'
      : '全部都有目／科 ✅',
    '',
    '## 抽樣（前 12 筆，可與維基原條目對照）',
    '',
    '| 編號 | 中文名 | 目 | 科 | 屬 | 學名 | IUCN | pageid |',
    '|---|---|---|---|---|---|---|---|',
    ...withBoth.slice(0, 12).map(
      (f) =>
        `| ${f.id} | ${f.name} | ${f.rank['目']} | ${f.rank['科']} | ${f.rank['屬'] || ''} | ${f.scientificName || ''} | ${
          f.iucn || ''
        } | ${f.pageid || ''} |`,
    ),
    '',
    failures.length ? '## 抓取失敗（需人工補）\n\n```\n' + failures.map((f) => `${f.id} ${f.name} — ${f.reason}`).join('\n') + '\n```\n' : '',
  ];
  fs.writeFileSync(REPORT, `${md.join('\n')}\n`);

  console.log('');
  console.log(`✅ 成功 ${ok} · 失敗 ${failed} · 累計 ${all.length}`);
  console.log('📄 src/data/birdFacts.json');
  console.log('📄 reports/facts-report.md');
}

main().catch((e) => {
  console.error('❌ 執行失敗：', e);
  process.exit(1);
});
