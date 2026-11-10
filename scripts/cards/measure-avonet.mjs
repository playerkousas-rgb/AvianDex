#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 由 AVONET CSV 直接填量度值（唔經 AI）
 * ------------------------------------------------------------
 *  為甚麼有這支？
 *    AVONET（Tobias et al. 2022, Ecology Letters, CC BY 4.0）係
 *    公開下載的 CSV，用學名 join 一次過填完 559 隻，唔會抄錯。
 *
 *  取得 CSV：
 *    https://figshare.com/collections/AVONET/5539615
 *    下載 AVONET_BirdLife.csv（約 11,000 行）放到本機任何位置。
 *
 *  用法（Windows 建議用反斜線或引號）：
 *    npm run cards:measure:avonet -- "C:\Users\User\Downloads\AVONET_BirdLife.csv"
 *    npm run cards:measure:avonet -- "C:\...\AVONET_BirdLife.csv" --dry
 *    npm run cards:measure:avonet -- "C:\...\AVONET_BirdLife.csv" --report
 *
 *  ⚠️ 規則（與 measure-batch 一致）
 *    · 單位不換算：Wing.Length / Tail.Length / Tarsus.Length / Beak.Length_Culmen 係 mm，Mass 係 g
 *    · 只填 AVONET 有值的物種；學名對不上就跳過，不會用近親代替
 *    · 數值超出鳥類合理範圍一律拒絕（防單位錯誤）
 *    · 每次寫入前自動備份 src/data/measurements.json
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const MEASURE_FILE = path.join(DATA, 'measurements.json');

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const dry = argv.includes('--dry');
const reportOnly = argv.includes('--report');

if (!file) {
  console.error(`用法：npm run cards:measure:avonet -- "C:\\path\\to\\AVONET_BirdLife.csv"

取得 CSV：https://figshare.com/collections/AVONET/5539615
下載 AVONET_BirdLife.csv，然後把上面路徑換成你本機的位置。`);
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`✗ 找不到檔案：${file}`);
  process.exit(1);
}

/* ---------- 極簡 CSV 解析（支援引號內逗號／換行） ---------- */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; } else { quoted = false; }
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
const grid = parseCsv(raw);
if (grid.length < 2) {
  console.error('✗ CSV 內容太少，請確認是 AVONET_BirdLife.csv');
  process.exit(1);
}

const header = grid[0].map((h) => h.trim());
const col = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
const need = ['Species1', 'Wing.Length', 'Tail.Length', 'Tarsus.Length', 'Beak.Length_Culmen', 'Mass'];
const missing = need.filter((n) => col(n) < 0);
if (missing.length) {
  console.error(`✗ 這個 CSV 缺少欄位：${missing.join('、')}`);
  console.error(`   找到的欄位：${header.slice(0, 12).join(', ')} …`);
  process.exit(1);
}

/* ---------- 建立學名索引 ---------- */
const idx = {
  species1: col('Species1'),
  wing: col('Wing.Length'),
  tail: col('Tail.Length'),
  tarsus: col('Tarsus.Length'),
  bill: col('Beak.Length_Culmen'),
  mass: col('Mass'),
  species2: col('Species2') >= 0 ? col('Species2') : -1,
  species3: col('Species3') >= 0 ? col('Species3') : -1,
};

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const bySci = new Map();
for (let r = 1; r < grid.length; r += 1) {
  const line = grid[r];
  if (!line || !line.length) continue;
  for (const key of ['species1', 'species2', 'species3']) {
    const i = idx[key];
    if (i < 0) continue;
    const sci = norm(line[i]);
    if (!sci || bySci.has(sci)) continue;
    bySci.set(sci, line);
  }
}

/* ---------- 我們的 559 隻 ---------- */
const tax = JSON.parse(fs.readFileSync(path.join(DATA, 'birdTaxonomy.json'), 'utf8'));
const birds = JSON.parse(fs.readFileSync(path.join(DATA, 'birds.json'), 'utf8'));
const existing = fs.existsSync(MEASURE_FILE) ? JSON.parse(fs.readFileSync(MEASURE_FILE, 'utf8')) : {};

const RANGE = {
  wing: [30, 2500],
  tail: [10, 1500],
  tarsus: [5, 400],
  bill: [3, 600],
  mass: [1, 20000],
};

function num(line, i, key) {
  if (i < 0) return '';
  const raw = String(line[i] ?? '').trim();
  if (!raw) return '';
  const v = Number(raw.replace(',', '.'));
  if (!Number.isFinite(v)) return '';
  const [lo, hi] = RANGE[key];
  if (v < lo || v > hi) return '';
  // 保留一位小數，去掉多餘 0（AVONET 原值多數 1 位小數）
  return String(Math.round(v * 10) / 10);
}

const out = { ...existing };
const hit = [];
const missed = [];

for (const b of birds) {
  const t = tax[b.id];
  if (!t || !t.sciName) { missed.push(`${b.id} ${b.name}（無學名）`); continue; }
  const line = bySci.get(norm(t.sciName));
  if (!line) { missed.push(`${b.id} ${b.name} ${t.sciName}`); continue; }
  const rec = {
    source: 'AVONET',
    wing: num(line, idx.wing, 'wing'),
    tail: num(line, idx.tail, 'tail'),
    tarsus: num(line, idx.tarsus, 'tarsus'),
    bill: num(line, idx.bill, 'bill'),
    mass: num(line, idx.mass, 'mass'),
  };
  const n = ['wing', 'tail', 'tarsus', 'bill', 'mass'].filter((k) => rec[k]).length;
  if (n === 0) { missed.push(`${b.id} ${b.name}（AVONET 無量度）`); continue; }
  out[b.id] = rec;
  hit.push(`${b.id}(${n})`);
}

console.log(`CSV：${path.basename(file)}  ·  ${grid.length - 1} 行  ·  ${bySci.size} 個學名`);
console.log(`✅ 對上 ${hit.length} 隻：${hit.slice(0, 20).join(' ')}${hit.length > 20 ? ' …' : ''}`);
console.log(`⚠️ 未對上 ${missed.length} 隻${missed.length ? '（頭 10 個）' : ''}${missed.length ? '：' + missed.slice(0, 10).join(' / ') : ''}`);

if (reportOnly) process.exit(0);

if (dry) {
  console.log('（演習）沒有寫入。確認無誤後去掉 --dry 再跑一次。');
  process.exit(0);
}

if (fs.existsSync(MEASURE_FILE)) {
  const bak = `${MEASURE_FILE}.bak`;
  fs.copyFileSync(MEASURE_FILE, bak);
  console.log(`備份：${path.relative(ROOT, bak)}`);
}
fs.writeFileSync(MEASURE_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');

const filled = Object.values(out).filter((m) => m && m.mass).length;
console.log(`寫入 ${path.relative(ROOT, MEASURE_FILE)}：${Object.keys(out).length} 隻有紀錄，${filled} 隻有體重`);
console.log('下一步：npm run cards:info -- 0013（重新出卡）／ npm test');
