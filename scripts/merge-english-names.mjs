#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 把 BIRD_ID_MAPPING.csv 的英文名併入 birds.json
 * ============================================================
 *  為什麼要？圖鑑右邊「科研中心」六個連結（All About Birds / Flickr /
 *  YouTube / Xeno-canto）全部用英文俗名搜尋，但舊版用中文名塞入網址，
 *  結果每次都係「查無此鳥」。本腳本補上 `en` 欄位，前端就有英文名可用。
 *
 *  用法：node scripts/merge-english-names.mjs [--dry]
 * ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSV = path.join(ROOT, 'BIRD_ID_MAPPING.csv');
const BIRDS = path.join(ROOT, 'src/data/birds.json');
const DRY = process.argv.includes('--dry');

/** 極簡 CSV 解析（支援 "..." 包住含逗號的欄位） */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (field !== '' || row.length) {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      }
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function main() {
  if (!fs.existsSync(CSV)) throw new Error(`找不到 ${path.basename(CSV)}`);
  const rows = parseCsv(fs.readFileSync(CSV, 'utf8'));
  const header = rows.shift().map((h) => h.trim());
  const idxId = header.indexOf('ID');
  const idxEn = header.indexOf('英文名');
  const idxZh = header.indexOf('中文名');
  if (idxId < 0 || idxEn < 0) throw new Error('CSV 缺少 ID / 英文名 欄位');

  const enById = new Map();
  for (const row of rows) {
    const id = String(row[idxId] || '').trim().padStart(4, '0');
    const en = String(row[idxEn] || '').trim();
    if (!/^\d{4}$/.test(id) || !en) continue;
    enById.set(id, en);
  }

  const birds = JSON.parse(fs.readFileSync(BIRDS, 'utf8'));
  let added = 0;
  let fixed = 0;
  for (const bird of birds) {
    const en = enById.get(bird.id);
    if (!en) continue;
    if (!bird.en) {
      bird.en = en;
      added += 1;
    } else if (bird.en !== en) {
      bird.en = en;
      fixed += 1;
    }
    // 中文名空白／仍是英文時，用 CSV 的中文名補
    const zh = String(rows.find((r) => String(r[idxId]).trim().padStart(4, '0') === bird.id)?.[idxZh] || '').trim();
    if (zh && (!bird.name || /^[A-Za-z -]+$/.test(bird.name))) {
      bird.name = zh;
    }
  }

  console.log(`📚 CSV：${enById.size} 個英文名`);
  console.log(`🪶 birds.json：${birds.length} 筆 → 新增 ${added}、更新 ${fixed}`);
  const withoutEn = birds.filter((b) => !b.en).length;
  if (withoutEn) console.log(`⚠️  仍有 ${withoutEn} 筆沒有英文名（可手動補）`);

  if (DRY) {
    console.log(JSON.stringify(birds.slice(0, 5), null, 2));
    return;
  }
  fs.writeFileSync(BIRDS, `${JSON.stringify(birds, null, 2)}\n`);
  console.log('✅ 已寫入 src/data/birds.json');
}

main();
