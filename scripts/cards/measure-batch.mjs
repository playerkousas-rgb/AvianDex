#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 量度值批量補齊（給 Gemini／你本機那套跑）
 * ------------------------------------------------------------
 *  為什麼另開一支？
 *    身長／體重這一類「數字」同「文字」係兩種工作：
 *      · 文字：維基原文抽取（cards:batch 已做）
 *      · 數字：必須有量度來源（AVONET / Birds of the World），不能推
 *    而且用戶明確要求：**不換算，直接印 mm／g**。
 *
 *  用法：
 *    npm run cards:measure -- --from 1 --count 40     # 產生 40 張的量度清單
 *    npm run cards:measure -- --ids 0008,0013         # 指定編號
 *    npm run cards:measure -- --apply out.json        # 寫入 src/data/measurements.json
 *    npm run cards:measure -- --apply out.json --dry  # 只看會改什麼
 *    npm run cards:measure -- --report                # 覆蓋率
 *
 *  輸出：data/batches/measure-XXXX-YYYY.md（已 gitignore，屬本機工作檔）
 *
 *  ⚠️ 鐵律
 *    1. 只准填 AVONET（Tobias et al. 2022, CC BY 4.0）或 Birds of the World 的量度。
 *    2. 單位固定：wing／tail／tarsus／bill 用 **mm**，mass 用 **g**。
 *    3. **不准換算**（唔准把 mm 變 cm、唔准由翼長推身長）。
 *    4. 查不到就回 ""（空字串），套用時空字串＝保留原值，唔會清走已有資料。
 *    5. 一定要回 source（"AVONET" 或 "BoW"），冇 source 的數字一律不採用。
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT_DIR = path.join(ROOT, 'data', 'batches');
const MEASURE_FILE = path.join(DATA, 'measurements.json');

const argv = process.argv.slice(2);
const arg = (k, d = null) => {
  const i = argv.indexOf(k);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (k) => argv.includes(k);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const birds = readJson(path.join(DATA, 'birds.json'));
const tax = readJson(path.join(DATA, 'birdTaxonomy.json'));
const existing = fs.existsSync(MEASURE_FILE) ? readJson(MEASURE_FILE) : {};

const byId = new Map(birds.map((b) => [b.id, b]));
const ids = birds.map((b) => b.id).sort();

/** 五個量度欄位。單位寫死在這裡，避免 AI 自己換算。 */
const TRAITS = [
  { id: 'wing', zh: '翼長', en: 'Wing length', unit: 'mm', min: 30, max: 2500 },
  { id: 'tail', zh: '尾長', en: 'Tail length', unit: 'mm', min: 10, max: 1500 },
  { id: 'tarsus', zh: '跗跖長', en: 'Tarsus length', unit: 'mm', min: 5, max: 400 },
  { id: 'bill', zh: '喙長', en: 'Bill length', unit: 'mm', min: 3, max: 600 },
  { id: 'mass', zh: '體重', en: 'Body mass', unit: 'g', min: 1, max: 20000 },
];

const filled = (id) => {
  const m = existing[id];
  if (!m) return 0;
  return TRAITS.filter((t) => String(m[t.id] ?? '').trim()).length;
};

/* ---------- 選卡 ---------- */
function pickIds() {
  const explicit = arg('--ids');
  if (explicit) return explicit.split(',').map((s) => s.trim().padStart(4, '0'));
  let pool = ids;
  if (flag('--missing-only')) pool = pool.filter((id) => filled(id) < TRAITS.length);
  if (flag('--empty-only')) pool = pool.filter((id) => filled(id) === 0);
  const count = Number(arg('--count', '40'));
  const from = Number(arg('--from', '1'));
  const start = Math.max(0, pool.findIndex((id) => Number(id) >= from));
  return pool.slice(start === -1 ? 0 : start, (start === -1 ? 0 : start) + count);
}

/* ---------- Prompt ---------- */
function block(id) {
  const b = byId.get(id) || {};
  const t = tax[id] || {};
  const m = existing[id] || {};
  const have = TRAITS.filter((x) => String(m[x.id] ?? '').trim())
    .map((x) => `${x.id}=${m[x.id]}${x.unit}`)
    .join(' ') || '（全缺）';
  return `### NO.${id}｜${b.name || ''}｜${t.comName || b.en || ''}
- 學名：${t.sciName || '—'}
- eBird 代碼：${t.speciesCode || '—'}
- 現有量度：${have}`;
}

function build(idsList) {
  const head = `# AvianDex 量度值補齊 — ${idsList.length} 隻

你是鳥類圖鑑的資料編輯。請只使用 **AVONET（Tobias et al. 2022, Ecology Letters, CC BY 4.0）**
或 **Birds of the World（Cornell Lab）** 的量度數據，逐隻填下面五個數字。

規則（缺一不可）：

1. **單位固定**：wing／tail／tarsus／bill 一律 **mm**，mass 一律 **g**。
2. **不准換算**：不要把 mm 轉 cm、不要由翼長推身長、不要加減。
   AVONET 的 species mean 就直接抄 species mean。
3. 每個數字只填**數值**（例如 \`118.4\`），不要寫單位、不要寫範圍、不要寫約數。
   如果來源給的是範圍（例如 110–125），填中位數並在該隻的 \`note\` 寫明是範圍。
4. **查不到就回空字串 \`""\`**，不要猜、不要用近親代替。
5. 每隻一定要回 \`source\`：\`"AVONET"\` 或 \`"BoW"\`。冇 source 的數字一律作廢。
6. 只回**一段 JSON**（不要 markdown code fence、不要解釋）：

\`\`\`
{
  "0013": { "wing": "118.4", "tail": "72.1", "tarsus": "30.5", "bill": "24.0", "mass": "132.0", "source": "AVONET" },
  "0290": { "wing": "", "tail": "", "tarsus": "", "bill": "", "mass": "", "source": "" }
}
\`\`\`

唔肯定邊隻雀（同名異種、學名對不上），就整隻跳過，不要留半套數字。

---

`;
  return head + idsList.map(block).join('\n\n') + '\n';
}

/* ---------- 套用 ---------- */
function isNum(v) {
  return /^\d+(\.\d+)?$/.test(String(v ?? '').trim());
}

function apply(file, dry) {
  const raw = fs.readFileSync(file, 'utf8');
  const s = raw.indexOf('{');
  const e = raw.lastIndexOf('}');
  if (s < 0 || e <= s) { console.error('✗ 找不到 JSON 物件'); process.exit(1); }
  let parsed;
  try {
    parsed = JSON.parse(raw.slice(s, e + 1));
  } catch (err) {
    console.error('✗ JSON 解析失敗：' + err.message);
    process.exit(1);
  }

  const out = { ...existing };
  const changed = [];
  const rejected = [];

  for (const [rawId, v] of Object.entries(parsed)) {
    const id = String(rawId).padStart(4, '0');
    if (!byId.has(id)) { rejected.push(`${id}(無此卡)`); continue; }
    const source = String(v.source ?? '').trim();
    if (!['AVONET', 'BoW'].includes(source)) { rejected.push(`${id}(無 source)`); continue; }
    const rec = { ...(out[id] || {}), source };
    let n = 0;
    for (const t of TRAITS) {
      const val = String(v[t.id] ?? '').trim();
      if (!val) continue;
      if (!isNum(val)) { rejected.push(`${id}.${t.id}(${val}非數值)`); continue; }
      // 防呆：超出鳥類合理範圍就當 AI 抄錯（例如把 cm 當 mm、把 kg 當 g）
      const num = Number(val);
      if (num < t.min || num > t.max) {
        rejected.push(`${id}.${t.id}(${val}${t.unit}超範圍)`);
        continue;
      }
      rec[t.id] = val;
      n += 1;
    }
    if (v.note) rec.note = String(v.note).slice(0, 120);
    if (n === 0) continue;
    out[id] = rec;
    changed.push(`${id}(${n})`);
  }

  if (!dry) {
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(MEASURE_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
  }
  console.log(`${dry ? '（演習）' : '✅'} 更新 ${changed.length} 隻：${changed.slice(0, 25).join(' ')}${changed.length > 25 ? ' …' : ''}`);
  if (rejected.length) console.log(`⚠️ 拒絕 ${rejected.length} 項：${rejected.slice(0, 10).join(' ')}`);
  if (!dry) console.log('下一步：npm run cards:info -- 0013（重新出卡）／ npm test');
}

/* ---------- 覆蓋率 ---------- */
function report() {
  const rows = ids.map((id) => ({ id, n: filled(id) }));
  console.log('量度覆蓋率（每隻 5 項：翼／尾／跗跖／喙／體重）');
  for (let k = 0; k <= 5; k += 1) {
    const n = rows.filter((r) => r.n === k).length;
    console.log(`  ${k}/5 項：${String(n).padStart(4)} 隻  ${'█'.repeat(Math.round(n / 12))}`);
  }
  const full = rows.filter((r) => r.n === 5).map((r) => r.id);
  const none = rows.filter((r) => r.n === 0).map((r) => r.id);
  console.log(`\n全齊 ${full.length} 隻${full.length ? '：' + full.slice(0, 12).join(' ') : ''}`);
  console.log(`全缺 ${none.length} 隻`);
  if (none.length) console.log(`建議下一批：npm run cards:measure -- --ids ${none.slice(0, 30).join(',')}`);
}

/* ---------- main ---------- */
if (flag('--apply')) {
  apply(arg('--apply'), flag('--dry'));
} else if (flag('--report')) {
  report();
} else {
  const list = pickIds();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `measure-${list[0]}-${list[list.length - 1]}.md`);
  fs.writeFileSync(file, build(list), 'utf8');
  console.log(`✅ ${path.relative(ROOT, file)}  （${list.length} 隻：${list[0]} → ${list[list.length - 1]}）`);
  console.log('把這個檔案上載給 Gemini，回傳的 JSON 存成 measure-out.json，再跑：');
  console.log(`   npm run cards:measure -- --apply measure-out.json --dry   # 先看差異`);
  console.log(`   npm run cards:measure -- --apply measure-out.json         # 寫入`);
}
