#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 更新 eBird/Clements 分類表（康奈爾權威來源）
 * ============================================================
 *  權威鏈：eBird / Clements Checklist（Cornell Lab of Ornithology）
 *          ← 英文名、學名、目、科、species code 全部以此為準
 *          中文名只作「顯示用」，由中文維基以「學名」反查，永不反向改英文。
 *
 *  正式做法（建議）：用你自己的 eBird API key 抓「官方即時版」
 *      EBIRD_API_KEY=xxxx node scripts/cards/update-ebird-taxonomy.mjs --api
 *
 *  後備做法 1（免 key）：用 GitHub 上已存的 Clements CSV 快照
 *      node scripts/cards/update-ebird-taxonomy.mjs            # 預設 v2024
 *      node scripts/cards/update-ebird-taxonomy.mjs --year 2023
 *
 *  後備做法 2（完全離線）：用你已經下載好的 CSV
 *      node scripts/cards/update-ebird-taxonomy.mjs --file ~/Downloads/ebird_taxonomy_v2024.csv
 *
 *  輸出：src/data/ebird-taxonomy.csv（6 欄、只得 species 級，體積可控）
 *        SPECIES_CODE,PRIMARY_COM_NAME,SCI_NAME,ORDER,FAMILY,TAXON_ORDER
 *        TAXON_ORDER = eBird/Clements 的演化排序號；
 *        前端「跟 eBird 排序」就靠這個數字，唔需要自己砌目→科的次序。
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'src/data/ebird-taxonomy.csv');
const META = path.join(ROOT, 'src/data/ebird-taxonomy.meta.json');

/**
 * 有些環境（公司／學校代理、雲端沙盒）的 Node 憑證庫不完整，
 * 導致 fetch 報 UNABLE_TO_VERIFY_LEAF_SIGNATURE。這裡改用系統 CA 做後備，
 * 只在 fetch 失敗時才啟用（不會靜默停用憑證檢查）。
 */
async function robustFetch(url, headers = {}) {
  try {
    return await fetch(url, { headers });
  } catch (err) {
    if (!/CERT|UNABLE_TO_VERIFY|self.signed/i.test(String(err?.cause?.code || err?.message))) throw err;
    return await new Promise((resolve, reject) => {
      https
        .get(url, { headers, ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt') }, (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8');
            resolve({
              ok: (res.statusCode || 0) < 400,
              status: res.statusCode || 0,
              text: async () => body,
              json: async () => JSON.parse(body),
            });
          });
        })
        .on('error', reject);
    });
  }
}

const ARGS = process.argv.slice(2);
const arg = (n, d) => {
  const i = ARGS.indexOf(n);
  return i >= 0 ? ARGS[i + 1] : d;
};
const useApi = ARGS.includes('--api');
const LOCAL_FILE = arg('--file', '');
const YEAR = arg('--year', '2024');
const SNAPSHOT_REPO = 'OleksiiDubovyk/eBird-taxonomy';

/** 極簡 CSV 解析（支援引號內逗號／換行） */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const s = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (field !== '' || row.length) {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      }
      if (ch === '\r' && s[i + 1] === '\n') i += 1;
    } else field += ch;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function toCsv(rows) {
  const cell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
}

async function fetchSnapshot() {
  const file = `ebird_taxonomy_v${YEAR}.csv`;
  console.log(`📡 取得 Clements 快照：${SNAPSHOT_REPO}/${file}`);
  // raw.githubusercontent 在本環境不可用 → 走 GitHub contents API（Base64）
  const meta = await robustFetch(`https://api.github.com/repos/${SNAPSHOT_REPO}/contents/${file}`, {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'AvianDex',
  }).then((r) => r.json());
  if (!meta?.sha) throw new Error(`找不到 ${file}（${meta?.message || 'unknown'}）`);
  const blob = await robustFetch(`https://api.github.com/repos/${SNAPSHOT_REPO}/git/blobs/${meta.sha}`, {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'AvianDex',
  }).then((r) => r.json());
  if (!blob?.content) throw new Error('讀取 blob 失敗');
  return Buffer.from(blob.content, 'base64').toString('utf8');
}

async function fetchOfficialApi() {
  const key = process.env.EBIRD_API_KEY;
  if (!key) throw new Error('--api 需要 EBIRD_API_KEY（免費申請：https://ebird.org/api/keygen）');
  console.log('📡 由 eBird 官方 API 取得即時分類表…');
  const res = await robustFetch('https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=en', {
    'X-eBirdApiToken': key,
    'User-Agent': 'AvianDex',
  });
  if (!res.ok) throw new Error(`eBird API ${res.status}（key 無效或未啟用？）`);
  const list = await res.json();
  // API 回傳 JSON；轉成與 Clements CSV 相同的欄位
  return [
    'CATEGORY,SPECIES_CODE,PRIMARY_COM_NAME,SCI_NAME,ORDER,FAMILY,TAXON_ORDER',
    ...list.map((t) =>
      [t.category, t.speciesCode, t.comName, t.sciName, t.order, t.familyComName || t.familySciName, t.taxonOrder]
        .map((v) => (String(v ?? '').includes(',') ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? '')))
        .join(','),
    ),
  ].join('\n');
}

async function main() {
  let raw;
  let sourceLabel;
  if (LOCAL_FILE) {
    const abs = path.resolve(LOCAL_FILE.replace(/^~/, process.env.HOME || '~'));
    if (!fs.existsSync(abs)) throw new Error(`找不到本機檔案：${abs}`);
    console.log(`📂 使用本機 CSV：${abs}`);
    raw = fs.readFileSync(abs, 'utf8');
    sourceLabel = `local file: ${path.basename(abs)}`;
  } else if (useApi) {
    raw = await fetchOfficialApi();
    sourceLabel = 'eBird API /v2/ref/taxonomy/ebird';
  } else {
    raw = await fetchSnapshot();
    sourceLabel = `${SNAPSHOT_REPO}/ebird_taxonomy_v${YEAR}.csv`;
  }
  const rows = parseCsv(raw);
  const header = rows.shift();
  const idx = (name) => header.indexOf(name);
  const iCat = idx('CATEGORY');
  const iCode = idx('SPECIES_CODE');
  const iName = idx('PRIMARY_COM_NAME');
  const iSci = idx('SCI_NAME');
  const iOrder = idx('ORDER');
  const iFamily = idx('FAMILY');
  const iTaxonOrder = idx('TAXON_ORDER');
  // 精簡版 CSV 沒有 CATEGORY 欄 → 當作全部都是 species
  const hasCategory = iCat >= 0;
  if ([iCode, iName, iSci, iOrder, iFamily].some((i) => i < 0)) {
    throw new Error('分類表欄位不符預期（需要 SPECIES_CODE/PRIMARY_COM_NAME/SCI_NAME/ORDER/FAMILY），請檢查來源');
  }

  const outRows = [['SPECIES_CODE', 'PRIMARY_COM_NAME', 'SCI_NAME', 'ORDER', 'FAMILY', 'TAXON_ORDER']];
  let species = 0;
  for (const r of rows) {
    if (hasCategory && r[iCat] !== 'species') continue;
    const sci = (r[iSci] || '').trim();
    const name = (r[iName] || '').trim();
    if (!sci || !name) continue;
    const order = iTaxonOrder >= 0 ? (r[iTaxonOrder] || '').trim() : '';
    outRows.push([(r[iCode] || '').trim(), name, sci, (r[iOrder] || '').trim(), (r[iFamily] || '').trim(), order]);
    species += 1;
  }

  // 沒有 TAXON_ORDER 的來源 → 用原始行序（Clements 本身已按演化排序）
  if (outRows.length > 1 && outRows[1][5] === '') {
    for (let i = 1; i < outRows.length; i += 1) outRows[i][5] = String(i);
  }

  const csv = toCsv(outRows);
  fs.writeFileSync(OUT, csv);
  fs.writeFileSync(
    META,
    `${JSON.stringify(
      {
        source: sourceLabel,
        authority: 'eBird / Clements Checklist (Cornell Lab of Ornithology)',
        retrievedAt: new Date().toISOString(),
        speciesCount: species,
        bytes: Buffer.byteLength(csv),
        note: LOCAL_FILE
          ? '由本機 CSV 轉換（離線）。'
          : useApi
            ? '由 eBird 官方 API 即時取得。'
            : 'GitHub 上的 Clements 快照（免 key）。正式版建議用 --api 以你的 key 取得即時分類。',
      },
      null,
      2,
    )}\n`,
  );

  console.log(`✅ 寫入 ${path.relative(ROOT, OUT)}`);
  console.log(`   物種 ${species} 筆 · ${(Buffer.byteLength(csv) / 1024).toFixed(0)} KB`);
  console.log(`   來源：${sourceLabel}`);
}

main().catch((e) => {
  console.error('❌ 更新失敗：', e.message);
  process.exit(1);
});
