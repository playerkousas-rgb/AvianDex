#!/usr/bin/env node
/* ============================================================
 *  AvianDex — 批量生成「抽樣清單」（給 Gemini 批次做卡面文案）
 * ------------------------------------------------------------
 *  為什麼要這支？
 *    559 張卡逐張貼 prompt 到 Gemini，貼到手軟、又容易漏。
 *    這裡一次過把 N 張卡的生資料＋Prompt 打包成 Markdown，
 *    你一個檔案貼（或上載）給 Gemini，它回一段 JSON，再餵回
 *    `--apply` 寫入。全程不需要 API KEY，也不需要這台機器上網。
 *
 *  用法：
 *    npm run cards:batch -- --from 1 --count 10            # 產生 batch-0001-0010.md
 *    npm run cards:batch -- --ids 0008,0290                # 指定編號
 *    npm run cards:batch -- --from 1 --count 10 --lang en  # 只出英文
 *    npm run cards:batch -- --apply out.json               # 把 Gemini 回的 JSON 寫入
 *    npm run cards:batch -- --apply out.json --dry         # 只看差異，不寫入
 *    npm run cards:batch -- --missing-only                 # 只抽「有缺欄」的卡
 *    npm run cards:batch -- --report                       # 覆蓋率報告（Markdown 表格）
 *
 *  輸出位置：data/batches/（已在 .gitignore，屬本機工作檔）
 *
 *  ⚠️ 鐵律：不准 AI 代寫未查證內容。每張卡的 prompt 都要求
 *     「查不到就留空」，套用時空字串會被當成「保留原值」，
 *     不會因為 AI 回空而清走已經校對好的中文。
 * ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT_DIR = path.join(ROOT, 'data', 'batches');

const argv = process.argv.slice(2);
const arg = (k, d = null) => {
  const i = argv.indexOf(k);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (k) => argv.includes(k);

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const birds = readJson(path.join(DATA, 'birds.json'));
const tax = readJson(path.join(DATA, 'birdTaxonomy.json'));
const copy = readJson(path.join(DATA, 'cardCopy.json'));
const taxZh = readJson(path.join(DATA, 'taxonomyZh.json'));

const ids = Object.keys(copy).filter((k) => /^\d{4}$/.test(k)).sort();
const byId = new Map(birds.map((b) => [b.id, b]));

/** 我們要 AI 填的欄位（中英各一組，內容必須一樣，只是語言不同） */
const FIELDS = [
  { id: 'look', zh: '外形特徵', en: 'Appearance', max: 74 },
  { id: 'diet', zh: '食物', en: 'Diet', max: 46 },
  { id: 'habitat', zh: '棲息環境', en: 'Habitat', max: 46 },
  { id: 'range', zh: '分佈地區', en: 'Distribution', max: 46 },
  { id: 'breeding', zh: '成長與繁殖', en: 'Breeding', max: 160 },
  { id: 'funFact', zh: '有趣冷知識', en: 'Fun fact', max: 60 },
  { id: 'voice', zh: '鳴聲', en: 'Voice', max: 60 },
  { id: 'behavior', zh: '行為習性', en: 'Behaviour', max: 60 },
  { id: 'migration', zh: '遷徙', en: 'Migration', max: 60 },
  { id: 'conservation', zh: '保育現況', en: 'Conservation', max: 70 },
  { id: 'humanRelation', zh: '人與鳥', en: 'Birds & people', max: 70 },
  { id: 'etymology', zh: '名稱由來', en: 'Name origin', max: 90 },
];

const has = (v) => (Array.isArray(v) ? v.length > 0 : String(v ?? '').trim().length > 0);

/** 中英文現況 */
function statusOf(id) {
  const c = copy[id] || {};
  const fc = Array.isArray(c.fieldCopy) ? c.fieldCopy : [];
  const zh = {};
  const en = {};
  for (const f of FIELDS) {
    zh[f.id] = has(c[f.id]);
    const hit = fc.find((x) => x && x.id === f.id);
    en[f.id] = Boolean(hit && has(hit.en));
  }
  return { zh, en };
}

const zhCount = (id) => FIELDS.filter((f) => statusOf(id).zh[f.id]).length;
const enCount = (id) => FIELDS.filter((f) => statusOf(id).en[f.id]).length;

/* ---------- 選卡 ---------- */
function pickIds() {
  const explicit = arg('--ids');
  if (explicit) return explicit.split(',').map((s) => s.trim().padStart(4, '0'));
  let pool = ids;
  if (flag('--missing-only')) {
    pool = pool.filter((id) => FIELDS.some((f) => !statusOf(id).zh[f.id] || !statusOf(id).en[f.id]));
  }
  if (flag('--en-missing-only')) pool = pool.filter((id) => FIELDS.some((f) => !statusOf(id).en[f.id]));
  const from = Number(arg('--from', '1'));
  const count = Number(arg('--count', '10'));
  if (arg('--from')) {
    const startIdx = Math.max(0, pool.findIndex((id) => Number(id) >= from));
    return pool.slice(startIdx, startIdx + count);
  }
  return pool.slice(0, count);
}

/* ---------- Prompt ---------- */
function cardBlock(id, lang) {
  const b = byId.get(id) || {};
  const t = tax[id] || {};
  const orderZh = t.orderZh || taxZh.orders?.[t.order] || '';
  const familyZh = t.familyZh || taxZh.families?.[t.family] || '';
  const st = statusOf(id);

  const need = FIELDS.map((f) => {
    const zhOk = st.zh[f.id];
    const enOk = st.en[f.id];
    const mark = lang === 'en'
      ? (enOk ? '（已有，可略）' : '（缺）')
      : (zhOk ? '（已有，可略）' : '（缺）');
    return `  - ${lang === 'en' ? f.en : f.zh} (${f.id})${mark} ≤${f.max} 字`;
  }).join('\n');

  return `### NO.${id}｜${b.name || ''}｜${t.comName || b.en || ''}
- 學名：${t.sciName || '—'}
- 目／科：${orderZh} ${t.order || ''}／${familyZh} ${t.family || ''}
- eBird 代碼：${t.speciesCode || '—'}
- 中文來源：zh.wikipedia《${b.name || ''}》｜英文來源：en.wikipedia《${t.comName || b.en || ''}》
- 要填的欄位：
${need}`;
}

function buildBatch(idsList, lang) {
  const langName = lang === 'en' ? 'English' : '香港繁體中文（zh-HK）';
  const head = `# AvianDex 批量卡面文案 — ${idsList.length} 張（${lang === 'en' ? 'EN' : 'ZH'}）

你是鳥類圖鑑編輯。請**只用維基百科（zh / en）＋ eBird／Clements 的資料**，
逐張卡填下面欄位。規則：

1. 每個欄位**只寫你查得到的事實**；查不到就回 \`""\`（空字串），**絕對不可以猜、不可以寫「資料待查」進去**。
2. 語言：${lang === 'en' ? '全英文，不要出現中文字。' : '香港繁體（zh-HK），不准簡體字、不准書面語以外的機翻腔。'}
3. 每個欄位有字數上限，超出的話**寧願刪走細節，不要刪走主語**。
4. 不要寫「據維基百科」之類；不要加形容詞堆砌。
5. 只回**一段 JSON**（不要 markdown code fence、不要解釋），格式：

\`\`\`
{
  "0008": { "look": "...", "diet": "...", "habitat": "...", "range": "...",
            "breeding": "...", "funFact": "...", "voice": "...", "behavior": "...",
            "migration": "...", "conservation": "...", "humanRelation": "...", "etymology": "..." },
  "0290": { ... }
}
\`\`\`

唔肯定邊隻雀，就跳過該卡（不要留半句）。

---

`;
  return head + idsList.map((id) => cardBlock(id, lang)).join('\n\n') + '\n';
}

/* ---------- 套用 Gemini 回覆 ---------- */
function apply(file, dry) {
  const rawText = fs.readFileSync(file, 'utf8');
  /* 容忍 code fence 與前後雜字：抓最外層的 { ... } */
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  if (start < 0 || end <= start) {
    console.error('✗ 找不到 JSON 物件');
    process.exit(1);
  }
  let parsed;
  try {
    parsed = JSON.parse(rawText.slice(start, end + 1));
  } catch (e) {
    console.error('✗ JSON 解析失敗：' + e.message);
    process.exit(1);
  }

  const changed = [];
  const skipped = [];
  for (const [rawId, fields] of Object.entries(parsed)) {
    const id = rawId.padStart(4, '0');
    if (!copy[id]) { skipped.push(`${id}（無此卡）`); continue; }
    const c = copy[id];
    let touched = 0;
    for (const f of FIELDS) {
      const v = fields[f.id];
      if (!has(v)) continue;                 /* 空 → 保留原值，不覆蓋 */
      const text = String(Array.isArray(v) ? v.join('；') : v).trim().slice(0, f.max * 4);
      const isEn = /^[A-Za-z0-9 ,.'"()\-–—:;/&%+…’‘“”]+$/.test(text) && !/[\u4e00-\u9fff]/.test(text);

      if (isEn) {
        /* 英文 → fieldCopy[].en */
        let fc = Array.isArray(c.fieldCopy) ? c.fieldCopy : [];
        const hit = fc.find((x) => x && x.id === f.id);
        if (hit) {
          if (hit.en === text) continue;
          hit.en = text;
        } else {
          fc.push({ id: f.id, en: text });
        }
        c.fieldCopy = fc;
      } else {
        /* 中文 → 直接欄位（與卡面一致） */
        if (c[f.id] === text) continue;
        c[f.id] = text;
      }
      touched++;
    }
    if (touched) changed.push(`${id}(${touched})`);
  }

  if (!dry) fs.writeFileSync(path.join(DATA, 'cardCopy.json'), JSON.stringify(copy, null, 2) + '\n', 'utf8');
  console.log(`${dry ? '（演習）' : '✅'} 更新 ${changed.length} 張：${changed.slice(0, 20).join(' ')}${changed.length > 20 ? ' …' : ''}`);
  if (skipped.length) console.log(`⚠️ 跳過：${skipped.slice(0, 10).join(' ')}`);
  if (!dry) console.log('下一步：npm run cards:data && npm run cards:studio && npm test');
}

/* ---------- 覆蓋率報告 ---------- */
function report() {
  const rows = ids.map((id) => ({
    id,
    name: (byId.get(id) || {}).name || '',
    zh: zhCount(id),
    en: enCount(id),
  }));
  const enMissing = rows.filter((r) => r.en < FIELDS.length);
  const zhMissing = rows.filter((r) => r.zh < FIELDS.length);
  const both = rows.filter((r) => r.en < 5 && r.zh < 5);

  const bar = (n) => '█'.repeat(n) + '░'.repeat(FIELDS.length - n);
  const md = [
    '### 卡面文案：中英覆蓋率',
    '',
    `- 卡片：**${ids.length}**`,
    `- 英文全齊（12 欄）：**${ids.length - enMissing.length}**`,
    `- 中文全齊（12 欄）：**${ids.length - zhMissing.length}**`,
    `- 兩邊都少過 5 欄（最需要補）：**${both.length}**`,
    '',
    '| 欄位 | 英文缺 | 中文缺 |',
    '|---|---|---|',
    ...FIELDS.map((f) => {
      const enMissingN = ids.filter((id) => !statusOf(id).en[f.id]).length;
      const zhMissingN = ids.filter((id) => !statusOf(id).zh[f.id]).length;
      return `| ${f.id}（${f.zh}） | ${enMissingN} | ${zhMissingN} |`;
    }),
    '',
    '最缺的 15 張（英文／中文）：',
    '',
    ...rows
      .sort((a, b) => a.en - b.en || a.zh - b.zh)
      .slice(0, 15)
      .map((r) => `- ${r.id} ${r.name}　EN ${bar(r.en)} ${r.en}/12　ZH ${r.zh}/12`),
  ];
  console.log(md.join('\n'));
}

/* ---------- 主流程 ---------- */
if (flag('--report')) {
  report();
} else if (arg('--apply')) {
  apply(arg('--apply'), flag('--dry'));
} else {
  const list = pickIds();
  const lang = arg('--lang', 'both');
  const langs = lang === 'both' ? ['zh', 'en'] : [lang];
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const lg of langs) {
    const name = `batch-${list[0]}-${list[list.length - 1]}-${lg}.md`;
    const p = path.join(OUT_DIR, name);
    fs.writeFileSync(p, buildBatch(list, lg), 'utf8');
    console.log(`✅ ${path.relative(ROOT, p)}（${list.length} 張，${(fs.statSync(p).size / 1024).toFixed(0)} KB）`);
  }
  console.log('   把檔案貼（或上載）給 Gemini → 回覆存成 out.json → npm run cards:batch -- --apply out.json');
}
